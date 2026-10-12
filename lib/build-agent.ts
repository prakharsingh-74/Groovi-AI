import { CreatedAgentType } from "@/components/custom/agents/CreateAgent";
import { getOrCreateAgentSession } from "./get-agent-composio-session";
import { Agent, setTraceProcessors, tool } from "@openai/agents";
import { setDefaultOpenAIClient, setOpenAIAPI } from "@openai/agents-openai";
import OpenAI from "openai";
import { browserbaseResearchTool } from "./browserbase-tool";
import { cfoAiFinancialTool } from "./cfo-ai-tool";
import { z } from "zod";

export const composioSearchToolsFallback = tool({
    name: "COMPOSIO_SEARCH_TOOLS",
    description: "Fallback handler when agent attempts to search for tools dynamically.",
    parameters: z.object({
        query: z.string().optional().describe("Search query for tools"),
    }),
    execute: async ({ query }: { query?: string }) => {
        return `No dynamic tools found for "${query || ''}". Please use browser_research to search the public web or use the already available tools.`;
    },
});

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

export function getAgentInstructions(agentConfig: CreatedAgentType): string {
    return `
Role: ${agentConfig?.description},

Instructions:
${agentConfig.instructions},

Primary Objective
${agentConfig.objective},

Skills:
${(agentConfig.skills ?? []).join(', ')}

Required Output Format:
${agentConfig?.outputFormat}

Formatting Rules:
- Output clean, readable plain text.
- Do NOT use markdown headers (such as #, ##, ###) or asterisks for bold or italics (such as **, *).
- Use simple hyphens (-) or numbers (1., 2.) when listing items.
Browser Research Rules:
- Use browser_research when the user explicitly asks to search or browse the live web.
- Use browser_research for current prices, availability, comparisons, or real-time information.
- Do not claim that pricing is current unless browser_research verifies it.
- Include the source URLs returned by browser_research in the final response.
- Clearly distinguish verified facts from conclusions or recommendations.
- Browser research is read-only. Never use it to purchase, log in,
  upload files, download files, or modify external systems.

Financial Modeling & CFO.ai Rules:
- Use cfo_financial_analysis when asked about financial modeling, burn rate, cash runway, department expenses, or scenario forecasts.
- Report runway in months, monthly burn rate, and cash balance clearly.
- Distinguish between baseline actuals and forecast projections.

Tool Execution Rules:
- Only call tools that are explicitly declared in your tools list.
- If a requested platform (such as Reddit, Twitter, or external forums) does not have a dedicated tool, use browser_research to search the public web.
- Never call undeclared meta-tools.
- Do not claim that an action succeeded unless the tool result confirms it.
- Ask for confirmation before destructive or high-risk actions.
`.trim();
}

export async function buildAgent(
    agentConfig: CreatedAgentType,
    userEmail: string,
    overrideProvider?: string,
    overrideModel?: string,
    cachedTools?: any[]
) {
    const instructions = getAgentInstructions(agentConfig);

    let toolsToUse = cachedTools;
    if (!toolsToUse || !Array.isArray(toolsToUse) || toolsToUse.length === 0) {
        const session = await getOrCreateAgentSession(agentConfig, userEmail);
        const rawTools = await session.tools();
        // Cap tools to the primary 3 actions to prevent huge JSON schemas that hit token/rate limits
        const composioTools = Array.isArray(rawTools) && rawTools.length > 3
            ? rawTools.slice(0, 3)
            : rawTools;

        toolsToUse = [...composioTools, browserbaseResearchTool, cfoAiFinancialTool, composioSearchToolsFallback];
    }

    return new Agent({
        name: agentConfig.name,
        model: setupModel(overrideProvider, overrideModel),
        instructions,
        tools: toolsToUse
    });
}