import React from "react"

const RUNS_DATA = [
    {
        agent: "Reddit AI Trends Digest Agent",
        task: "Searches Reddit for top trending AI topics,...",
        status: "running",
        updated: "a few seconds ago",
    },
    {
        agent: "Reddit AI Trends Digest Agent",
        task: "Searches Reddit for top trending AI topics,...",
        status: "scheduled",
        updated: "3 minutes ago",
    },
    {
        agent: "Daily Unread Email Digest",
        task: "Summarizes unread emails from the past 3 ...",
        status: "scheduled",
        updated: "11 hours ago",
    },
    {
        agent: "Daily Slack Evening Greeting",
        task: "Sends a personalized evening greeting dire...",
        status: "scheduled",
        updated: "a day ago",
    },
    {
        agent: "Daily Slack Evening Greeting",
        task: "Sends a personalized evening greeting dire...",
        status: "completed",
        updated: "a day ago",
    },
    {
        agent: "Daily Unread Email Digest",
        task: "Summarizes unread emails from the past 3 ...",
        status: "completed",
        updated: "11 hours ago",
    },
]

function getStatusColor(status: string) {
    switch (status) {
        case "running":
            return "bg-green-500"
        case "scheduled":
            return "bg-blue-500"
        case "completed":
            return "bg-green-500"
        case "failed":
            return "bg-red-500"
        default:
            return "bg-gray-400"
    }
}

function getStatusBadge(status: string) {
    const colors: Record<string, string> = {
        running: "bg-green-100 text-green-700",
        scheduled: "bg-blue-100 text-blue-700",
        completed: "bg-green-100 text-green-700",
        failed: "bg-red-100 text-red-700",
    }
    return colors[status] || "bg-gray-100 text-gray-700"
}

function RunsPage() {
    const completedCount = RUNS_DATA.filter((r) => r.status === "completed").length
    const failedCount = RUNS_DATA.filter((r) => r.status === "failed").length
    const scheduledCount = RUNS_DATA.filter((r) => r.status === "scheduled").length

    return (
        <div className="w-full flex justify-center">
            <div className="w-full max-w-4xl px-6 pt-12 pb-16">
                <h1 className="text-3xl font-bold tracking-tight">Agent Runs</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    See what your agents are working on and review their results.
                </p>

                {/* Summary badges */}
                <div className="flex gap-6 mt-6 rounded-2xl border bg-white px-6 py-4 shadow-sm">
                    <div className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        <span className="text-sm font-medium">Completed</span>
                        <span className="text-sm font-bold ml-auto">{completedCount}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                        <span className="text-sm font-medium">Failed</span>
                        <span className="text-sm font-bold ml-auto">{failedCount}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">Scheduled</span>
                        <span className="text-sm font-bold ml-auto">{scheduledCount}</span>
                    </div>
                </div>

                {/* Recent Runs Table */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Recent Runs</h2>
                    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-slate-50">
                                    <th className="text-left px-5 py-3.5 font-semibold text-muted-foreground">Agent</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-muted-foreground">Task</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-muted-foreground">Status</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-muted-foreground">Updated</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-muted-foreground">Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                {RUNS_DATA.map((run, i) => (
                                    <tr key={i} className="border-b last:border-b-0 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-4 font-medium text-foreground">{run.agent}</td>
                                        <td className="px-5 py-4 text-muted-foreground max-w-[200px] truncate">{run.task}</td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(run.status)}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${getStatusColor(run.status)}`} />
                                                {run.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-muted-foreground">{run.updated}</td>
                                        <td className="px-5 py-4">
                                            <button className="text-sm font-medium text-blue-600 hover:underline">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RunsPage
