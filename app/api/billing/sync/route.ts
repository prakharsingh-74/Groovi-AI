import { AgentConfig, db, users } from "@/db";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { currentUser } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user || !user.primaryEmailAddress?.emailAddress) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const email = user.primaryEmailAddress.emailAddress;
        const body = await req.json().catch(() => ({}));
        const forcePlan = body?.forcePlan as "pro" | "free" | undefined;

        let targetPlan: "pro" | "free" = "free";

        if (forcePlan && (forcePlan === "pro" || forcePlan === "free")) {
            // Development / Testing plan override
            targetPlan = forcePlan;
        } else {
            // Sync with Clerk Billing
            const sub = await getUserSubscriptionPlan(user.id);
            targetPlan = sub.isPro ? "pro" : "free";
        }

        // Update database
        const updated = await db.update(users)
            .set({ plan: targetPlan })
            .where(eq(users.email, email))
            .returning();

        const agentCountRes = await db.select({ count: sql<number>`count(*)` })
            .from(AgentConfig)
            .where(eq(AgentConfig.userEmail, email));
        const agentCount = Number(agentCountRes[0]?.count || 0);

        const isPro = targetPlan === "pro";

        return NextResponse.json({
            success: true,
            plan: targetPlan,
            isPro,
            planName: isPro ? "Pro" : "Free",
            agentCount,
            user: updated[0] || null,
        });
    } catch (err: any) {
        console.error("Error in /api/billing/sync POST:", err);
        return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
    }
}
