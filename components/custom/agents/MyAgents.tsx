'use client'
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, MessageSquare, MoreHorizontal, CalendarClock } from "lucide-react"

const MOCK_AGENTS = [
    {
        id: 1,
        name: "Reddit AI Trends Digest Agent",
        description: "Searches Reddit for top trending AI topics...",
        status: "ACTIVE",
        schedule: "daily at 08:00",
        avatar: "🤖",
        avatarBg: "bg-amber-100",
    },
    {
        id: 2,
        name: "Daily Unread Email Digest",
        description: "Summarizes unread emails from the past 3 days...",
        status: "ACTIVE",
        schedule: "daily at 08:00",
        avatar: "🤖",
        avatarBg: "bg-green-100",
    },
    {
        id: 3,
        name: "Daily Slack Evening Greeting",
        description: "Sends a personalized evening greeting directly to...",
        status: "ACTIVE",
        schedule: "daily at 22:10",
        avatar: "💬",
        avatarBg: "bg-blue-100",
    },
]

function MyAgents() {
    return (
        <div className="mt-5">
            <h2 className="text-2xl font-bold tracking-tight">My Agents</h2>
            <p className="text-sm text-muted-foreground mt-1">
                Run, Manage and Update All the agents you&apos;ve created.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {MOCK_AGENTS.map((agent) => (
                    <div
                        key={agent.id}
                        className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${agent.avatarBg} text-lg`}
                            >
                                {agent.avatar}
                            </div>
                            <button className="text-muted-foreground hover:text-foreground p-1">
                                <MoreHorizontal className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-3">
                            <h3 className="font-semibold text-foreground">
                                {agent.name}{" "}
                                <span className="ml-1.5 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                    {agent.status}
                                </span>
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                {agent.description}
                            </p>
                        </div>

                        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                            <CalendarClock className="h-3.5 w-3.5" />
                            {agent.schedule}
                        </p>

                        <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm" className="gap-1.5 flex-1">
                                <Play className="h-3.5 w-3.5" />
                                Run Agent
                            </Button>
                            <Button size="sm" className="gap-1.5 flex-1 bg-slate-900 hover:bg-slate-800 text-white">
                                <MessageSquare className="h-3.5 w-3.5" />
                                Chat With Agent
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MyAgents
