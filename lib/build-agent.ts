import { CreatedAgentType } from "@/components/custom/agents/CreateAgent";
import { getOrCreateAgentSession } from "./get-agent-composio-session";
import { Agent, setTraceProcessors } from "@openai/agents";
import { setDefaultOpenAIClient, setOpenAIAPI } from "@openai/agents-openai";
import OpenAI from "openai";

let isTracingDisabled = false;

if (typeof process !== "undefined" && typeof process.setMaxListeners === "function") {
    try {
        process.setMaxListeners(50);
    } catch (_) {}
}

export function setupModel(overrideProvider?: string, overrideModel?: string): string {
    if (!isTracingDisabled) {
        setTraceProcessors([]);
        setOpenAIAPI("chat_completions");
        isTracingDisabled = true;
    }

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GOOGLE_CLOUD_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;
    const provider = (overrideProvider || process.env.AI_PROVIDER || (geminiKey ? "gemini" : "groq")).toLowerCase();


    // 1. Groq (Fast free inference)
    if (provider === "groq" && groqKey) {
        setDefaultOpenAIClient(new OpenAI({
            apiKey: groqKey,
            baseURL: "https://api.groq.com/openai/v1",
            maxRetries: 0,
        }));
        return overrideModel || process.env.GROQ_MODEL || process.env.AGENT_MODEL || "openai/gpt-oss-120b";
    }

    // 2. Google Gemini
    if (provider === "gemini" && geminiKey) {
        setDefaultOpenAIClient(new OpenAI({
            apiKey: geminiKey,
            baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
            maxRetries: 0,
        }));
        return overrideModel || process.env.GEMINI_MODEL || process.env.AGENT_MODEL || "gemini-3.5-flash";
    }

    // 3. Fallback to Groq if key exists
    if (groqKey) {
        setDefaultOpenAIClient(new OpenAI({
            apiKey: groqKey,
            baseURL: "https://api.groq.com/openai/v1",
            maxRetries: 0,
        }));
        return overrideModel || process.env.GROQ_MODEL || process.env.AGENT_MODEL || "openai/gpt-oss-120b";
    }

    // 4. Fallback to Gemini if key exists
    if (geminiKey) {
        setDefaultOpenAIClient(new OpenAI({
            apiKey: geminiKey,
            baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
            maxRetries: 0,
        }));
        return overrideModel || process.env.GEMINI_MODEL || process.env.AGENT_MODEL || "gemini-3.5-flash";
    }

    // 5. Optional OpenAI
    if (openAiKey) {
        setDefaultOpenAIClient(new OpenAI({ apiKey: openAiKey, maxRetries: 0 }));
        return overrideModel || process.env.OPENAI_MODEL || process.env.AGENT_MODEL || "gpt-4o-mini";
    }

    throw new Error("No AI API key found. Please set GROQ_API_KEY or GOOGLE_CLOUD_GEMINI_API_KEY in your .env");
}

export async function buildAgent(
    agentConfig: CreatedAgentType,
    userEmail: string,
    overrideProvider?: string,
    overrideModel?: string
) {
    const session = await getOrCreateAgentSession(agentConfig, userEmail);
    const rawTools = await session.tools();
    // Cap tools to the primary 3 actions to prevent huge JSON schemas that hit token/rate limits
    const composioTools = Array.isArray(rawTools) && rawTools.length > 3
        ? rawTools.slice(0, 3)
        : rawTools;

    const instructions = `
Role: ${agentConfig?.description},

Instructions:
${agentConfig.instructions},

Primary Objective
${agentConfig.objective},

Skills:
${(agentConfig.skills ?? []).join(', ')}

Required Output Format:
${agentConfig?.outputFormat}

Use only the available tools when needed.
Do not claim that an action succeeded unless the tool result confirms it.
Ask for confirmation before destructive or high-risk actions.
`.trim();

    return new Agent({
        name: agentConfig.name,
        model: setupModel(overrideProvider, overrideModel),
        instructions,
        tools: composioTools
    });
}