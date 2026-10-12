import { CreatedAgentType } from "@/components/custom/agents/CreateAgent";
import { composio } from "./composio";
import { AgentConfig, db } from "@/db";
import { eq } from "drizzle-orm";

export const SLUG_ALIASES: Record<string, string> = {
    google_calendar: "googlecalendar",
    calendar: "googlecalendar",
    "google-calendar": "googlecalendar",
    googlecalendar: "googlecalendar",
    serp_search: "serpapi",
    serp: "serpapi",
    browserbase: "browserbase_tool",
    browserbase_tool: "browserbase_tool",
    browserbase_mcp: "browserbase_tool",
    googlesheets: "googlesheets",
    google_sheets: "googlesheets",
    "google-sheets": "googlesheets",
    github: "github",
    gmail: "gmail",
    slack: "slack",
    notion: "notion",
    supabase: "supabase",
    outlook: "outlook",
};

let cachedValidSlugs: Set<string> | null = null;

async function getValidComposioSlugs(): Promise<Set<string>> {
    if (cachedValidSlugs) return cachedValidSlugs;
    try {
        const toolkits = await composio.toolkits.get();
        if (Array.isArray(toolkits)) {
            cachedValidSlugs = new Set(toolkits.map((t: any) => t.slug.toLowerCase()));
            return cachedValidSlugs;
        }
    } catch (e) {
        console.warn("Could not fetch Composio toolkits list, using fallback set", e);
    }

    // Fallback known popular Composio slugs
    cachedValidSlugs = new Set([
        "github", "gmail", "slack", "notion", "googlecalendar", "reddit",
        "discord", "twitter", "linkedin", "serpapi", "tavily", "jira",
        "linear", "trello", "clickup", "asana", "hubspot", "salesforce",
        "zoom", "dropbox", "box", "google_drive", "googledocs", "googlesheets"
    ]);
    return cachedValidSlugs;
}

export type AgentConfigInput = {
    agentId?: string | null;
    composioSessionId?: string | null;
    tools?: any;
    userEmail?: string | null;
    [key: string]: any;
};

export async function getOrCreateAgentSession(
    agentConfig: AgentConfigInput | CreatedAgentType,
    userEmail: string
) {
    if (agentConfig?.composioSessionId) {
        try {
            return await composio.sessions.use(agentConfig.composioSessionId);
        } catch (err) {
            console.warn("Existing Composio session could not be reused, creating a new session:", err);
        }
    }

    const rawTools: any[] = Array.isArray(agentConfig?.tools) ? agentConfig.tools : [];
    const validSlugs = await getValidComposioSlugs();

    // Map and filter only valid Composio toolkit slugs
    const composioToolkits: string[] = [];
    for (const tool of rawTools) {
        const raw = typeof tool === "string" ? tool : tool?.slug || "";
        const lower = raw.toLowerCase().trim();
        const mapped = SLUG_ALIASES[lower] || lower;
        if (validSlugs.has(mapped) && !composioToolkits.includes(mapped)) {
            composioToolkits.push(mapped);
        }
    }

    const session = await composio.sessions.create(userEmail);

    // save session ID
    await SaveComposioSessionId(agentConfig?.agentId, session);
    return session;
}

export const SaveComposioSessionId = async (agentId?: string | null, session?: any) => {
    const sessionId = session?.sessionId || session?.id;
    if (!sessionId || !agentId) return;

    try {
        const result = await db.update(AgentConfig).set({
            composioSessionId: sessionId
        }).where(eq(AgentConfig.agentId, agentId));
        console.log("Saved Composio SessionId:", sessionId, result);
    } catch (e) {
        console.error("Failed to save Composio SessionId to DB:", e);
    }
};