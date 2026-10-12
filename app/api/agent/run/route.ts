import { AgentConfig, AgentRun, db } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { executeAgent } from "@/lib/execute-agent";
import { inngest } from "@/inngest/client";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
    const user = await currentUser();
    const { agentConfig, agentId, input } = await req.json();

    let AgentConfigData = agentConfig;

    if (!AgentConfigData) {
        const result = await db.select().from(AgentConfig)
            .where(eq(AgentConfig.agentId, agentId));

        AgentConfigData = result[0];
    }

    if (input == null) {

        const isAgentRunning = await db.select().from(AgentRun)
            .where(and(eq(AgentRun.agentId, agentConfig?.agentId), eq(AgentRun.status, 'queued'), eq(AgentRun.status, 'running')))

        if (isAgentRunning.length != 0) {
            return NextResponse.json({ error: "Agent is already running" }, { status: 400 });
        }

        const now = new Date();
        const insertAgentRun = await db.insert(AgentRun)
            .values({
                agentId: AgentConfigData?.agentId || agentId || agentConfig?.agentId,
                userEmail: user?.primaryEmailAddress?.emailAddress ?? AgentConfigData?.userEmail ?? "",
                scheduledFor: now,
                timezone: AgentConfigData?.timezone || AgentConfigData?.schedule?.timezone || agentConfig?.timeZone || "UTC",
                status: 'queued',
                queuedAt: now
            })
            .returning();

        const run = insertAgentRun[0];

        try {
            await inngest.send({
                name: 'agent/run.execute',
                data: { runId: run.id }
            });

            return NextResponse.json({ msg: 'Agent running' }, { status: 200 });
        } catch (e) {
            await db.update(AgentRun)
                .set({
                    status: 'failed',
                    error: 'Error',
                    completedAt: new Date()
                })
                .where(eq(AgentRun.id, run.id));

            return NextResponse.json({ error: e }, { status: 500 });
        }
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

