import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from '@google/genai';
import OpenAI from "openai";
import { AgentConfigSystemPrompt } from "@/data/Prompt";
import { AgentConfigRespSchema } from "@/data/ResponseSchema";
import { ensureNeatlogsInit, wrapGoogleGenAI, trace, flush } from "@/lib/neatlogs";
import { AgentConfig, db, tools } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
    const { prompt, timezone } = await req.json();
    const user=await currentUser();

    if (!prompt || !prompt.trim()) {
        return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_CLOUD_GEMINI_API_KEY;

    try {

        const aiTools = await db.select({
            slug: tools.slug
        }).from(tools);

        const hasDbEntire = aiTools.some(t => t.slug.toLowerCase().includes("entire"));
        const baseList = aiTools.map(t => `- ${t.slug}`);
        if (!hasDbEntire) {
            baseList.push('- entire');
        }

        const toolsList = baseList.length > 0 
            ? baseList.join('\n') 
            : "- google_search\n- serp_search\n- browserbase\n- gmail\n- slack\n- google_calendar\n- notion\n- entire";

        await ensureNeatlogsInit();
        const ai = wrapGoogleGenAI(new GoogleGenAI({ apiKey }));

        const result = await trace(
            {
                name: "agent-configurator",
                kind: "AGENT",
                input: { prompt },
            },
            async () => {
                const promptContent = AgentConfigSystemPrompt
                    .replace('{USER_PROMPT}', prompt)
                    .replace('{AVAILABLE_TOOLS}', toolsList);
                let responseText: string | undefined;

                // Healthy Gemini models first (gemini-3.8-flash has a 20 req/day quota limit)
                const candidateModels = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.7-flash'];
                let lastError: any = null;

                for (const model of candidateModels) {
                    try {
                        const response = await ai.models.generateContent({
                            model,
                            contents: promptContent,
                            config: {
                                responseMimeType: "application/json",
                                responseSchema: AgentConfigRespSchema
                            }
                        });
                        if (response.text) {
                            responseText = response.text;
                            break;
                        }
                    } catch (modelErr: any) {
                        console.warn(`[${model}] failed, trying next candidate:`, modelErr?.message || modelErr);
                        lastError = modelErr;
                    }
                }

                // If Gemini models hit 503 high demand or quota limits, fallback to Groq
                if (!responseText && process.env.GROQ_API_KEY) {
                    try {
                        console.log("[agent-configure] Gemini models unavailable, falling back to Groq...");
                        const groq = new OpenAI({
                            apiKey: process.env.GROQ_API_KEY,
                            baseURL: "https://api.groq.com/openai/v1",
                            maxRetries: 0
                        });
                        const groqRes = await groq.chat.completions.create({
                            model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
                            messages: [
                                { role: "system", content: "You are an AI that configures agents. Return only a valid JSON response adhering strictly to the requested format with status: ready and config object containing name, description, instructions, objective, tools, skills, and outputFormat." },
                                { role: "user", content: promptContent }
                            ],
                            response_format: { type: "json_object" }
                        });
                        if (groqRes.choices[0]?.message?.content) {
                            responseText = groqRes.choices[0].message.content;
                        }
                    } catch (groqErr: any) {
                        console.warn("[agent-configure] Groq fallback failed:", groqErr?.message || groqErr);
                    }
                }

                if (!responseText) {
                    throw lastError || new Error("All candidate AI models failed to generate response. Please try again in a few moments.");
                }

                return JSON.parse(responseText ?? '{}');
            }
        );


        // Immediate flush so traces show up on Neatlogs dashboard right away
        await flush().catch((err) => console.warn("[neatlogs] flush warning:", err));

        // saving final agent config
        const aiOutput = result;

        if (aiOutput.status == 'ready' && aiOutput.config) {
            const agentId = crypto.randomUUID();
            const avatarUrl = 'https://api.dicebear.com/10.x/gaze/svg?tags=animation&seed=' + agentId;
            const dbResult = await db.insert(AgentConfig).values({
                ...aiOutput.config,
                agentImage: avatarUrl,
                agentId: agentId,
                userEmail: user?.primaryEmailAddress?.emailAddress,
                schedule: {
                    time: aiOutput?.config?.schedule.time,
                    type: aiOutput?.config?.schedule.type,
                    frequency: aiOutput?.config?.schedule.frequency,
                    timezone: timezone
                }
            }).returning();
            return NextResponse.json({
                ...aiOutput,
                agentId: agentId,
                agentImage: avatarUrl,
                dbResult: dbResult[0],
                status_: 'ready'
            });
        }

        return NextResponse.json(aiOutput);

    } catch (e: any) {
        console.error("Error in agent configure:", e);
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const rawAgent = body.data?.draftAgent || body.draftAgent || body;

        const agentId = rawAgent.agentId;
        const id = rawAgent.id;

        if (!agentId && !id) {
            return NextResponse.json({ error: "agentId or id is required for update" }, { status: 400 });
        }

        // Exclude primary key id and immutable createdAt timestamp string
        const { id: _id, createdAt: _createdAt, ...updateData } = rawAgent;

        const condition = agentId
            ? eq(AgentConfig.agentId, agentId)
            : eq(AgentConfig.id, Number(id));

        const result = await db.update(AgentConfig)
            .set(updateData)
            .where(condition)
            .returning();

        if (!result || result.length === 0) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        console.log("Agent updated successfully:", result[0]?.name);
        return NextResponse.json(result[0]);
    } catch (e: any) {
        console.error("Error in agent configure PUT:", e);
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        let agentList;
        if (userEmail) {
            agentList = await db
                .select()
                .from(AgentConfig)
                .where(eq(AgentConfig.userEmail, userEmail))
                .orderBy(desc(AgentConfig.createdAt));
        } else {
            agentList = await db
                .select()
                .from(AgentConfig)
                .orderBy(desc(AgentConfig.createdAt));
        }

        return NextResponse.json(agentList || []);
    } catch (e: any) {
        console.error("Error in agent configure GET:", e);
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const agentId = searchParams.get("agentId");

        if (!agentId) {
            return NextResponse.json({ error: "agentId is required" }, { status: 400 });
        }

        await db.delete(AgentConfig).where(eq(AgentConfig.agentId, agentId));
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Error in agent configure DELETE:", e);
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}


