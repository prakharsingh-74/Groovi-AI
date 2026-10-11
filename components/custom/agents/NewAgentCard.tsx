'use client'

import React, { useState } from "react";
import { CreatedAgentType } from "./CreateAgent";
import { CalendarCheck2, Ellipsis, Pause, Pencil, Play, Trash } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AgentEditSheet from "./AgentEditSheet";

type Props = {
    createdAgent: CreatedAgentType | null;
    onUpdate?: (updated: CreatedAgentType) => void;
}

function NewAgentCard({ createdAgent, onUpdate }: Props) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const [currentAgent, setCurrentAgent] = useState<CreatedAgentType | null>(createdAgent);

    // Keep currentAgent in sync if prop changes
    React.useEffect(() => {
        if (createdAgent) {
            setCurrentAgent(createdAgent);
        }
    }, [createdAgent]);

    if (!currentAgent) return null;

    const scheduleTime = currentAgent?.schedule?.time;
    const scheduleFreq = currentAgent?.schedule?.frequency;

    const handleAgentSave = (updated: CreatedAgentType) => {
        setCurrentAgent(updated);
        onUpdate?.(updated);
    };

    return (
        <>
            <div className="flex items-center justify-between gap-4 border border-slate-200/90 bg-white mt-6 p-4 sm:p-5 rounded-3xl shadow-xs hover:shadow-sm transition-all duration-200 w-full">
                {/* Left Section: Avatar + Agent Details */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Rounded square avatar container with soft light background */}
                    <div className="w-14 h-14 bg-[#edf1f7] rounded-2xl flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
                        {currentAgent?.agentImage ? (
                            <img
                                src={currentAgent.agentImage}
                                alt={currentAgent?.name || "Agent Avatar"}
                                width={44}
                                height={44}
                                className="w-11 h-11 object-contain rounded-xl"
                            />
                        ) : (
                            /* Fallback avatar matching screenshot: cute orange face with dark eyes */
                            <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center gap-1.5 shadow-xs">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        {/* Title & active pill badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-[15px] sm:text-base text-slate-900 tracking-tight truncate max-w-[280px] sm:max-w-md">
                                {currentAgent?.name || "Daily Priority Planner"}
                            </h3>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#e6f8ee] text-[#16a34a] lowercase">
                                {currentAgent?.status || "active"}
                            </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-slate-500 font-normal truncate max-w-[340px] sm:max-w-xl leading-normal mt-0.5">
                            {currentAgent?.description || "Reviews Google Calendar events and extracts tasks from Gmail to..."}
                        </p>

                        {/* Schedule row */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                            <div className="flex items-center gap-1.5 font-normal">
                                <CalendarCheck2 className="w-4 h-4 text-slate-500 shrink-0 stroke-[1.75]" />
                                <span>Next Run on {scheduleTime || "immediate"}</span>
                            </div>
                            <span className="font-normal">Runs {scheduleFreq || "on-demand"}</span>
                        </div>
                    </div>
                </div>

                {/* Right Section: Action Controls (Pencil, Ellipsis) */}
                <div className="flex items-center gap-1 shrink-0">
                    {/* Pencil Edit Icon Button */}
                    <button
                        type="button"
                        onClick={() => setSheetOpen(true)}
                        className="h-8 w-8 inline-flex items-center justify-center text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer outline-none"
                        title="Edit Agent"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className="h-8 w-8 inline-flex items-center justify-center text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer outline-none"
                            title="More Options"
                        >
                            <Ellipsis className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg border-slate-200">
                            <DropdownMenuGroup>
                                <DropdownMenuItem className="gap-2 text-xs font-medium cursor-pointer">
                                    <Play className="w-3.5 h-3.5 text-purple-600" />
                                    <span>Run Now</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => {
                                        const newStatus = currentAgent.status === 'active' ? 'paused' : 'active';
                                        handleAgentSave({ ...currentAgent, status: newStatus });
                                    }}
                                    className="gap-2 text-xs font-medium cursor-pointer"
                                >
                                    <Pause className="w-3.5 h-3.5 text-amber-600" />
                                    <span>{currentAgent.status === 'active' ? 'Pause Agent' : 'Resume Agent'}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => setSheetOpen(true)}
                                    className="gap-2 text-xs font-medium cursor-pointer"
                                >
                                    <Pencil className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Edit Agent</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem variant="destructive" className="gap-2 text-xs font-medium cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                    <Trash className="w-3.5 h-3.5" />
                                    <span>Delete Agent</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Controlled AgentEditSheet */}
            <AgentEditSheet
                createdAgent={currentAgent}
                setUpdatedAgent={handleAgentSave}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                onSave={handleAgentSave}
            />
        </>
    );
}

export default NewAgentCard;
