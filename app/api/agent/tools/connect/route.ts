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

        //@ts-ignore
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

