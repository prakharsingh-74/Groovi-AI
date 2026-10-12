import { db, tools } from '@/db';
import { composio } from '@/lib/composio';
import { SLUG_ALIASES } from '@/lib/get-agent-composio-session';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;

    // Get all active tools from DB
    const toolsResult = await db.select().from(tools).where(eq(tools.status, 'active'));

    if (!userEmail) {
        return NextResponse.json(
            toolsResult.map((tool) => ({
                ...tool,
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
            account: toolAccount ?? null,
            connected: isConnected ? 'Connected' : 'Not connected',
        };
    });

    return NextResponse.json(integrations);
}