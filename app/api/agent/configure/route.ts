import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from '@google/genai';
import { AgentConfigSystemPrompt } from "@/data/Prompt";
import { AgentConfigRespSchema } from "@/data/ResponseSchema";
import { ensureNeatlogsInit, wrapGoogleGenAI, trace, flush } from "@/lib/neatlogs";
import { AgentConfig, db, tools } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
    const { prompt } = await req.json();
    const user=await currentUser();

    if (!prompt || !prompt.trim()) {
        return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_CLOUD_GEMINI_API_KEY;

    try {

        const aiTools = await db.select({
            slug: tools.slug
        }).from(tools);

        const toolsList = aiTools.length > 0 
            ? aiTools.map(t => `- ${t.slug}`).join('\n') 
            : "- google_search\n- serp_search\n- browserbase\n- gmail\n- slack\n- google_calendar\n- notion";

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

                const candidateModels = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.7-flash'];
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

                if (!responseText) {
                    throw lastError || new Error("All candidate Gemini models failed to generate response");
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
                userEmail: user?.primaryEmailAddress?.emailAddress ?? null
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
        const agentConfig = body.data?.draftAgent || body.draftAgent || body;

        const condition = agentConfig.agentId
            ? eq(AgentConfig.agentId, agentConfig.agentId)
            : agentConfig.id
                ? eq(AgentConfig.id, agentConfig.id)
                : undefined;

        const updateOp = db.update(AgentConfig).set({
            ...agentConfig
        });

        const result = await (condition ? updateOp.where(condition) : updateOp).returning();

        console.log(result[0]);

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


