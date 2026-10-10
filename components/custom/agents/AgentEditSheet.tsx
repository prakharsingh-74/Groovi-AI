'use client'

import React, { useState, useEffect } from "react"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { CreatedAgentType } from "./CreateAgent"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Shuffle, Plus, X, Loader2 } from "lucide-react"
import axios from "axios"

type Props = {
    createdAgent: CreatedAgentType | null
    open?: boolean
    onOpenChange?: (open: boolean) => void
    trigger?: React.ReactNode
    onSave?: (updatedAgent: CreatedAgentType) => void
}

function getToolMeta(tool: any) {
    const raw = typeof tool === "string" ? tool : tool?.slug || tool?.name || ""
    const slug = raw.toLowerCase().trim()

    if (slug.includes("calendar")) {
        return {
            slug: raw,
            name: "Google Calendar",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex flex-col items-center justify-center text-white font-bold shrink-0 shadow-xs">
                    <span className="text-[11px] font-semibold leading-none">31</span>
                </div>
            )
        }
    }
    if (slug.includes("github")) {
        return {
            slug: raw,
            name: "GitHub",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                    </svg>
                </div>
            )
        }
    }
    if (slug.includes("gmail") || slug.includes("mail")) {
        return {
            slug: raw,
            name: "Gmail",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                    M
                </div>
            )
        }
    }
    if (slug.includes("slack")) {
        return {
            slug: raw,
            name: "Slack",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                    #
                </div>
            )
        }
    }
    if (slug.includes("notion")) {
        return {
            slug: raw,
            name: "Notion",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white font-serif font-bold text-xs shrink-0 shadow-xs">
                    N
                </div>
            )
        }
    }

    const displayName = raw
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase())

    return {
        slug: raw,
        name: displayName || "Tool",
        icon: (
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs uppercase shrink-0">
                {displayName.charAt(0) || "T"}
            </div>
        )
    }
}

function AgentEditSheet({ createdAgent, open, onOpenChange, trigger, onSave }: Props) {
    const [name, setName] = useState(createdAgent?.name || "")
    const [agentImage, setAgentImage] = useState(createdAgent?.agentImage || "")
    const [objective, setObjective] = useState(createdAgent?.objective || "")
    const [instructions, setInstructions] = useState(createdAgent?.instructions || "")
    const [scheduleType, setScheduleType] = useState(createdAgent?.schedule?.type || "manual")
    const [scheduleTime, setScheduleTime] = useState(createdAgent?.schedule?.time || "")
    const [scheduleFreq, setScheduleFreq] = useState(createdAgent?.schedule?.frequency || "on-demand")
    const [skills, setSkills] = useState<string[]>([])
    const [newSkill, setNewSkill] = useState("")
    const [connectedTools, setConnectedTools] = useState<Record<string, boolean>>({})
    const [outputFormat, setOutputFormat] = useState(createdAgent?.outputFormat || "")
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    // Sync all state whenever createdAgent changes
    useEffect(() => {
        if (createdAgent) {
            setName(createdAgent.name || "")
            setAgentImage(
                createdAgent.agentImage ||
                `https://api.dicebear.com/10.x/bottts-neutral/svg?seed=${createdAgent.name || 'agent'}`
            )
            setObjective(createdAgent.objective || "")
            setInstructions(createdAgent.instructions || "")
            setScheduleType(createdAgent.schedule?.type || "manual")
            setScheduleTime(createdAgent.schedule?.time || "")
            setScheduleFreq(createdAgent.schedule?.frequency || "on-demand")
            setSkills(Array.isArray(createdAgent.skills) ? [...createdAgent.skills] : [])
            setOutputFormat(createdAgent.outputFormat || "")

            const initialConnected: Record<string, boolean> = {}
            if (Array.isArray(createdAgent.tools)) {
                createdAgent.tools.forEach((t: any) => {
                    const slug = typeof t === "string" ? t : t?.slug || t?.name || ""
                    if (slug) {
                        initialConnected[slug] = Boolean(t?.connected)
                    }
                })
            }
            setConnectedTools(initialConnected)
        }
    }, [createdAgent])

    const handleShuffleImage = () => {
        const randomSeed = Math.random().toString(36).substring(2, 9)
        const newUrl = `https://api.dicebear.com/10.x/bottts-neutral/svg?seed=${randomSeed}`
        setAgentImage(newUrl)
    }

    const addSkill = () => {
        const trimmed = newSkill.trim()
        if (trimmed && !skills.includes(trimmed)) {
            setSkills([...skills, trimmed])
            setNewSkill("")
        }
    }

    const removeSkill = (index: number) => {
        setSkills(skills.filter((_, i) => i !== index))
    }

    const toggleToolConnection = (slug: string) => {
        setConnectedTools(prev => ({
            ...prev,
            [slug]: !prev[slug]
        }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const updatedSchedule = {
                type: scheduleType,
                frequency: scheduleFreq,
                time: scheduleTime,
            }

            const rawTools = Array.isArray(createdAgent?.tools) ? createdAgent.tools : []
            const updatedTools = rawTools.map((t: any) => {
                const slug = typeof t === "string" ? t : t?.slug || t?.name || ""
                return typeof t === "string"
                    ? slug
                    : { ...t, connected: Boolean(connectedTools[slug]) }
            })

            const updatedAgent: CreatedAgentType = {
                ...createdAgent!,
                name,
                agentImage,
                objective,
                instructions,
                skills,
                schedule: updatedSchedule,
                tools: updatedTools,
                outputFormat,
            }

            if (createdAgent?.agentId) {
                await axios.post('/api/agent/update', {
                    agentId: createdAgent.agentId,
                    name,
                    agentImage,
                    objective,
                    instructions,
                    skills,
                    schedule: updatedSchedule,
                    tools: updatedTools,
                    outputFormat,
                    status: createdAgent.status || 'active'
                })
            }

            onSave?.(updatedAgent)
            setSaved(true)
            setTimeout(() => {
                setSaved(false)
                onOpenChange?.(false)
            }, 1000)
        } catch (err) {
            console.error("Failed to save agent updates:", err)
        } finally {
            setIsSaving(false)
        }
    }

    // Tools list
    const toolsList = Array.isArray(createdAgent?.tools)
        ? createdAgent.tools
        : []

    const connectedCount = toolsList.filter((t: any) => {
        const slug = typeof t === "string" ? t : t?.slug || t?.name || ""
        return Boolean(connectedTools[slug])
    }).length

    const sheetProps: Record<string, any> = {}
    if (open !== undefined) sheetProps.open = open
    if (onOpenChange !== undefined) sheetProps.onOpenChange = onOpenChange

    return (
        <Sheet {...sheetProps}>
            {trigger ? (
                <SheetTrigger render={trigger as React.ReactElement} />
            ) : open === undefined ? (
                <SheetTrigger className="text-sm font-medium text-slate-700 hover:text-slate-900 px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer outline-none">
                    Open
                </SheetTrigger>
            ) : null}

            <SheetContent
                showCloseButton={true}
                className="sm:max-w-xl w-full p-0 flex flex-col h-full overflow-hidden bg-white gap-0 border-l border-slate-200"
            >
                {/* 1. FIXED TOP HEADER */}
                <SheetHeader className="shrink-0 p-5 px-6 border-b border-slate-200/90 bg-white">
                    <div className="flex items-center gap-3 pr-8">
                        <div className="w-10 h-10 rounded-2xl bg-[#edf1f7] flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden">
                            {agentImage ? (
                                <img
                                    src={agentImage}
                                    alt="Agent Avatar"
                                    className="w-8 h-8 object-contain"
                                />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-orange-400 flex items-center justify-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-slate-900" />
                                    <div className="w-1 h-1 rounded-full bg-slate-900" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <SheetTitle className="text-base font-bold text-slate-900 tracking-tight">
                                Edit Agent
                            </SheetTitle>
                            <SheetDescription className="text-xs text-slate-500 mt-0.5">
                                Update how this agent looks, works and runs.
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                {/* 2. SCROLLABLE MIDDLE BODY */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-white">
                    {/* Top Card: Agent Image */}
                    <div className="rounded-2xl border border-slate-200/90 p-4 bg-white flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#edf1f7] border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {agentImage ? (
                                <img
                                    src={agentImage}
                                    alt="Agent Preview"
                                    className="w-12 h-12 object-contain"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center gap-1.5 shadow-xs">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                                </div>
                            )}
                        </div>

                        <div>
                            <h4 className="font-semibold text-sm text-slate-900">Agent Image</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Shuffle to generate a new look</p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleShuffleImage}
                                className="mt-2.5 h-8 gap-1.5 text-xs font-medium rounded-lg border-slate-200 hover:bg-slate-50 cursor-pointer"
                            >
                                <Shuffle className="w-3.5 h-3.5" />
                                <span>Shuffle Image</span>
                            </Button>
                        </div>
                    </div>

                    {/* Agent Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-800">Agent Name</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Agent Name"
                            className="h-10 text-xs sm:text-sm rounded-lg"
                        />
                    </div>

                    {/* Objective */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-800">Objective</label>
                        <Textarea
                            value={objective}
                            onChange={(e) => setObjective(e.target.value)}
                            placeholder="Review events and tasks to create a prioritized daily focus plan."
                            className="min-h-[85px] text-xs sm:text-sm leading-relaxed rounded-lg resize-y"
                        />
                    </div>

                    {/* Instructions */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-800">Instructions</label>
                        <Textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="1. Fetch today's scheduled meetings and events..."
                            className="min-h-[170px] text-xs sm:text-sm leading-relaxed rounded-lg resize-y font-normal"
                        />
                    </div>

                    {/* Schedule Card */}
                    <div className="rounded-2xl border border-slate-200/90 p-4 space-y-3.5 bg-white">
                        <div>
                            <h4 className="font-semibold text-sm text-slate-900">Schedule</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Choose when and how often this agent runs.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Run Type</label>
                                <select
                                    value={scheduleType}
                                    onChange={(e) => setScheduleType(e.target.value)}
                                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none focus:border-purple-500 cursor-pointer"
                                >
                                    <option value="manual">manual</option>
                                    <option value="scheduled">scheduled</option>
                                    <option value="recurring">recurring</option>
                                    <option value="once">once</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Time</label>
                                <Input
                                    value={scheduleTime}
                                    onChange={(e) => setScheduleTime(e.target.value)}
                                    placeholder="--:-- --"
                                    className="h-9 text-xs rounded-lg"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Frequency</label>
                            <select
                                value={scheduleFreq}
                                onChange={(e) => setScheduleFreq(e.target.value)}
                                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none focus:border-purple-500 cursor-pointer"
                            >
                                <option value="on-demand">on-demand</option>
                                <option value="daily">daily</option>
                                <option value="weekly">weekly</option>
                                <option value="hourly">hourly</option>
                                <option value="monthly">monthly</option>
                            </select>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                        <div>
                            <h4 className="font-semibold text-sm text-slate-900">Skills</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Add or remove capabilities this agent should use.</p>
                        </div>

                        {skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200/70"
                                    >
                                        <span>{skill}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeSkill(index)}
                                            className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                            title="Remove skill"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2 pt-1">
                            <Input
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        addSkill()
                                    }
                                }}
                                placeholder="Add a skill"
                                className="h-9 text-xs rounded-lg flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addSkill}
                                className="h-9 px-3 gap-1 text-xs font-medium rounded-lg shrink-0 border-slate-200 hover:bg-slate-50 cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add</span>
                            </Button>
                        </div>
                    </div>

                    {/* Connected Tools */}
                    <div className="space-y-2.5">
                        <div>
                            <h4 className="font-semibold text-sm text-slate-900">Connected Tools</h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {connectedCount} of {toolsList.length} connected
                            </p>
                        </div>

                        {toolsList.length > 0 ? (
                            <div className="space-y-2">
                                {toolsList.map((tool: any, idx: number) => {
                                    const meta = getToolMeta(tool)
                                    const isConnected = Boolean(connectedTools[meta.slug])

                                    return (
                                        <div
                                            key={idx}
                                            className="rounded-2xl border border-slate-200/90 p-3.5 flex items-center justify-between bg-white"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {meta.icon}
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-slate-900 truncate">
                                                        {meta.name}
                                                    </p>
                                                    <p className={`text-[11px] font-medium mt-0.5 ${
                                                        isConnected ? "text-emerald-600" : "text-rose-500"
                                                    }`}>
                                                        {isConnected ? "Connected" : "Not connected"}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => toggleToolConnection(meta.slug)}
                                                className={`text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                                                    isConnected
                                                        ? "border border-slate-200 hover:bg-slate-100 text-slate-700"
                                                        : "bg-slate-900 hover:bg-slate-800 text-white"
                                                }`}
                                            >
                                                {isConnected ? "Disconnect" : "Connect"}
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="p-4 text-center border border-dashed rounded-2xl text-xs text-slate-400">
                                No connected tools required for this agent.
                            </div>
                        )}
                    </div>

                    {/* Output Format */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-800">Output Format</label>
                        <Textarea
                            value={outputFormat}
                            onChange={(e) => setOutputFormat(e.target.value)}
                            placeholder="A well-structured Markdown document containing..."
                            className="min-h-[140px] text-xs sm:text-sm leading-relaxed rounded-lg resize-y"
                        />
                    </div>
                </div>

                {/* 3. FIXED BOTTOM FOOTER - NEVER SCROLLS */}
                <div className="shrink-0 sticky bottom-0 z-20 bg-white border-t border-slate-200/90 px-6 py-3.5 flex items-center justify-end gap-2.5 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
                    <SheetClose className="h-9 px-4 inline-flex items-center justify-center text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer outline-none">
                        Cancel
                    </SheetClose>

                    <Button
                        size="sm"
                        disabled={isSaving}
                        onClick={handleSave}
                        className="h-9 px-4 text-xs font-medium rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-xs transition-colors cursor-pointer"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                Saving...
                            </>
                        ) : saved ? (
                            "Saved!"
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default AgentEditSheet