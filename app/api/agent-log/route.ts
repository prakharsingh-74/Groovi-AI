import { AgentConfig, AgentRun, db } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        if (!userEmail) {
            return NextResponse.json([]);
        }

        const result = await db.select({
            id: AgentRun.id,
            agentId: AgentRun.agentId,
            email: AgentRun.userEmail,
            status: AgentRun.status,
            output: AgentRun.output,
            error: AgentRun.error,
            completedAt: AgentRun.completedAt,
            createdAt: AgentRun.createdAt,
            scheduledFor: AgentRun.scheduledFor,
            name: AgentConfig.name,
            agentImage: AgentConfig.agentImage,
            task: AgentConfig.description,
        })
        .from(AgentRun)
        .leftJoin(AgentConfig, eq(AgentRun.agentId, AgentConfig.agentId))
        .where(eq(AgentRun.userEmail, userEmail))
        .orderBy(desc(AgentRun.createdAt));

        return NextResponse.json(result || []);
    } catch (e: any) {
        console.error("Error in agent-log GET:", e);
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}
