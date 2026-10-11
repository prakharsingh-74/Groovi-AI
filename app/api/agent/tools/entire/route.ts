import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { searchCodeGraph, inspectSymbolImpact, getEntireStatus } from "@/lib/entire";

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { action, query, symbol, topK } = body;

        if (action === "status") {
            const status = await getEntireStatus();
            return NextResponse.json(status);
        }

        if (action === "search") {
            if (!query) {
                return NextResponse.json({ error: "Query is required for search" }, { status: 400 });
            }
            const results = await searchCodeGraph(query, { topK });
            return NextResponse.json(results);
        }

        if (action === "impact") {
            if (!symbol) {
                return NextResponse.json({ error: "Symbol is required for impact analysis" }, { status: 400 });
            }
            const impact = await inspectSymbolImpact(symbol);
            return NextResponse.json(impact);
        }

        return NextResponse.json({ error: "Invalid action. Supported actions: status, search, impact" }, { status: 400 });
    } catch (err: any) {
        console.error("Entire tool API error:", err);
        return NextResponse.json({ error: err.message || "Failed to process Entire request" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const status = await getEntireStatus();
        return NextResponse.json(status);
    } catch (err: any) {
        return NextResponse.json({ enabled: false, error: err.message }, { status: 500 });
    }
}
