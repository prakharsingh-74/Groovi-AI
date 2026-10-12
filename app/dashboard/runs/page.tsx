'use client'

import React, { useEffect, useState } from "react";
import axios from "axios";
import Stats from "@/components/custom/run/Stats";
import RecentRuns, { AgentRunType } from "@/components/custom/run/RecentRuns";

export type statsType = {
    completed: number;
    failed: number;
    scheduled: number;
};

function RunPage() {
    const [agentRuns, setAgentRuns] = useState<AgentRunType[]>([]);
    const [stats, setStats] = useState<statsType>({ completed: 0, failed: 0, scheduled: 0 });
    const [loading, setLoading] = useState<boolean>(true);

    const GetAllUserAgentRun = async () => {
        try {
            setLoading(true);
            const result = await axios.get("/api/agent-log");
            const runs: AgentRunType[] = Array.isArray(result.data) ? result.data : [];
            setAgentRuns(runs);

            const completed = runs.filter((r) => r.status?.toLowerCase() === "completed").length;
            const failed = runs.filter((r) => r.status?.toLowerCase() === "failed").length;
            const scheduled = runs.filter((r) =>
                r.status?.toLowerCase() === "scheduled" || r.status?.toLowerCase() === "queued"
            ).length;

            setStats({ completed, failed, scheduled });
        } catch (error) {
            console.error("Failed to fetch agent runs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetAllUserAgentRun();
    }, []);

    return (
        <div className="p-10 md:px-15 lg:px-28">
            <h2 className="font-bold text-3xl text-slate-900">Agent Runs</h2>
            <p className="mt-1 text-muted-foreground text-sm">
                See what your agents are working on and review their results.
            </p>

            <Stats
                completed={stats?.completed}
                failed={stats?.failed}
                scheduled={stats?.scheduled}
            />

            <RecentRuns agentRuns={agentRuns} loading={loading} />
        </div>
    );
}

export default RunPage;