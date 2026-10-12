'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type ToolsType = {
    id?: string;
    slug: string;
    name: string;
    icon: string;
    description: string;
    enabled?: boolean;
    connected: string;
    account?: { id: string; status: string } | null;
};

function ToolIcon({ slug, icon, name }: { slug: string; icon?: string; name: string }) {
    const [imgFailed, setImgFailed] = useState(false);
    const lower = (slug || "").toLowerCase();

    if (icon && !imgFailed) {
        return (
            <img
                src={icon}
                alt={name}
                width={36}
                height={36}
                className="object-contain max-h-8 max-w-8 rounded-sm"
                onError={() => setImgFailed(true)}
            />
        );
    }

    if (lower.includes("slack")) {
        return (
            <div className="w-8 h-8 rounded-lg bg-[#4A154B] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
                #
            </div>
        );
    }
    if (lower.includes("notion")) {
        return (
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white font-serif font-bold text-sm shrink-0 shadow-xs">
                N
            </div>
        );
    }
    if (lower.includes("calendar")) {
        return (
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                31
            </div>
        );
    }
    if (lower.includes("sheet")) {
        return (
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H6v-2h6v2zm0-4H6v-2h6v2zm0-4H6V7h6v2zm6 8h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V7h4v2z" />
                </svg>
            </div>
        );
    }
    if (lower.includes("github")) {
        return (
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white shrink-0 shadow-xs">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
            </div>
        );
    }
    if (lower.includes("gmail") || lower.includes("mail")) {
        return (
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                M
            </div>
        );
    }
    if (lower.includes("supabase")) {
        return (
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0 shadow-xs">
                ⚡
            </div>
        );
    }
    if (lower.includes("outlook")) {
        return (
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                O
            </div>
        );
    }
    if (lower.includes("browserbase")) {
        return (
            <div className="w-8 h-8 rounded-lg bg-[#FF5C00] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                B
            </div>
        );
    }

    return (
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-xs uppercase">
            {name?.charAt(0) || "T"}
        </div>
    );
}

function Integrations() {
    const { user } = useUser();
    const [toolList, setToolList] = useState<ToolsType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

    useEffect(() => {
        GetAllTools();
    }, []);

    const GetAllTools = async () => {
        try {
            setLoading(true);
            const result = await axios.get('/api/integrations');
            console.log("Loaded tools:", result.data);
            setToolList(result.data);
        } catch (err) {
            console.error("Failed to fetch tools:", err);
        } finally {
            setLoading(false);
        }
    };

    const connectTool = async (slug: string, toolName?: string) => {
        // 1. Open popup window synchronously on user click to prevent popup blockers
        const authWindow = window.open(
            'about:blank',
            '_blank',
            'width=650,height=750,top=100,left=100,resizable=yes,scrollbars=yes'
        );

        if (authWindow) {
            try {
                authWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Connecting to ${toolName || slug} - Groovi AI</title>
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <style>
                            body {
                                margin: 0;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                min-height: 100vh;
                                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                                background: #09090b;
                                color: #f4f4f5;
                            }
                            .box {
                                text-align: center;
                                padding: 32px;
                                max-width: 380px;
                            }
                            .loader {
                                width: 38px;
                                height: 38px;
                                border: 3px solid rgba(255, 255, 255, 0.15);
                                border-top-color: #6366f1;
                                border-radius: 50%;
                                animation: spin 0.8s linear infinite;
                                margin: 0 auto 18px;
                            }
                            @keyframes spin { to { transform: rotate(360deg); } }
                            h2 { font-size: 18px; font-weight: 600; margin: 0 0 8px; }
                            p { font-size: 13px; color: #a1a1aa; margin: 0; line-height: 1.5; }
                        </style>
                    </head>
                    <body>
                        <div class="box">
                            <div class="loader"></div>
                            <h2>Connecting ${toolName || slug}...</h2>
                            <p>Connecting to secure Composio authorization window.</p>
                        </div>
                    </body>
                    </html>
                `);
            } catch (docErr) {
                console.warn("Could not write initial popup HTML:", docErr);
            }
        }

        try {
            setLoadingSlug(slug);
            const result = await axios.post('/api/integrations/tool-connection', {
                slug: slug,
            });

            console.log("Connect result:", result.data);

            if (result.data?.redirectUrl) {
                if (authWindow && !authWindow.closed) {
                    authWindow.location.href = result.data.redirectUrl;
                    authWindow.focus();
                } else {
                    window.open(result.data.redirectUrl, '_blank');
                }

                // Poll for popup closure to automatically refresh status to 'Connected'
                const pollInterval = setInterval(() => {
                    if (authWindow?.closed) {
                        clearInterval(pollInterval);
                        GetAllTools();
                    }
                }, 1200);
            } else if (result.data?.message) {
                if (authWindow && !authWindow.closed) authWindow.close();
                alert(result.data.message);
                await GetAllTools();
            } else {
                if (authWindow && !authWindow.closed) authWindow.close();
            }
        } catch (error: any) {
            console.error("Failed to connect tool:", error);
            if (authWindow && !authWindow.closed) authWindow.close();
            alert(error?.response?.data?.error || "Failed to initiate tool connection");
        } finally {
            setLoadingSlug(null);
        }
    };

    const disconnectTool = async (slug: string, connectedAccountId?: string | null) => {
        try {
            setLoadingSlug(slug);
            const result = await axios.delete('/api/integrations/tool-connection', {
                data: {
                    slug: slug,
                    connectedAccountId: connectedAccountId,
                },
            });
            console.log("Disconnect result:", result.data);

            // Re-fetch tools to update status
            await GetAllTools();
        } catch (error) {
            console.error("Failed to disconnect tool:", error);
        } finally {
            setLoadingSlug(null);
        }
    };

    return (
        <div className="p-10 md:px-10 lg:px-28">
            <h2 className="font-bold text-3xl">Integrations</h2>
            <p className="text-muted-foreground mt-1">Connect the tools your agents need to work done.</p>

            {loading && toolList.length === 0 ? (
                <div className="flex items-center justify-center min-h-[300px]">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                    {toolList?.map((tool) => {
                        const isConnected = tool.connected === 'Connected';
                        const isActionLoading = loadingSlug === tool.slug;

                        return (
                            <div key={tool.slug} className="border rounded-2xl p-4 flex flex-col justify-between hover:shadow-sm transition-shadow bg-card">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-muted/60 overflow-hidden shrink-0">
                                            <ToolIcon slug={tool.slug} icon={tool.icon} name={tool.name} />
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                                                isConnected
                                                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                                                    : 'text-zinc-600 bg-zinc-100 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                                            }`}
                                        >
                                            {tool.connected}
                                        </Badge>
                                    </div>
                                    <div className="mt-3">
                                        <h2 className="text-lg font-medium">{tool.name}</h2>
                                        <p className="line-clamp-2 text-sm text-muted-foreground mt-1">{tool.description}</p>
                                    </div>
                                </div>
                                <div className="mt-5">
                                    {isConnected ? (
                                        <Button
                                            variant="outline"
                                            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-950/30"
                                            onClick={() => disconnectTool(tool.slug, tool.account?.id)}
                                            disabled={isActionLoading}
                                        >
                                            {isActionLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                    Disconnecting...
                                                </>
                                            ) : (
                                                "Disconnect"
                                            )}
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            onClick={() => connectTool(tool.slug, tool.name)}
                                            disabled={isActionLoading}
                                        >
                                            {isActionLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                    Connecting...
                                                </>
                                            ) : (
                                                "Connect"
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Integrations;