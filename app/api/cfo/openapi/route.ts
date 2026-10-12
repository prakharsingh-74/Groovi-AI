import { NextResponse } from "next/server";

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const openApiSpec = {
        openapi: "3.0.0",
        info: {
            title: "Groovi AI Metrics API",
            description: "Live operational metrics and financial figures from Groovi AI platform for cfo.ai Ari workspace integration.",
            version: "1.0.0",
        },
        servers: [
            {
                url: baseUrl,
                description: "Groovi AI Server",
            },
        ],
        paths: {
            "/api/cfo/metrics": {
                get: {
                    summary: "Get Groovi AI Platform & Financial Metrics",
                    description: "Retrieves live active users, total agent executions, MRR, cash balance, and department burn rate.",
                    operationId: "getGrooviAiMetrics",
                    responses: {
                        "200": {
                            description: "Live operational and financial metrics",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            company: { type: "string" },
                                            timestamp: { type: "string" },
                                            metrics: {
                                                type: "object",
                                                properties: {
                                                    totalUsers: { type: "integer" },
                                                    activeAgents: { type: "integer" },
                                                    totalRuns: { type: "integer" },
                                                    completedRuns: { type: "integer" },
                                                    failedRuns: { type: "integer" },
                                                    runSuccessRate: { type: "string" },
                                                },
                                            },
                                            financials: {
                                                type: "object",
                                                properties: {
                                                    currency: { type: "string" },
                                                    cashBalance: { type: "number" },
                                                    monthlyRecurringRevenue: { type: "number" },
                                                    monthlyOperatingExpense: { type: "number" },
                                                    monthlyNetBurn: { type: "number" },
                                                    runwayMonths: { type: "number" },
                                                    departmentExpenses: {
                                                        type: "object",
                                                        properties: {
                                                            engineering: { type: "number" },
                                                            salesAndMarketing: { type: "number" },
                                                            generalAndAdministrative: { type: "number" },
                                                            customerSuccess: { type: "number" },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    };

    return NextResponse.json(openApiSpec);
}
