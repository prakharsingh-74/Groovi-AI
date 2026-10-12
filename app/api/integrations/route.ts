import { db, tools } from '@/db';
import { composio } from '@/lib/composio';
import { SLUG_ALIASES } from '@/lib/get-agent-composio-session';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export const OFFICIAL_TOOL_LOGOS: Record<string, string> = {
    slack: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/slack.png",
    notion: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/notion.png",
    google_calendar: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/google-calendar.png",
    calendar: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/google-calendar.png",
    googlesheets: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/google-sheets.png",
    google_sheets: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/google-sheets.png",
    supabase: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/supabase.png",
    outlook: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/microsoft-outlook.png",
    gmail: "https://ik.imagekit.io/Tubeguruji/logos/gmail.webp",
    github: "https://ik.imagekit.io/Tubeguruji/logos/github.svg",
    browserbase: "https://ik.imagekit.io/Tubeguruji/logos/browserbase.png",
    serp_search: "https://ik.imagekit.io/Tubeguruji/logos/serpapi.png",
    web_search: "https://ik.imagekit.io/Tubeguruji/logos/web-link.png",
};

export async function GET(req: NextRequest) {
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;

    // Get all active tools from DB
    const toolsResult = await db.select().from(tools).where(eq(tools.status, 'active'));

    if (!userEmail) {
        return NextResponse.json(
            toolsResult.map((tool) => ({
                ...tool,
                icon: OFFICIAL_TOOL_LOGOS[tool.slug.toLowerCase().trim()] || tool.icon,
                account: null,
                connected: 'Not connected',
            }))
        );
    }

    const slugs = toolsResult.map((tool) => {
        const lower = tool.slug.toLowerCase().trim();
        return SLUG_ALIASES[lower] || lower;
    });

    // Get user connected tools list from Composio
    let accounts: any = { items: [] };
    try {
        accounts = await composio.connectedAccounts.list({
            userIds: [userEmail],
            toolkitSlugs: slugs,
        });
    } catch (err: any) {
        console.warn("Failed to retrieve connected accounts from Composio:", err?.message);
    }

    const integrations = toolsResult.map((tool) => {
        const toolLower = tool.slug.toLowerCase().trim();
        const toolNormalized = SLUG_ALIASES[toolLower] || toolLower;

        const toolAccount = accounts.items?.find((account: any) => {
            const accLower = account.toolkit?.slug?.toLowerCase()?.trim() || "";
            const accNormalized = SLUG_ALIASES[accLower] || accLower;
            return accNormalized === toolNormalized || accLower === toolLower;
        });

        const isConnected = toolAccount?.status === 'ACTIVE';

        return {
            ...tool,
            icon: OFFICIAL_TOOL_LOGOS[toolLower] || tool.icon,
            account: toolAccount ?? null,
            connected: isConnected ? 'Connected' : 'Not connected',
        };
    });

    return NextResponse.json(integrations);
}