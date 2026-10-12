import { AgentConfig, db, tools as toolsTable } from "@/db";
import { getOrCreateAgentSession, SaveComposioSessionId, SLUG_ALIASES } from "@/lib/get-agent-composio-session";
import { composio } from "@/lib/composio";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { toolSlug, agentId } = await req.json();
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
        }

        if (!agentId || !toolSlug) {
            return NextResponse.json({ error: "Missing toolSlug or agentId" }, { status: 400 });
        }

        const agentConfig = await db
            .select()
            .from(AgentConfig)
            .where(eq(AgentConfig.agentId, agentId));

        if (!agentConfig || agentConfig.length === 0) {
            return NextResponse.json({ error: "Agent configuration not found" }, { status: 404 });
        }

        const userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;
        if (!userEmail) {
            return NextResponse.json({ error: "User email not found" }, { status: 400 });
        }

        const lowerSlug = String(toolSlug).toLowerCase().trim();

        // Check if tool is a built-in native tool that does not require external OAuth
        if (lowerSlug === "web_search") {
            return NextResponse.json({
                message: "Web Search is a built-in native tool and is active by default.",
                redirectUrl: ""
            });
        }

        if (lowerSlug.includes("entire")) {
            return NextResponse.json({
                message: "Entire.io is integrated! Code Graph indexing & Checkpoints are active for this repository.",
                redirectUrl: "https://entire.io"
            });
        }

        
        const session = await getOrCreateAgentSession(agentConfig[0], userEmail);

        const normalizedSlug = SLUG_ALIASES[lowerSlug] || lowerSlug;

        let connectionRequest: any;
        try {
            connectionRequest = await session.authorize(normalizedSlug);
        } catch (authErr: any) {
            console.warn("Initial session authorization failed, attempting fresh session:", authErr?.message);
            // If the existing session had restricted toolkits (4324) or expired, create fresh unrestricted session
            const freshSession = await composio.sessions.create(userEmail);
            await SaveComposioSessionId(agentId, freshSession);
            connectionRequest = await freshSession.authorize(normalizedSlug);
        }

        return NextResponse.json({
            redirectUrl: connectionRequest?.redirectUrl || connectionRequest?.url || ""
        });
    } catch (err: any) {
        console.error("Error connecting tool:", err);
        return NextResponse.json({
            error: err?.message || "Failed to authorize tool"
        }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { toolSlug, agentId, connectedAccountId } = await req.json();
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
        }

        if (!agentId || !toolSlug) {
            return NextResponse.json({ error: "Missing toolSlug or agentId" }, { status: 400 });
        }

        const userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;
        if (!userEmail) {
            return NextResponse.json({ error: "User email not found" }, { status: 400 });
        }

        const lowerSlug = String(toolSlug).toLowerCase().trim();
        const normalizedSlug = SLUG_ALIASES[lowerSlug] || lowerSlug;

        // 1. If connectedAccountId is provided, delete it via composio
        if (connectedAccountId) {
            try {
                await composio.connectedAccounts.delete(connectedAccountId);
                console.log(`Successfully deleted connectedAccount ${connectedAccountId}`);
            } catch (err: any) {
                console.warn(`Failed to delete connected account ${connectedAccountId}:`, err?.message);
            }
        }

        // 2. Also list and delete active connections for this user & toolkit
        try {
            const userAccounts = await composio.connectedAccounts.list({
                userIds: [userEmail],
                toolkitSlugs: [normalizedSlug],
            });

            if (userAccounts?.items && userAccounts.items.length > 0) {
                for (const acc of userAccounts.items) {
                    try {
                        await composio.connectedAccounts.delete(acc.id);
                        console.log(`Deleted active connectedAccount ${acc.id} for ${normalizedSlug}`);
                    } catch (e: any) {
                        console.warn(`Failed to delete account ${acc.id}:`, e?.message);
                    }
                }
            }
        } catch (listErr: any) {
            console.warn("Could not list connected accounts to delete:", listErr?.message);
        }

        // 3. Update agent config in database
        const agentRecords = await db
            .select()
            .from(AgentConfig)
            .where(eq(AgentConfig.agentId, agentId));

        if (agentRecords && agentRecords.length > 0) {
            const rawTools: any[] = Array.isArray(agentRecords[0].tools) ? agentRecords[0].tools : [];
            const updatedTools = rawTools.map((t: any) => {
                const s = typeof t === "string" ? t : t?.slug || t?.name || "";
                if (s.toLowerCase() === lowerSlug || s.toLowerCase() === normalizedSlug) {
                    return typeof t === "string" ? t : { ...t, connected: false };
                }
                return t;
            });
            await db
                .update(AgentConfig)
                .set({ tools: updatedTools })
                .where(eq(AgentConfig.agentId, agentId));
        }

        return NextResponse.json({
            message: `Successfully disconnected ${toolSlug}`,
            success: true
        });
    } catch (err: any) {
        console.error("Error disconnecting tool:", err);
        return NextResponse.json({
            error: err?.message || "Failed to disconnect tool"
        }, { status: 500 });
    }
}

