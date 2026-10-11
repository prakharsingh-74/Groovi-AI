import { CreatedAgentType } from "@/components/custom/agents/CreateAgent";
import { buildAgent } from "./build-agent";
import { run } from "@openai/agents";

export async function executeAgent({
    agentConfig,
    userEmail,
    input
}: {
    agentConfig: CreatedAgentType,
    userEmail: string,
    input: string
}) {
    if (agentConfig.status.toLocaleLowerCase() !== 'active') {
        throw new Error('Agent is not active!')
    }

    const taskInput = input?.trim() || agentConfig?.objective || "Execute configured objective.";

    try {
        const agent = await buildAgent(agentConfig, userEmail);
        const result = await run(agent, taskInput);
        return {
            finalOutput: result?.finalOutput
        };
    } catch (err: any) {
        console.warn("Primary agent execution encountered an error:", err?.message || err);

        const isQuotaOrDemandError =
            err?.status === 429 ||
            err?.status === 503 ||
            err?.status === 413 ||
            err?.message?.includes("429") ||
            err?.message?.includes("503") ||
            err?.message?.includes("413") ||
            err?.message?.includes("Request too large") ||
            err?.message?.includes("tokens per minute") ||
            err?.message?.includes("Quota exceeded") ||
            err?.message?.includes("RESOURCE_EXHAUSTED");

        if (isQuotaOrDemandError) {
            const hasGemini = !!(process.env.GOOGLE_CLOUD_GEMINI_API_KEY || process.env.GEMINI_API_KEY);
            const hasGroq = !!process.env.GROQ_API_KEY;

            const fallbacks: { provider: string; model: string }[] = [];
            // If Gemini hits the 5 req/min rate limit, immediately fallback to Groq (30 req/min)
            if (hasGroq) {
                fallbacks.push({ provider: "groq", model: "openai/gpt-oss-120b" });
            }
            if (hasGemini) {
                fallbacks.push({ provider: "gemini", model: "gemini-3.5-flash-lite" });
                fallbacks.push({ provider: "gemini", model: "gemini-3.5-flash" });
            }



            for (const fb of fallbacks) {
                try {
                    console.log(`[Resilience Fallback] Retrying with ${fb.provider} (${fb.model})...`);
                    const fallbackAgent = await buildAgent(agentConfig, userEmail, fb.provider, fb.model);
                    const fallbackResult = await run(fallbackAgent, taskInput);
                    return {
                        finalOutput: fallbackResult?.finalOutput
                    };
                } catch (fbErr: any) {
                    console.warn(`[Fallback Failed] ${fb.provider} (${fb.model}):`, fbErr?.message || fbErr);
                }
            }
        }

        throw err;
    }
}