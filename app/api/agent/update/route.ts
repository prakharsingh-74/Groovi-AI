import { db, AgentConfig } from "@/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            agentId,
            name,
            agentImage,
            description,
            instructions,
            objective,
            status,
            schedule,
            skills,
            tools,
            outputFormat
        } = body;

        if (!agentId) {
            return NextResponse.json({ error: "agentId is required for update" }, { status: 400 });
        }

        const updateData: Record<string, any> = {};
        if (name !== undefined) updateData.name = name;
        if (agentImage !== undefined) updateData.agentImage = agentImage;
        if (description !== undefined) updateData.description = description;
        if (instructions !== undefined) updateData.instructions = instructions;
        if (objective !== undefined) updateData.objective = objective;
        if (status !== undefined) updateData.status = status;
        if (schedule !== undefined) updateData.schedule = schedule;
        if (skills !== undefined) updateData.skills = skills;
        if (tools !== undefined) updateData.tools = tools;
        if (outputFormat !== undefined) updateData.outputFormat = outputFormat;

        const updated = await db
            .update(AgentConfig)
            .set(updateData)
            .where(eq(AgentConfig.agentId, agentId))
            .returning();

        return NextResponse.json({
            success: true,
            agent: updated[0] || null
        });
    } catch (e: any) {
        console.error("Error updating agent:", e);
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}
