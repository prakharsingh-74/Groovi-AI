import React from "react";

export type StatsProps = {
    completed?: number;
    failed?: number;
    scheduled?: number;
};

function Stats({ completed = 0, failed = 0, scheduled = 0 }: StatsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {/* Completed */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white px-6 py-4 shadow-2xs">
                <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-700">Completed</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{completed}</span>
            </div>

            {/* Failed */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white px-6 py-4 shadow-2xs">
                <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-700">Failed</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{failed}</span>
            </div>

            {/* Scheduled */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white px-6 py-4 shadow-2xs">
                <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0" />
                    <span className="text-sm font-medium text-slate-700">Scheduled</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{scheduled}</span>
            </div>
        </div>
    );
}

export default Stats;