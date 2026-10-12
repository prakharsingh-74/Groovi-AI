import { composio } from "@/lib/composio";
import { SLUG_ALIASES } from "@/lib/get-agent-composio-session";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { slug } = await req.json();
        if (!slug) {
            return NextResponse.json({ error: "Missing tool slug" }, { status: 400 });
        }

        const userEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;
        if (!userEmail) {
            return NextResponse.json({ error: "User email not found" }, { status: 400 });
        }

        const lowerSlug = String(slug).toLowerCase().trim();
        const normalizedSlug = SLUG_ALIASES[lowerSlug] || lowerSlug;

        // Native / built-in tools that do not need external OAuth
        if (normalizedSlug === "web_search") {
            return NextResponse.json({
                message: "Web Search is built-in and active by default.",
                redirectUrl: ""
            });
        }

        let redirectUrl = "";

        // Authorize with Composio - try toolkits.authorize with fallback to session.authorize
        try {
            const connection = await composio.toolkits.authorize(
                userEmail,
                normalizedSlug
            );
            redirectUrl = connection?.redirectUrl || (connection as any)?.url || "";
        } catch (authErr: any) {
            console.warn("toolkits.authorize failed, falling back to session.authorize:", authErr?.message);
            try {
                const session = await composio.sessions.create(userEmail);
                const connection = await session.authorize(normalizedSlug);
                redirectUrl = connection?.redirectUrl || (connection as any)?.url || "";
            } catch (sessionErr: any) {
                console.error("session.authorize also failed:", sessionErr);
                throw sessionErr;
            }
        }

        console.log(`Generated Composio authorization URL for ${normalizedSlug}:`, redirectUrl);

        return NextResponse.json({
            redirectUrl: redirectUrl
        });
    } catch (err: any) {
        console.error("Failed to initiate tool connection:", err);
        return NextResponse.json({
            error: err?.message || "Failed to initiate tool connection"
        }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { slug, connectedAccountId } = await req.json();
        const userEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;

        // 1. Delete by connectedAccountId if provided
        if (connectedAccountId) {
            try {
                await composio.connectedAccounts.delete(connectedAccountId);
                console.log(`Deleted connected account ${connectedAccountId}`);
            } catch (delErr: any) {
                console.warn(`Failed to delete account ${connectedAccountId}:`, delErr?.message);
            }
        }

        // 2. Also find and delete active connections for this user & toolkit slug
        if (slug && userEmail) {
            const lowerSlug = String(slug).toLowerCase().trim();
            const normalizedSlug = SLUG_ALIASES[lowerSlug] || lowerSlug;

            try {
                const accounts = await composio.connectedAccounts.list({
                    userIds: [userEmail],
                    toolkitSlugs: [normalizedSlug],
                });

                if (accounts?.items && accounts.items.length > 0) {
                    for (const account of accounts.items) {
                        try {
                            await composio.connectedAccounts.delete(account.id);
                            console.log(`Deleted account ${account.id} for ${normalizedSlug}`);
                        } catch (e: any) {
                            console.warn(`Failed to delete account ${account.id}:`, e?.message);
                        }
                    }
                }
            } catch (listErr: any) {
                console.warn("Could not list accounts for deletion:", listErr?.message);
            }
        }

        return NextResponse.json({ success: true, message: "Disconnected successfully" });
    } catch (err: any) {
        console.error("Failed to disconnect tool:", err);
        return NextResponse.json({
            error: err?.message || "Failed to disconnect tool"
        }, { status: 500 });
    }
}
