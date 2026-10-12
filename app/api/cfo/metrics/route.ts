import { db, users, AgentConfig, AgentRun } from "@/db";
import { count, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint for cfo.ai to pull live Groovi AI business and operational metrics.
 * Can be called with Bearer token authentication or API Key.
 */
export async function GET(req: NextRequest) {
    try {
        // Optional auth verification if CFO_INTEGRATION_TOKEN is set
        const expectedToken = process.env.CFO_INTEGRATION_TOKEN;
        const authHeader = req.headers.get("authorization") || "";
        const apiKeyHeader = req.headers.get("x-api-key") || "";

        if (expectedToken) {
            const token = authHeader.replace(/^Bearer\s+/i, "") || apiKeyHeader;
            if (token !== expectedToken) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }

        // 1. Total registered users
        const userCountResult = await db.select({ value: count() }).from(users);
        const totalUsers = userCountResult[0]?.value || 0;

        // 2. Active Agents
        const activeAgentsResult = await db
            .select({ value: count() })
            .from(AgentConfig)
            .where(eq(AgentConfig.status, "active"));
        const activeAgents = activeAgentsResult[0]?.value || 0;

        // 3. Agent Runs metrics
        const completedRunsResult = await db
            .select({ value: count() })
            .from(AgentRun)
            .where(eq(AgentRun.status, "completed"));
        const completedRuns = completedRunsResult[0]?.value || 0;

        const failedRunsResult = await db
            .select({ value: count() })
            .from(AgentRun)
            .where(eq(AgentRun.status, "failed"));
        const failedRuns = failedRunsResult[0]?.value || 0;

        const totalRunsResult = await db.select({ value: count() }).from(AgentRun);
        const totalRuns = totalRunsResult[0]?.value || 0;

        // 4. Financial projections based on operating model
        const openingCash = 1000000;
        const mrr = 35000;
        const monthlyExpenses = 115000;
        const netBurn = monthlyExpenses - mrr;
        const runwayMonths = Number((openingCash / netBurn).toFixed(1));

        return NextResponse.json({
            company: "Groovi AI",
            timestamp: new Date().toISOString(),
            metrics: {
                totalUsers,
                activeAgents,
                totalRuns,
                completedRuns,
                failedRuns,
                runSuccessRate: totalRuns > 0 ? `${Math.round((completedRuns / totalRuns) * 100)}%` : "100%",
            },
            financials: {
                currency: "USD",
                cashBalance: openingCash,
                monthlyRecurringRevenue: mrr,
                monthlyOperatingExpense: monthlyExpenses,
                monthlyNetBurn: netBurn,
                runwayMonths,
                departmentExpenses: {
                    engineering: 51750,
                    salesAndMarketing: 28750,
                    generalAndAdministrative: 17250,
                    customerSuccess: 17250,
                },
            },
        });
    } catch (err: any) {
        console.error("Failed to aggregate CFO metrics:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
