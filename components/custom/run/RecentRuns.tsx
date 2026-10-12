'use client'

import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export type AgentRunType = {
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

type RecentRunsProps = {
    agentRuns: AgentRunType[];
    loading?: boolean;
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

function getStatusBadge(status?: string) {
    const s = (status || "").toLowerCase();
    switch (s) {
        case "completed":
            return {
                className: "bg-[#e6f8ee] text-[#16a34a] border border-[#16a34a]/20",
                dot: "bg-[#16a34a]",
                label: "• completed",
            };
        case "failed":
            return {
                className: "bg-red-50 text-red-600 border border-red-200",
                dot: "bg-red-500",
                label: "• failed",
            };
        case "running":
            return {
                className: "bg-purple-50 text-purple-700 border border-purple-200",
                dot: "bg-purple-600",
                label: "• running",
            };
        case "queued":
            return {
                className: "bg-amber-50 text-amber-700 border border-amber-200",
                dot: "bg-amber-500",
                label: "• queued",
            };
        case "scheduled":
        default:
            return {
                className: "bg-slate-100 text-slate-700 border border-slate-200",
                dot: "bg-slate-500",
                label: "• scheduled",
            };
    }
}

function RecentRuns({ agentRuns, loading = false }: RecentRunsProps) {
    const [selectedRun, setSelectedRun] = useState<AgentRunType | null>(null);

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">
                Recent Runs
            </h2>

            <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
                <Table>
                    <TableHeader className="bg-slate-50/70 border-b border-slate-100">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="py-3.5 px-6 font-semibold text-slate-700 text-xs sm:text-sm">
                                Agent
                            </TableHead>
                            <TableHead className="py-3.5 px-6 font-semibold text-slate-700 text-xs sm:text-sm">
                                Task
                            </TableHead>
                            <TableHead className="py-3.5 px-6 font-semibold text-slate-700 text-xs sm:text-sm">
                                Status
                            </TableHead>
                            <TableHead className="py-3.5 px-6 font-semibold text-slate-700 text-xs sm:text-sm">
                                Updated
                            </TableHead>
                            <TableHead className="py-3.5 px-6 font-semibold text-slate-700 text-xs sm:text-sm">
                                Result
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <TableRow key={i} className="border-b border-slate-100">
                                    <TableCell className="px-6 py-4">
                                        <Skeleton className="h-4 w-36 rounded-md" />
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <Skeleton className="h-4 w-52 rounded-md" />
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <Skeleton className="h-4 w-20 rounded-md" />
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <Skeleton className="h-4 w-10 rounded-md" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : agentRuns.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell
                                    colSpan={5}
                                    className="py-10 text-center text-sm text-slate-400"
                                >
                                    No recent agent runs found
                                </TableCell>
                            </TableRow>
                        ) : (
                            agentRuns.map((run) => {
                                const badge = getStatusBadge(run.status);
                                const updatedTime = formatRelativeTime(
                                    run.completedAt || run.createdAt || run.scheduledFor
                                );

                                return (
                                    <TableRow
                                        key={run.id}
                                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                                    >
                                        <TableCell className="px-6 py-4 font-medium text-slate-900 text-xs sm:text-sm max-w-[220px] truncate">
                                            {run.name || "Agent"}
                                        </TableCell>

                                        <TableCell className="px-6 py-4 text-slate-500 text-xs sm:text-sm max-w-[280px] truncate">
                                            {run.task || "Autonomous execution task"}
                                        </TableCell>

                                        <TableCell className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${badge.className}`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${badge.dot}`}
                                                />
                                                <span className="capitalize">{run.status}</span>
                                            </span>
                                        </TableCell>

                                        <TableCell className="px-6 py-4 text-slate-500 text-xs sm:text-sm whitespace-nowrap">
                                            {updatedTime}
                                        </TableCell>

                                        <TableCell className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => setSelectedRun(run)}
                                                className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                                            >
                                                View
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>

                <div className="py-3.5 text-center text-xs text-slate-400 border-t border-slate-100 bg-white">
                    All recent agents log
                </div>
            </div>

            {/* Run Detail Modal */}
            {selectedRun && (
                <Dialog open={Boolean(selectedRun)} onOpenChange={(open) => !open && setSelectedRun(null)}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <div className="flex items-center justify-between gap-2 pr-6">
                                <DialogTitle className="text-lg font-bold text-slate-900">
                                    {selectedRun.name || "Agent Run"}
                                </DialogTitle>
                                <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        getStatusBadge(selectedRun.status).className
                                    }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            getStatusBadge(selectedRun.status).dot
                                        }`}
                                    />
                                    <span className="capitalize">{selectedRun.status}</span>
                                </span>
                            </div>
                            <DialogDescription className="text-xs text-slate-500 mt-1">
                                {selectedRun.task || "Task details and run execution log."}
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
                                            : "Scheduled"}
                                    </span>
                                </div>
                            </div>

                            {selectedRun.error && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700">
                                    <span className="font-semibold block mb-1">Error Message</span>
                                    <p className="font-mono whitespace-pre-wrap">
                                        {String(selectedRun.error)}
                                    </p>
                                </div>
                            )}

                            <div>
                                <span className="font-semibold text-slate-800 block mb-1.5">
                                    Result / Output
                                </span>
                                <div className="max-h-60 overflow-y-auto rounded-xl bg-slate-900 text-slate-100 p-3.5 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                                    {selectedRun.output
                                        ? typeof selectedRun.output === "object"
                                            ? JSON.stringify(selectedRun.output, null, 2)
                                            : String(selectedRun.output)
                                        : selectedRun.status === "scheduled" || selectedRun.status === "queued"
                                        ? "This run is queued / scheduled and will execute at its designated time."
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

export default RecentRuns;