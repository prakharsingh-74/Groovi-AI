import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { ensureNeatlogsInit, wrapGoogleGenAI, trace } from "@/lib/neatlogs";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { message, agent, history } = body;

        if (!message || !message.trim()) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_CLOUD_GEMINI_API_KEY;

        const systemPrompt = `You are "${agent?.name || "AI Agent"}", an autonomous AI agent specialized for the following role:
Objective: ${agent?.objective || agent?.description || "Assist the user with their request."}
Instructions: ${agent?.instructions || "Be concise, helpful, and take action on user instructions."}
Skills: ${Array.isArray(agent?.skills) ? agent.skills.join(", ") : "General task execution"}
Tools available: ${Array.isArray(agent?.tools) ? agent.tools.map((t: any) => typeof t === "string" ? t : t?.name || t?.slug).join(", ") : "Web tools"}

The user is talking directly to you in your agent chat interface.
Respond directly in your assigned role and persona.
Keep your response concise, clear, and action-oriented. If the user asks you to execute or work on something, explain what steps you are taking or provide the findings.`;

        if (apiKey) {
            try {
                await ensureNeatlogsInit();
                const ai = wrapGoogleGenAI(new GoogleGenAI({ apiKey }));

                const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
                let responseText: string | undefined;

                for (const model of candidateModels) {
                    try {
                        const response = await ai.models.generateContent({
                            model,
                            contents: [
                                { role: "user", parts: [{ text: `${systemPrompt}\n\nUser message: ${message}` }] }
                            ]
                        });
                        if (response.text) {
                            responseText = response.text;
                            break;
                        }
                    } catch (err) {
                        console.warn(`Gemini model ${model} chat error, trying fallback...`);
                    }
                }

                if (responseText) {
                    return NextResponse.json({ response: responseText });
                }
            } catch (aiErr) {
                console.error("Gemini AI generation failed:", aiErr);
            }
        }

        // Fallback response if Gemini is unavailable
        const agentName = agent?.name || "Agent";
        const fallbackResponse = `I'm on it! As ${agentName}, I am analyzing your request: "${message}". I will apply my configured skills and tools to deliver the best results for you.`;

        return NextResponse.json({ response: fallbackResponse });
    } catch (error: any) {
        console.error("Agent chat API error:", error);
        return NextResponse.json({ error: error.message || "Failed to process chat" }, { status: 500 });
    }
}
