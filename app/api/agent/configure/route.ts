import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from '@google/genai';
import { AgentConfigSystemPrompt } from "@/data/Prompt";
import { AgentConfigRespSchema } from "@/data/ResponseSchema";
import { ensureNeatlogsInit, wrapGoogleGenAI, trace, flush } from "@/lib/neatlogs";

export async function POST(req: NextRequest) {
    const { prompt } = await req.json();

    if (!prompt || !prompt.trim()) {
        return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_CLOUD_GEMINI_API_KEY;

    try {
        await ensureNeatlogsInit();
        const ai = wrapGoogleGenAI(new GoogleGenAI({ apiKey }));

        const result = await trace(
            {
                name: "agent-configurator",
                kind: "AGENT",
                input: { prompt },
            },
            async () => {
                const promptContent = AgentConfigSystemPrompt.replace('{USER_PROMPT}', prompt);
                let responseText: string | undefined;

                try {
                    // Primary: gemini-2.5-flash with thinking budget (stable & highly available)
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: promptContent,
                        config: {
                            thinkingConfig: { thinkingBudget: 1024 },
                            responseMimeType: "application/json",
                            responseSchema: AgentConfigRespSchema
                        }
                    });
                    responseText = response.text;
                } catch (primaryErr: any) {
                    console.warn("[gemini-2.5-flash] with thinking failed, trying standard config:", primaryErr?.message || primaryErr);
                    // Fallback: gemini-2.5-flash without thinkingConfig
                    const fallbackResponse = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: promptContent,
                        config: {
                            responseMimeType: "application/json",
                            responseSchema: AgentConfigRespSchema
                        }
                    });
                    responseText = fallbackResponse.text;
                }

                return JSON.parse(responseText ?? '{}');
            }
        );

        // Immediate flush so traces show up on Neatlogs dashboard right away
        await flush().catch((err) => console.warn("[neatlogs] flush warning:", err));

        return NextResponse.json(result);

    } catch (e: any) {
        console.error("Error in agent configure:", e);
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}

