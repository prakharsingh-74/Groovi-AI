'use client'
import React, { useState } from "react"
import { Button } from "@/components/ui/button"

type Integration = {
    id: string
    name: string
    description: string
    icon: string
    connected: boolean
}

const INTEGRATIONS: Integration[] = [
    {
        id: "gmail",
        name: "Gmail",
        description: "Search, read, draft and send Gmail messages.",
        icon: "M",
        connected: false,
    },
    {
        id: "slack",
        name: "Slack",
        description: "Read channels, search messages and send Slack messages.",
        icon: "S",
        connected: true,
    },
    {
        id: "notion",
        name: "Notion",
        description: "Search, read and update pages and databases in Notion.",
        icon: "N",
        connected: false,
    },
    {
        id: "github",
        name: "GitHub",
        description: "Read repositories, issues and pull requests and perform repository actions.",
        icon: "G",
        connected: false,
    },
    {
        id: "outlook",
        name: "Microsoft Outlook",
        description: "Read, send, and manage Outlook emails and calendar events.",
        icon: "O",
        connected: false,
    },
    {
        id: "google-calendar",
        name: "Google Calendar",
        description: "Read calendar events, check availability, create meetings, update events and manage...",
        icon: "C",
        connected: false,
    },
    {
        id: "discord",
        name: "Discord",
        description: "Manage Discord servers, channels, messages, and members.",
        icon: "D",
        connected: false,
    },
    {
        id: "reddit",
        name: "Reddit",
        description: "Read Reddit content and create or manage posts and comments.",
        icon: "R",
        connected: true,
    },
    {
        id: "linkedin",
        name: "LinkedIn",
        description: "Publish content and interact with LinkedIn professional networks.",
        icon: "in",
        connected: false,
    },
]

const ICON_COLORS: Record<string, { bg: string; text: string }> = {
    gmail: { bg: "bg-red-50", text: "text-red-600" },
    slack: { bg: "bg-purple-50", text: "text-purple-600" },
    notion: { bg: "bg-slate-100", text: "text-slate-800" },
    github: { bg: "bg-slate-100", text: "text-slate-800" },
    outlook: { bg: "bg-blue-50", text: "text-blue-600" },
    "google-calendar": { bg: "bg-blue-50", text: "text-blue-600" },
    discord: { bg: "bg-indigo-50", text: "text-indigo-600" },
    reddit: { bg: "bg-orange-50", text: "text-orange-600" },
    linkedin: { bg: "bg-blue-50", text: "text-blue-700" },
}

function IntegrationsPage() {
    const [integrations, setIntegrations] = useState(INTEGRATIONS)

    const toggleConnection = (id: string) => {
        setIntegrations((prev) =>
            prev.map((i) =>
                i.id === id ? { ...i, connected: !i.connected } : i
            )
        )
    }

    return (
        <div className="w-full flex justify-center">
            <div className="w-full max-w-4xl px-6 pt-12 pb-16">
                <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Connect the tools your agents need to get work done.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    {integrations.map((integration) => {
                        const colors = ICON_COLORS[integration.id] || { bg: "bg-gray-100", text: "text-gray-700" }
                        return (
                            <div
                                key={integration.id}
                                className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                            >
                                <div className="flex items-start justify-between">
                                    <div
                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colors.bg} text-lg font-bold ${colors.text}`}
                                    >
                                        {integration.icon}
                                    </div>
                                    <span
                                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                            integration.connected
                                                ? "bg-green-100 text-green-700"
                                                : "bg-slate-100 text-slate-500"
                                        }`}
                                    >
                                        {integration.connected ? "Connected" : "Not Connected"}
                                    </span>
                                </div>

                                <h3 className="font-semibold text-foreground mt-3">{integration.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 flex-1">
                                    {integration.description}
                                </p>

                                <Button
                                    variant={integration.connected ? "outline" : "default"}
                                    onClick={() => toggleConnection(integration.id)}
                                    className={`mt-4 w-full rounded-xl ${
                                        integration.connected
                                            ? "border-slate-200"
                                            : "bg-slate-900 hover:bg-slate-800 text-white"
                                    }`}
                                >
                                    {integration.connected ? "Disconnect" : "Connect"}
                                </Button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default IntegrationsPage
