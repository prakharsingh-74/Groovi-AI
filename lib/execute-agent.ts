import { CreatedAgentType } from "@/components/custom/agents/CreateAgent";
import { buildAgent } from "./build-agent";
import { run } from "@openai/agents";
import { cleanAgentResponse } from "./utils";

export function isQuotaOrRateLimitError(err: any): boolean {
    if (!err) return false;
    const status = err.status || err.statusCode || err?.response?.status;
    if (status === 429 || status === 413) return true;

    const raw = (
        (err.message || "") +
        " " +
        (err?.error?.message || "") +
        " " +
        (err?.code || "") +
        " " +
        (typeof err === "string" ? err : "")
    ).toLowerCase();

    return (
        raw.includes("429") ||
        raw.includes("quota") ||
        raw.includes("resource_exhausted") ||
        raw.includes("resource has been exhausted") ||
        raw.includes("rate limit") ||
        raw.includes("rate_limit") ||
        raw.includes("tokens per minute") ||
        raw.includes("requests per minute") ||
        raw.includes("requests per day") ||
        raw.includes("tpm") ||
        raw.includes("rpm") ||
        raw.includes("rpd") ||
        raw.includes("too many requests") ||
        raw.includes("exceeded your current quota") ||
        raw.includes("insufficient_quota") ||
        raw.includes("request too large") ||
        raw.includes("413")
    );
}

export function extractErrorMessage(err: any): string {
    if (!err) return "Unknown error";
    if (typeof err === "string") return err;
    if (err?.error?.message) return String(err.error.message);
    if (err?.message) return String(err.message);
    if (err?.statusText) return `HTTP ${err.status || 500}: ${err.statusText}`;
    try {
        return JSON.stringify(err);
    } catch {
        return String(err);
    }
}

type ModelCandidate = {
    provider: "gemini" | "groq";
    model: string;
};

type AttemptFailure = {
    provider: "gemini" | "groq";
    model: string;
    message: string;
    isQuota: boolean;
    rawError: any;
};

export async function executeAgent({
    agentConfig,
    userEmail,
    input
}: {
    agentConfig: CreatedAgentType;
    userEmail: string;
    input: string;
}) {
    if (agentConfig.status.toLocaleLowerCase() !== "active") {
        throw new Error("Agent is not active!");
    }

    const taskInput = input?.trim() || agentConfig?.objective || "Execute configured objective.";

    const hasGemini = !!(process.env.GOOGLE_CLOUD_GEMINI_API_KEY || process.env.GEMINI_API_KEY);
    const hasGroq = !!process.env.GROQ_API_KEY;

    if (!hasGemini && !hasGroq) {
        throw new Error("No AI API keys configured (GOOGLE_CLOUD_GEMINI_API_KEY or GROQ_API_KEY). Please set up your API keys in environment variables.");
    }

    // 1. Prepare Gemini candidates (Primary execution)
    const geminiCandidates: ModelCandidate[] = [];
    if (hasGemini) {
        const primaryGemini = process.env.GEMINI_MODEL || "gemini-3.5-flash";
        geminiCandidates.push({ provider: "gemini", model: primaryGemini });
        if (primaryGemini !== "gemini-3.5-flash-lite") {
            geminiCandidates.push({ provider: "gemini", model: "gemini-3.5-flash-lite" });
        }
        if (primaryGemini !== "gemini-3.8-flash") {
            geminiCandidates.push({ provider: "gemini", model: "gemini-3.8-flash" });
        }
    }

    // 2. Prepare Groq candidates (Fallback execution)
    const groqCandidates: ModelCandidate[] = [];
    if (hasGroq) {
        const primaryGroq = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
        groqCandidates.push({ provider: "groq", model: primaryGroq });
        if (primaryGroq !== "openai/gpt-oss-20b") {
            groqCandidates.push({ provider: "groq", model: "openai/gpt-oss-20b" });
        }
    }

    const recordedErrors: AttemptFailure[] = [];
    let cachedTools: any[] | undefined = undefined;

    // Step 1: Execute with Gemini models
    for (const candidate of geminiCandidates) {
        try {
            console.log(`[Agent Execution] Attempting with Gemini model (${candidate.model})...`);
            const agent = await buildAgent(agentConfig, userEmail, candidate.provider, candidate.model, cachedTools);
            if (!cachedTools && (agent as any).tools) {
                cachedTools = (agent as any).tools;
            }

            const result = await run(agent, taskInput, {
                toolNotFoundBehavior: "return_error_to_model",
            });

            return {
                finalOutput: cleanAgentResponse(result?.finalOutput),
            };
        } catch (err: any) {
            const errorMsg = extractErrorMessage(err);
            const isQuota = isQuotaOrRateLimitError(err);
            console.warn(`[Gemini Failed] ${candidate.model}:`, errorMsg);
            recordedErrors.push({
                provider: "gemini",
                model: candidate.model,
                message: errorMsg,
                isQuota,
                rawError: err,
            });
        }
    }

    // Step 2: If execution failed with Gemini models, try with Groq models
    if (groqCandidates.length > 0) {
        console.warn(`[Agent Execution] Gemini execution failed. Retrying with Groq models...`);
        for (const candidate of groqCandidates) {
            try {
                console.log(`[Agent Execution] Attempting Groq fallback (${candidate.model})...`);
                const fallbackAgent = await buildAgent(agentConfig, userEmail, candidate.provider, candidate.model, cachedTools);
                if (!cachedTools && (fallbackAgent as any).tools) {
                    cachedTools = (fallbackAgent as any).tools;
                }

                const fallbackResult = await run(fallbackAgent, taskInput, {
                    toolNotFoundBehavior: "return_error_to_model",
                });

                console.log(`[Groq Fallback Succeeded] Successfully executed agent with Groq (${candidate.model})`);
                return {
                    finalOutput: cleanAgentResponse(fallbackResult?.finalOutput),
                };
            } catch (err: any) {
                const errorMsg = extractErrorMessage(err);
                const isQuota = isQuotaOrRateLimitError(err);
                console.warn(`[Groq Failed] ${candidate.model}:`, errorMsg);
                recordedErrors.push({
                    provider: "groq",
                    model: candidate.model,
                    message: errorMsg,
                    isQuota,
                    rawError: err,
                });
            }
        }
    }

    // Step 3: All candidates failed: give the final error that quota limit exceeded or whatever the error of failure is
    const hasQuotaFailure = recordedErrors.some((e) => e.isQuota);

    const geminiFailures = recordedErrors.filter((e) => e.provider === "gemini");
    const groqFailures = recordedErrors.filter((e) => e.provider === "groq");

    const geminiSummary = geminiFailures.length > 0
        ? geminiFailures.map((e) => `[${e.model}] ${e.message}`).join("; ")
        : (hasGemini ? "Gemini models failed" : "Gemini not configured");

    const groqSummary = groqFailures.length > 0
        ? groqFailures.map((e) => `[${e.model}] ${e.message}`).join("; ")
        : (hasGroq ? "Groq models failed" : "Groq not configured (missing GROQ_API_KEY)");

    if (hasQuotaFailure) {
        const quotaError = recordedErrors.find((e) => e.isQuota);
        const specificQuotaMsg = quotaError ? `(${quotaError.provider} ${quotaError.model}: ${quotaError.message})` : "";
        const finalMessage = `Quota limit exceeded: Agent execution failed on Gemini models, and fallback to Groq models also failed. ${specificQuotaMsg} Gemini: ${geminiSummary} | Groq: ${groqSummary}`;
        console.error(`[Execution Error] ${finalMessage}`);
        throw new Error(finalMessage);
    } else {
        const firstErrorMsg = recordedErrors[0]?.message || "Unknown execution error";
        const finalMessage = `Agent execution failed across Gemini and Groq models: ${firstErrorMsg}. Gemini: ${geminiSummary} | Groq: ${groqSummary}`;
        console.error(`[Execution Error] ${finalMessage}`);
        throw new Error(finalMessage);
    }
}