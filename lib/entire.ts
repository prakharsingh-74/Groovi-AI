import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface EntireSearchResult {
    site?: string;
    symbol?: string;
    kind?: string;
    score?: number;
    snippet?: string;
    raw?: string;
}

export interface EntireStatus {
    enabled: boolean;
    branch?: string;
    agents?: string[];
    syncRemote?: string;
    raw?: string;
}

/**
 * Executes Entire Graph search query across the repository
 */
export async function searchCodeGraph(query: string, options?: { topK?: number; repoPath?: string }) {
    const topK = options?.topK || 5;
    const repoPath = options?.repoPath || process.cwd();
    const cleanQuery = query.replace(/["\\]/g, "");

    try {
        const { stdout } = await execAsync(
            `entire graph search --repo "${repoPath}" --query "${cleanQuery}" --format agent --top-k ${topK}`,
            { timeout: 15000 }
        );
        return {
            success: true,
            output: stdout.trim(),
        };
    } catch (error: any) {
        // Fallback to text format if agent flag behaves differently
        try {
            const { stdout } = await execAsync(
                `entire graph search --repo "${repoPath}" --query "${cleanQuery}" --format text --top-k ${topK}`,
                { timeout: 15000 }
            );
            return {
                success: true,
                output: stdout.trim(),
            };
        } catch (innerError: any) {
            console.error("Entire graph search error:", innerError);
            return {
                success: false,
                error: innerError.message || "Failed to search code graph",
            };
        }
    }
}

/**
 * Analyzes the blast radius / impact of modifying a symbol
 */
export async function inspectSymbolImpact(symbol: string, repoPath?: string) {
    const path = repoPath || process.cwd();
    const cleanSymbol = symbol.replace(/["\\]/g, "");

    try {
        const { stdout } = await execAsync(
            `entire graph impact --repo "${path}" "${cleanSymbol}"`,
            { timeout: 15000 }
        );
        return {
            success: true,
            output: stdout.trim(),
        };
    } catch (error: any) {
        console.error("Entire graph impact error:", error);
        return {
            success: false,
            error: error.message || "Failed to inspect symbol impact",
        };
    }
}

/**
 * Gets the current repository's Entire tracking status
 */
export async function getEntireStatus(repoPath?: string): Promise<EntireStatus> {
    const path = repoPath || process.cwd();
    try {
        const { stdout } = await execAsync(`entire status`, { cwd: path, timeout: 8000 });
        const enabled = stdout.includes("Enabled");
        return {
            enabled,
            raw: stdout.trim(),
        };
    } catch (error: any) {
        return {
            enabled: false,
            raw: error.message || "Entire CLI not available",
        };
    }
}
