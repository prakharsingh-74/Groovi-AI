'use client'

import React, { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { CreatedAgentType } from "./CreateAgent"
import AgentEditSheet from "./AgentEditSheet"
import AgentChatDrawer from "./AgentChatDrawer"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Play,
    MessageCircle,
    Ellipsis,
    CalendarCheck2,
    Pause,
    Pencil,
    Trash,
    Bot,
    Plus,
    RefreshCw,
} from "lucide-react"
import { toast } from "@/components/ui/toast"

function MyAgents() {
    const [agents, setAgents] = useState<CreatedAgentType[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [selectedEditAgent, setSelectedEditAgent] = useState<CreatedAgentType | null>(null)
    const [openChatDrawer, setOpenChatDrawer] = useState(false)
    const [openEditSheet, setOpenEditSheet] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

    // Fetch all user agents from GET /api/agent/configure
    const fetchAgents = useCallback(async (isRefresh = false) => {
        if (isRefresh) setIsRefreshing(true)
        else setLoading(true)

        try {
            const response = await axios.get('/api/agent/configure')
            if (Array.isArray(response.data)) {
                setAgents(response.data)
            } else {
                setAgents([])
            }
        } catch (error: any) {
            console.error("Failed to fetch agents:", error)
            toast.add({
                title: "Failed to load agents",
                type: "error"
            })
        } finally {
            setLoading(false)
            setIsRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchAgents()
    }, [fetchAgents])

    // Update agent state after edit
    const handleAgentUpdated = useCallback((updated: CreatedAgentType) => {
        setAgents((prev) =>
            prev.map((a) => (a.agentId === updated.agentId ? { ...a, ...updated } : a))
        )
        setSelectedEditAgent(null)
        setOpenEditSheet(false)
    }, [])

    // Toggle pause / resume status
    const handleToggleStatus = async (agent: CreatedAgentType) => {
        const newStatus = agent.status === "paused" ? "active" : "paused"
        try {
            const updated = { ...agent, status: newStatus }
            await axios.put('/api/agent/configure', updated)
            setAgents((prev) =>
                prev.map((a) => (a.agentId === agent.agentId ? { ...a, status: newStatus } : a))
            )
            toast.add({
                title: newStatus === "active" ? "Agent Resumed!" : "Agent Paused!",
                type: "success"
            })
        } catch (error) {
            console.error("Failed to toggle status:", error)
            toast.add({
                title: "Failed to update agent status",
                type: "error"
            })
        }
    }

    // Delete agent
    const handleDeleteAgent = async (agent: CreatedAgentType) => {
        try {
            await axios.delete(`/api/agent/configure?agentId=${agent.agentId}`)
            setAgents((prev) => prev.filter((a) => a.agentId !== agent.agentId))
            toast.add({
                title: "Agent Deleted Successfully",
                type: "success"
            })
        } catch (error) {
            console.error("Failed to delete agent:", error)
            toast.add({
                title: "Failed to delete agent",
                type: "error"
            })
        }
    }

    // Run agent action
    const handleRunAgent = (agent: CreatedAgentType) => {
        toast.add({
            title: `Executing ${agent.name}...`,
            type: "success"
        })
    }

    // Chat with agent action
    const handleChatWithAgent = (agent: CreatedAgentType) => {
        setSelectedEditAgent(agent)
        setOpenChatDrawer(true)
    }

    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="mt-5 mb-6 flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        My Agents
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Run, Manage and Update All the agents you&apos;ve created.
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fetchAgents(true)}
                    disabled={loading || isRefreshing}
                    className="h-8 w-8 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="Refresh agents"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
            </div>

            {/* Loading Skeleton State */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {[1, 2].map((idx) => (
                        <div
                            key={idx}
                            className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-start justify-between">
                                    <Skeleton className="w-14 h-14 rounded-2xl" />
                                    <Skeleton className="w-6 h-6 rounded-md" />
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <Skeleton className="h-5 w-36 rounded-md" />
                                    <Skeleton className="h-4 w-14 rounded-full" />
                                </div>
                                <Skeleton className="h-4 w-full mt-2.5 rounded-md" />
                                <Skeleton className="h-4 w-4/5 mt-1.5 rounded-md" />
                                <div className="mt-4 pt-3 border-t border-slate-100">
                                    <Skeleton className="h-4 w-28 rounded-md" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                                <Skeleton className="h-9 w-full rounded-xl" />
                                <Skeleton className="h-9 w-full rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : agents.length === 0 ? (
                /* Empty State */
                <div className="border border-dashed border-slate-200 bg-slate-50/50 rounded-3xl p-10 text-center flex flex-col items-center justify-center my-6">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3.5 border border-purple-100">
                        <Bot className="w-7 h-7" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">No Agents Yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                        You haven&apos;t created any agents yet. Switch to the Create Agent tab to generate your first AI agent.
                    </p>
                </div>
            ) : (
                /* Agents Grid Matching Screenshot */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {agents.map((agent) => {
                        const isPaused = agent.status === "paused"
                        const frequencyText = agent.schedule?.frequency || "on-demand"

                        return (
                            <div
                                key={agent.agentId || agent.id}
                                className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                            >
                                {/* Top: Avatar + Options Menu */}
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div className="w-14 h-14 rounded-2xl bg-[#edf1f7] flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden">
                                            {agent.agentImage ? (
                                                <img
                                                    src={agent.agentImage}
                                                    alt={agent.name || "Agent"}
                                                    width={44}
                                                    height={44}
                                                    className="w-11 h-11 object-contain rounded-xl"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center gap-1.5 shadow-xs">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Dropdown Menu */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger
                                                className="h-8 w-8 inline-flex items-center justify-center text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer outline-none"
                                                title="More Options"
                                            >
                                                <Ellipsis className="w-4 h-4" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg border-slate-200">
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem
                                                        onClick={() => handleRunAgent(agent)}
                                                        className="gap-2 text-xs font-medium cursor-pointer"
                                                    >
                                                        <Play className="w-3.5 h-3.5 text-purple-600" />
                                                        <span>Run Now</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedEditAgent(agent)
                                                            setOpenEditSheet(true)
                                                        }}
                                                        className="gap-2 text-xs font-medium cursor-pointer"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5 text-blue-600" />
                                                        <span>Edit Agent</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleStatus(agent)}
                                                        className="gap-2 text-xs font-medium cursor-pointer"
                                                    >
                                                        <Pause className="w-3.5 h-3.5 text-amber-600" />
                                                        <span>{isPaused ? "Resume Agent" : "Pause Agent"}</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={() => handleDeleteAgent(agent)}
                                                        className="gap-2 text-xs font-medium cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                                    >
                                                        <Trash className="w-3.5 h-3.5" />
                                                        <span>Delete Agent</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Middle: Title & Status Badge */}
                                    <div className="flex items-start justify-between gap-2 mt-4">
                                        <h3 className="font-bold text-[15px] sm:text-base text-slate-900 tracking-tight leading-snug line-clamp-1">
                                            {agent.name}
                                        </h3>
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                                isPaused
                                                    ? "bg-amber-100 text-amber-700"
                                                    : "bg-[#e6f8ee] text-[#16a34a]"
                                            }`}
                                        >
                                            {agent.status || "ACTIVE"}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed min-h-[32px]">
                                        {agent.description || "Reviews and executes autonomous workflows on schedule."}
                                    </p>

                                    {/* Schedule frequency */}
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                                        <CalendarCheck2 className="w-4 h-4 text-purple-600 shrink-0 stroke-[1.75]" />
                                        <span>{frequencyText}</span>
                                    </div>
                                </div>

                                {/* Bottom: Action Buttons (Pixel-perfect side-by-side grid) */}
                                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100/80">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRunAgent(agent)}
                                        className="h-9 w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 gap-1.5 cursor-pointer shadow-none transition-colors"
                                    >
                                        <Play className="w-3.5 h-3.5 fill-current" />
                                        <span>Run Agent</span>
                                    </Button>

                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setSelectedEditAgent(agent)
                                            setOpenChatDrawer(true)
                                        }}
                                        className="h-9 w-full text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white gap-1.5 cursor-pointer shadow-xs transition-colors"
                                    >
                                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                                        <span>Chat With Agent</span>
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Editing Agent Sheet */}
            {selectedEditAgent && openEditSheet && (
                <AgentEditSheet
                    agentConfig={selectedEditAgent}
                    agent={selectedEditAgent}
                    createdAgent={selectedEditAgent}
                    open={openEditSheet}
                    onOpenChange={(open) => {
                        setOpenEditSheet(open)
                        if (!open && !openChatDrawer) setSelectedEditAgent(null)
                    }}
                    onSave={handleAgentUpdated}
                    setUpdatedAgent={handleAgentUpdated}
                />
            )}

            {/* Chat with Agent Drawer */}
            <AgentChatDrawer
                agent={selectedEditAgent}
                open={openChatDrawer}
                onOpenChange={setOpenChatDrawer}
            />
        </div>
    )
}

export default MyAgents