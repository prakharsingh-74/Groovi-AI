import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from '@google/genai';
import { AgentConfigSystemPrompt } from "@/data/Prompt";
import { AgentConfigRespSchema } from "@/data/ResponseSchema";
import { db } from "@/db";
import { tools } from "@/db/schema";

export async function POST(req: NextRequest) {

    const { prompt } = await req.json();

    if (!prompt.trim()) {
        return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_CLOUD_GEMINI_API_KEY;

    try {
        const aiTools = await db.select({
            slug: tools.slug
        }).from(tools);

        const ai = new GoogleGenAI({ apiKey });

        const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
        let response = null;
        let lastError = null;

        for (const modelName of modelsToTry) {
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    response = await ai.models.generateContent({
                        model: modelName,
                        contents: AgentConfigSystemPrompt.replace('{USER_PROMPT}', prompt) + `\nAvailable database tools: ${JSON.stringify(aiTools)}`,
                        config: {
                            responseMimeType: 'application/json',
                            responseSchema: AgentConfigRespSchema
                        }
                    });
                    if (response) break;
                } catch (err: any) {
                    lastError = err;
                    console.warn(`Attempt ${attempt} on ${modelName} failed: ${err?.message || err}`);
                    if (attempt < 3) {
                        await new Promise((res) => setTimeout(res, attempt * 1500));
                    }
                }
            }
            if (response) break;
        }

        if (!response) {
            throw lastError || new Error("Failed to generate content after retries");
        }

        let rawText = response.text ?? '{}';
        // Clean markdown backticks if present
        if (rawText.startsWith("```")) {
            rawText = rawText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
        }

        const data = JSON.parse(rawText);
        return NextResponse.json(data);

    } catch (e: any) {
        console.error('Error configuring agent:', e);
        return NextResponse.json({ error: e?.message || "Service temporarily unavailable. Please try again." }, { status: 503 })

    }

}
