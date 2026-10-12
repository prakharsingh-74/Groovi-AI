'use client'

import React, { useContext, useEffect, useState, useCallback } from "react";
import { UserDetailContext } from "@/context/UserDetailContext";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
    Check,
    CheckCircle2,
    Zap,
    Calendar,
    AlertTriangle,
    RefreshCw,
    ArrowRight,
    Clock,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type AgentRunItem = {
    id: string;
    agentId: string;
    email: string;
    status: string;
    output: any;
    error: any;
    completedAt?: string | null;
    createdAt?: string | null;
    scheduledFor?: string | null;
    name?: string | null;
    agentImage?: string | null;
    task?: string | null;
};

function formatRelativeTime(dateString?: string | null): string {
    if (!dateString) return "Recently";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Recently";
        return formatDistanceToNow(date, { addSuffix: true });
    } catch {
        return "Recently";
    }
}

function formatScheduledTime(dateString?: string | null): string {
    if (!dateString) return "Upcoming";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Upcoming";
        if (isToday(date)) {
            return `Today at ${format(date, "h:mm a")}`;
        }
        if (isTomorrow(date)) {
            return `Tomorrow at ${format(date, "h:mm a")}`;
        }
        return format(date, "EEE, MMM d 'at' h:mm a");
    } catch {
        return "Upcoming";
    }
}

function DashboardPage() {
    const { userDetail } = useContext(UserDetailContext);
    const { user } = useUser();
    const router = useRouter();

    const [runs, setRuns] = useState<AgentRunItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [selectedRun, setSelectedRun] = useState<AgentRunItem | null>(null);

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const dateStr = now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

    const firstName =
        user?.firstName ||
        userDetail?.name?.split(" ")[0] ||
        "there";

    const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
        if (isManualRefresh) setIsRefreshing(true);
        else setLoading(true);

        try {
            const res = await axios.get("/api/agent-log");
            const data: AgentRunItem[] = Array.isArray(res.data) ? res.data : [];
            setRuns(data);
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const completedRuns = runs.filter((r) => r.status?.toLowerCase() === "completed");
    const runningRuns = runs.filter((r) => r.status?.toLowerCase() === "running");
    const scheduledRuns = runs.filter((r) =>
        r.status?.toLowerCase() === "scheduled" || r.status?.toLowerCase() === "queued"
    );
    const failedRuns = runs.filter((r) => r.status?.toLowerCase() === "failed");

    const completedCount = completedRuns.length;
    const runningCount = runningRuns.length;
    const scheduledCount = scheduledRuns.length;
    const attentionCount = failedRuns.length;

    const briefingText = `Your agents completed ${completedCount} task${
        completedCount === 1 ? "" : "s"
    } recently. ${
        runningCount > 0
            ? `${runningCount} agent${runningCount > 1 ? "s are" : " is"} running right now.`
            : "No agents are running right now."
    } ${
        attentionCount > 0
            ? `${attentionCount} task${attentionCount > 1 ? "s need" : " needs"} review.`
            : "Everything looks clear."
    } ${scheduledCount} run${scheduledCount === 1 ? " is" : "s are"} scheduled next.`;

    return (
        <div className="w-full flex justify-center bg-slate-50/30 min-h-screen">
            <div className="w-full max-w-5xl px-4 sm:px-8 py-8 sm:py-10">
                {/* 1. Header Card with Greetings & Top 4 Stats */}
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 font-medium">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {dateStr}
                            </p>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2">
                                {greeting}, {firstName}
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed max-w-xl">
                                Here&apos;s the latest pulse from your agents, runs, schedules, and anything that needs a closer look.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchDashboardData(true)}
                            disabled={isRefreshing}
                            className="rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 gap-1.5 shrink-0 shadow-none cursor-pointer"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
                            Refresh briefing
                        </Button>
                    </div>

                    {/* Top 4 Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
                        {/* Completed */}
                        <div className="rounded-2xl border border-emerald-100 bg-[#f0fdf4] p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <Check className="w-4 h-4 stroke-[2.5]" />
                                </div>
                                <span className="text-2xl font-bold text-slate-900">
                                    {loading ? "-" : completedCount}
                                </span>
                            </div>
                            <div className="mt-4">
                                <p className="text-xs font-bold text-slate-800">Completed</p>
                                <p className="text-[11px] text-slate-400">finished runs</p>
                            </div>
                        </div>

                        {/* Running */}
                        <div className="rounded-2xl border border-sky-100 bg-[#f0f9ff] p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
                                    <Zap className="w-4 h-4 fill-sky-600" />
                                </div>
                                <span className="text-2xl font-bold text-slate-900">
                                    {loading ? "-" : runningCount}
                                </span>
                            </div>
                            <div className="mt-4">
                                <p className="text-xs font-bold text-slate-800">Running</p>
                                <p className="text-[11px] text-slate-400">active agents</p>
                            </div>
                        </div>

                        {/* Scheduled */}
                        <div className="rounded-2xl border border-purple-100 bg-[#faf5ff] p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <span className="text-2xl font-bold text-slate-900">
                                    {loading ? "-" : scheduledCount}
                                </span>
                            </div>
                            <div className="mt-4">
                                <p className="text-xs font-bold text-slate-800">Scheduled</p>
                                <p className="text-[11px] text-slate-400">coming up</p>
                            </div>
                        </div>

                        {/* Attention */}
                        <div className="rounded-2xl border border-amber-100 bg-[#fffbeb] p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                                <span className="text-2xl font-bold text-slate-900">
                                    {loading ? "-" : attentionCount}
                                </span>
                            </div>
                            <div className="mt-4">
                                <p className="text-xs font-bold text-slate-800">Attention</p>
                                <p className="text-[11px] text-slate-400">need review</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Your AI briefing Card */}
                <div className="mt-6 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs relative overflow-hidden">
                    {/* Gradient top bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-blue-500 to-amber-400" />

                    <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm sm:text-base text-slate-900">Your AI briefing</h3>
                                <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full">
                                    Updated just now
                                </span>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                                {loading ? "Loading recent agent performance..." : briefingText}
                            </p>

                            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#e6f8ee] text-[#16a34a]">
                                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                        {completedCount} completed
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-600">
                                        <Zap className="w-3.5 h-3.5 fill-sky-600" />
                                        {runningCount} running
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        {attentionCount} needs attention
                                    </span>
                                </div>

                                <button
                                    onClick={() => router.push("/dashboard/runs")}
                                    className="text-xs font-semibold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1 cursor-pointer hover:underline"
                                >
                                    View all runs <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Middle Row: Needs your attention & Running now */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {/* Needs your attention */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="font-bold text-sm sm:text-base text-slate-900">Needs your attention</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                {attentionCount}
                            </span>
                        </div>

                        {attentionCount === 0 ? (
                            <div className="rounded-2xl border border-emerald-200 bg-[#f0fdf4] px-4 py-3.5 flex items-center gap-2 text-xs text-emerald-700 font-medium">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>No runs need attention right now.</span>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3 space-y-2">
                                {failedRuns.slice(0, 3).map((run) => (
                                    <div
                                        key={run.id}
                                        className="flex items-center justify-between text-xs p-3 rounded-xl bg-white border border-amber-100"
                                    >
                                        <div>
                                            <p className="font-bold text-slate-900">{run.name || "Agent"}</p>
                                            <p className="text-red-600 truncate max-w-[200px] mt-0.5">
                                                {run.error || "Execution failed"}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedRun(run)}
                                            className="text-purple-600 font-semibold hover:underline text-xs"
                                        >
                                            View
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Running now */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="font-bold text-sm sm:text-base text-slate-900">Running now</h3>
                        </div>

                        {runningCount === 0 ? (
                            <div className="rounded-2xl border border-sky-200 bg-[#f0f9ff] px-4 py-3.5 flex items-center gap-2 text-xs text-sky-700 font-medium">
                                <Zap className="w-4 h-4 text-sky-600 fill-sky-600 shrink-0" />
                                <span>No agents are running right now.</span>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-3 space-y-2">
                                {runningRuns.map((run) => (
                                    <div
                                        key={run.id}
                                        className="flex items-center justify-between text-xs p-3 rounded-xl bg-white border border-sky-100"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                                            <p className="font-bold text-slate-900">{run.name || "Agent"}</p>
                                        </div>
                                        <span className="text-slate-400">In progress...</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Bottom Row: Latest results & Up next */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {/* Latest results */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="font-bold text-sm sm:text-base text-slate-900">Latest results</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                {completedCount}
                            </span>
                        </div>

                        <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="p-4 flex items-center gap-3">
                                        <Skeleton className="w-10 h-10 rounded-2xl" />
                                        <div className="flex-1 space-y-1.5">
                                            <Skeleton className="h-4 w-40" />
                                            <Skeleton className="h-3 w-56" />
                                        </div>
                                    </div>
                                ))
                            ) : completedRuns.length === 0 ? (
                                <div className="py-8 text-center text-xs text-slate-400">
                                    No completed agent runs yet.
                                </div>
                            ) : (
                                completedRuns.slice(0, 5).map((run) => (
                                    <div
                                        key={run.id}
                                        className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Avatar with status indicator */}
                                            <div className="relative shrink-0">
                                                <div className="w-10 h-10 rounded-2xl bg-[#edf1f7] flex items-center justify-center overflow-hidden border border-slate-100">
                                                    {run.agentImage ? (
                                                        <img
                                                            src={run.agentImage}
                                                            alt={run.name || "Agent"}
                                                            className="w-8 h-8 object-contain rounded-xl"
                                                        />
                                                    ) : (
                                                        <div className="w-7 h-7 rounded-full bg-sky-400 flex items-center justify-center text-[10px] text-white font-bold">
                                                            {run.name?.slice(0, 1) || "A"}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                                            </div>

                                            {/* Name & Task */}
                                            <div className="min-w-0">
                                                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                                    {run.name || "Agent"}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-[260px] mt-0.5">
                                                    {run.task || "Autonomous execution"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Time & View link */}
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-[11px] text-slate-400 whitespace-nowrap hidden sm:inline">
                                                {formatRelativeTime(run.completedAt || run.createdAt)}
                                            </span>
                                            <button
                                                onClick={() => setSelectedRun(run)}
                                                className="text-xs font-semibold text-purple-700 hover:text-purple-900 hover:underline cursor-pointer whitespace-nowrap"
                                            >
                                                View result
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Up next */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="font-bold text-sm sm:text-base text-slate-900">Up next</h3>
                        </div>

                        <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 2 }).map((_, i) => (
                                    <div key={i} className="p-4 flex items-center gap-3">
                                        <Skeleton className="w-9 h-9 rounded-xl" />
                                        <div className="flex-1 space-y-1.5">
                                            <Skeleton className="h-4 w-40" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    </div>
                                ))
                            ) : scheduledRuns.length === 0 ? (
                                <div className="py-8 text-center text-xs text-slate-400">
                                    No scheduled runs coming up.
                                </div>
                            ) : (
                                scheduledRuns.slice(0, 5).map((run) => (
                                    <div
                                        key={run.id}
                                        className="p-4 flex items-center gap-3 hover:bg-slate-50/50 transition-colors"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                                {run.name || "Scheduled Agent"}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {formatScheduledTime(run.scheduledFor || run.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Run Result Detail Modal */}
            {selectedRun && (
                <Dialog open={Boolean(selectedRun)} onOpenChange={(open) => !open && setSelectedRun(null)}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <div className="flex items-center justify-between gap-2 pr-6">
                                <DialogTitle className="text-lg font-bold text-slate-900">
                                    {selectedRun.name || "Agent Run"}
                                </DialogTitle>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e6f8ee] text-[#16a34a] border border-[#16a34a]/20">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                                    <span className="capitalize">{selectedRun.status}</span>
                                </span>
                            </div>
                            <DialogDescription className="text-xs text-slate-500 mt-1">
                                {selectedRun.task || "Task details and run execution result."}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 my-2 text-xs">
                            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <div>
                                    <span className="text-slate-400 block">Agent ID</span>
                                    <span className="font-mono text-slate-700 truncate block">
                                        {selectedRun.agentId}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block">Executed At</span>
                                    <span className="text-slate-700 block">
                                        {selectedRun.completedAt
                                            ? new Date(selectedRun.completedAt).toLocaleString()
                                            : selectedRun.createdAt
                                            ? new Date(selectedRun.createdAt).toLocaleString()
                                            : "Recent"}
                                    </span>
                                </div>
                            </div>

                            {selectedRun.error && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700">
                                    <span className="font-semibold block mb-1">Error Details</span>
                                    <p className="font-mono whitespace-pre-wrap">
                                        {String(selectedRun.error)}
                                    </p>
                                </div>
                            )}

                            <div>
                                <span className="font-semibold text-slate-800 block mb-1.5">
                                    Final Output
                                </span>
                                <div className="max-h-60 overflow-y-auto rounded-xl bg-slate-900 text-slate-100 p-3.5 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                                    {selectedRun.output
                                        ? typeof selectedRun.output === "object"
                                            ? JSON.stringify(selectedRun.output, null, 2)
                                            : String(selectedRun.output)
                                        : "No output generated for this run."}
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

export default DashboardPage;