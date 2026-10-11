import { AgentConfig, db, tools as toolsTable } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateAgentSession, SLUG_ALIASES } from "@/lib/get-agent-composio-session";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const agentId = searchParams.get('agentId')
    const fetchAll = searchParams.get('all') === 'true';

    const user = await currentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized User' }, { status: 400 })
    }

    if (fetchAll) {
        const dbTools = await db.select().from(toolsTable);
        return NextResponse.json(dbTools);
    }

    //Fetch Agent Config
    const result = await db.select().from(AgentConfig)
        .where(eq(AgentConfig.agentId, agentId ?? ''));

    const agentConfig = result[0];
    if (!agentConfig) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const allowedTools: any[] = Array.isArray(agentConfig?.tools) ? agentConfig.tools : [];

    // Also fetch DB tool details as fallback for icons and names
    const dbTools = await db.select().from(toolsTable);
    const dbToolMap = new Map(dbTools.map(t => [t.slug.toLowerCase(), t]));

    let toolkitResult: any = { items: [] };
    const userEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || "user@grooviai.internal";
    try {
        //@ts-ignore
        const session = await getOrCreateAgentSession(agentConfig, userEmail);
        if (session && typeof session.toolkits === "function") {
            toolkitResult = await session.toolkits();
        }
    } catch (err: any) {
        console.error("Failed to retrieve Composio toolkits for session:", err);
    }

    const tools = allowedTools.map((toolItem: any) => {
        const slug = typeof toolItem === "string" ? toolItem : toolItem?.slug || "";
        const lowerSlug = slug.toLowerCase().trim();
        const aliasedSlug = SLUG_ALIASES[lowerSlug] || lowerSlug;

        const toolkit = toolkitResult?.items?.find(
            (item: any) => item.slug.toLowerCase() === lowerSlug || item.slug.toLowerCase() === aliasedSlug
        );
        const dbTool = dbToolMap.get(lowerSlug);

        // A tool is connected if:
        // - For Composio toolkits (SerpApi, Browserbase, GitHub, Gmail, Slack, Google Calendar, Google Sheets, Supabase, Outlook, etc.): user has an active connection
        // - For native server tools (Web Search): handled by backend server environment
        const isComposioToolkit = Boolean(
            toolkit ||
            [
                'serp_search', 'serpapi',
                'browserbase', 'browserbase_tool',
                'github', 'gmail', 'slack', 'notion',
                'google_calendar', 'googlecalendar',
                'googlesheets', 'google_sheets',
                'supabase', 'outlook'
            ].includes(lowerSlug) ||
            (dbTool && dbTool.requiresAuth)
        );
        const isServerTool = dbTool ? !dbTool.requiresAuth : false;
        const isConnected = isComposioToolkit
            ? toolkit?.connection?.isActive === true
            : isServerTool;

        return {
            slug,
            name: toolkit?.name || dbTool?.name || slug.replace(/[_-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
            logo: toolkit?.logo || dbTool?.icon || "",
            connected: Boolean(isConnected),
            isNative: Boolean(!isComposioToolkit),
            connectedAccountId: toolkit?.connection?.connectedAccount?.id ?? null
        };
    });

    return NextResponse.json(tools);
}