'use client'
import { UserDetailContext } from "@/context/UserDetailContext"
import { CheckCircle2, Zap, CalendarClock, AlertTriangle, RefreshCw, ArrowRight } from "lucide-react"
import { useContext } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

function DashboardPage() {
    const { userDetail } = useContext(UserDetailContext)
    const router = useRouter()

    const now = new Date()
    const hour = now.getHours()
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
    const dateStr = now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    })

    const stats = [
        {
            label: "Completed",
            sublabel: "finished runs",
            value: 7,
            icon: CheckCircle2,
            bg: "bg-green-50",
            iconColor: "text-green-500",
            border: "border-green-100",
        },
        {
            label: "Running",
            sublabel: "active agents",
            value: 0,
            icon: Zap,
            bg: "bg-blue-50",
            iconColor: "text-blue-500",
            border: "border-blue-100",
        },
        {
            label: "Scheduled",
            sublabel: "coming up",
            value: 4,
            icon: CalendarClock,
            bg: "bg-amber-50",
            iconColor: "text-amber-500",
            border: "border-amber-100",
        },
        {
            label: "Attention",
            sublabel: "need review",
            value: 0,
            icon: AlertTriangle,
            bg: "bg-red-50",
            iconColor: "text-red-400",
            border: "border-red-100",
        },
    ]

    return (
        <div className="w-full flex justify-center">
            <div className="w-full max-w-4xl px-6 pt-12 pb-16">
                {/* Header Card */}
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
                                {dateStr}
                            </p>
                            <h1 className="text-3xl font-bold tracking-tight mt-1">
                                {greeting}, {userDetail?.name?.split(" ")[0] || "there"}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1.5 max-w-lg">
                                Here&apos;s the latest pulse from your agents, runs, schedules, and anything that needs a closer look.
                            </p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2 text-xs shrink-0">
                            <RefreshCw className="h-3.5 w-3.5" />
                            Refresh briefing
                        </Button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        {stats.map((stat, i) => (
                            <div
                                key={i}
                                className={`rounded-2xl border ${stat.border} ${stat.bg} p-4 flex flex-col items-start gap-2`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                                    <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{stat.label}</p>
                                    <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Briefing */}
                <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
                    <div className="h-1 w-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-full mb-5" />
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                            <Zap className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-lg">Your AI briefing</h2>
                                <span className="text-xs text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
                                    Updated just now
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                Your agents completed 7 tasks recently. No agents are running right now.
                                Everything looks clear. 4 runs are scheduled next.
                            </p>
                            <div className="flex items-center gap-6 mt-4">
                                <span className="flex items-center gap-1.5 text-sm font-medium">
                                    <span className="h-2 w-2 rounded-full bg-green-500" /> 7 completed
                                </span>
                                <span className="flex items-center gap-1.5 text-sm font-medium">
                                    <span className="h-2 w-2 rounded-full bg-blue-500" /> 0 running
                                </span>
                                <span className="flex items-center gap-1.5 text-sm font-medium">
                                    <span className="h-2 w-2 rounded-full bg-amber-500" /> 0 needs attention
                                </span>
                                <button
                                    onClick={() => router.push("/dashboard/runs")}
                                    className="ml-auto text-sm font-medium flex items-center gap-1 hover:underline"
                                >
                                    View all runs <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Needs Attention */}
                    <div>
                        <h2 className="font-bold text-lg flex items-center gap-2 mb-3">
                            Needs your attention
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        </h2>
                        <div className="rounded-2xl border bg-green-50 border-green-100 px-5 py-4">
                            <p className="text-sm text-green-700 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                No runs need attention right now.
                            </p>
                        </div>
                    </div>

                    {/* Running Now */}
                    <div>
                        <h2 className="font-bold text-lg mb-3">Running now</h2>
                        <div className="rounded-2xl border bg-blue-50 border-blue-100 px-5 py-4">
                            <p className="text-sm text-blue-700 flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                No agents are running right now.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage