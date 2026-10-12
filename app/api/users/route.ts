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

        // Fetch subscription from Clerk Billing SDK
        const sub = await getUserSubscriptionPlan(user.id);

        // Check if user already exists in db
        const userResult = await db.select().from(users)
            .where(eq(users.email, email));

        let userRecord = userResult[0];

        // If not then insert new user in db
        if (!userRecord) {
            const inserted = await db.insert(users).values({
                name: user.fullName || email.split("@")[0],
                email: email,
                plan: sub.plan,
            }).returning();
            userRecord = inserted[0];
        } else {
            // If Clerk subscription is Pro or DB plan differs, synchronize
            const targetPlan = sub.isPro ? "pro" : (userRecord.plan || "free");
            if (userRecord.plan !== targetPlan) {
                const updated = await db.update(users)
                    .set({ plan: targetPlan })
                    .where(eq(users.email, email))
                    .returning();
                userRecord = updated[0];
            }
        }

        // Count user's created agents in AgentConfig
        const agentCountRes = await db.select({ count: sql<number>`count(*)` })
            .from(AgentConfig)
            .where(eq(AgentConfig.userEmail, email));
        const agentCount = Number(agentCountRes[0]?.count || 0);

        const isPro = userRecord.plan === "pro" || sub.isPro;

        return NextResponse.json({
            ...userRecord,
            plan: isPro ? "pro" : "free",
            isPro,
            planName: isPro ? "Pro" : "Free",
            agentCount,
            maxAgents: isPro ? "unlimited" : 3,
            features: sub.features,
        });
    } catch (err: any) {
        console.error("Error in /api/users POST:", err);
        return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user || !user.primaryEmailAddress?.emailAddress) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const email = user.primaryEmailAddress.emailAddress;
        const sub = await getUserSubscriptionPlan(user.id);

        const userResult = await db.select().from(users)
            .where(eq(users.email, email));

        let userRecord = userResult[0];
        if (!userRecord) {
            const inserted = await db.insert(users).values({
                name: user.fullName || email.split("@")[0],
                email: email,
                plan: sub.plan,
            }).returning();
            userRecord = inserted[0];
        } else if (sub.isPro && userRecord.plan !== "pro") {
            const updated = await db.update(users)
                .set({ plan: "pro" })
                .where(eq(users.email, email))
                .returning();
            userRecord = updated[0];
        }

        const agentCountRes = await db.select({ count: sql<number>`count(*)` })
            .from(AgentConfig)
            .where(eq(AgentConfig.userEmail, email));
        const agentCount = Number(agentCountRes[0]?.count || 0);

        const isPro = userRecord.plan === "pro" || sub.isPro;

        return NextResponse.json({
            ...userRecord,
            plan: isPro ? "pro" : "free",
            isPro,
            planName: isPro ? "Pro" : "Free",
            agentCount,
            maxAgents: isPro ? "unlimited" : 3,
            features: sub.features,
        });
    } catch (err: any) {
        console.error("Error in /api/users GET:", err);
        return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
    }
}