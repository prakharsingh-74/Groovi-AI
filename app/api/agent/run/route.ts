import { AgentConfig, db } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { executeAgent } from "@/lib/execute-agent";

export async function POST(req: NextRequest) {
    const user = await currentUser();
    const { agentConfig, agentId, input } = await req.json();

    let AgentConfigData = agentConfig;

    if (!AgentConfigData) {
        const result = await db.select().from(AgentConfig)
            .where(eq(AgentConfig.agentId, agentId));

        AgentConfigData = result[0];
    }

    try {
        const result = await executeAgent({
            agentConfig: AgentConfigData,
            userEmail: user?.primaryEmailAddress?.emailAddress ?? '',
            input: input ?? null
        });

        return NextResponse.json(result);
    } catch (err: any) {
        console.error("Execute agent error:", err);
        return NextResponse.json(
            { error: err?.message || "Failed to execute agent" },
            { status: 500 }
        );
    }
}

