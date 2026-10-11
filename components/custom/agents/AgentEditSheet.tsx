'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { CreatedAgentType } from "./CreateAgent"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Shuffle, Plus, X, Loader2, Loader2 as Loader2Icon, Clock, Link2, Unlink, Trash2 } from "lucide-react"
import axios from "axios"
import { toast } from "@/components/ui/toast"
import Image from "next/image"

type Props = {
    children?: React.ReactNode
    agentConfig?: CreatedAgentType | null
    setUpdatedAgent?: any
    openSheet_?: boolean
    closeSheet?: any
    // Backwards compatibility props
    agent?: CreatedAgentType | null
    createdAgent?: CreatedAgentType | null
    open?: boolean
    onOpenChange?: (open: boolean) => void
    trigger?: React.ReactNode
    onSave?: (updatedAgent: CreatedAgentType) => void
}

export type EditableTool = {
    name: string
    connected: boolean
    slug: string
    logo: string
}

const HOURS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))
const PERIODS = ["AM", "PM"] as const

function parseTimeString(timeStr?: string) {
    if (!timeStr) return { hour: "09", minute: "00", period: "AM" }
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
    if (match) {
        const hour = match[1].padStart(2, "0")
        const minute = match[2].padStart(2, "0")
        const period = (match[3] || "AM").toUpperCase()
        return { hour, minute, period }
    }
    return { hour: "09", minute: "00", period: "AM" }
}

const TOOL_META_CACHE = new Map<string, { slug: string; name: string; icon: React.ReactNode }>()

function getToolMeta(tool: any) {
    const raw = typeof tool === "string" ? tool : tool?.slug || tool?.name || ""
    if (TOOL_META_CACHE.has(raw)) {
        return TOOL_META_CACHE.get(raw)!
    }

    const slug = raw.toLowerCase().trim()
    let meta: { slug: string; name: string; icon: React.ReactNode }

    if (slug.includes("calendar")) {
        meta = {
            slug: raw,
            name: "Google Calendar",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex flex-col items-center justify-center text-white font-bold shrink-0 shadow-xs">
                    <span className="text-[11px] font-semibold leading-none">31</span>
                </div>
            )
        }
    } else if (slug.includes("github")) {
        meta = {
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
    } else if (slug.includes("gmail") || slug.includes("mail")) {
        meta = {
            slug: raw,
            name: "Gmail",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                    M
                </div>
            )
        }
    } else if (slug.includes("slack")) {
        meta = {
            slug: raw,
            name: "Slack",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                    #
                </div>
            )
        }
    } else if (slug.includes("notion")) {
        meta = {
            slug: raw,
            name: "Notion",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white font-serif font-bold text-xs shrink-0 shadow-xs">
                    N
                </div>
            )
        }
    } else if (slug.includes("sheet")) {
        meta = {
            slug: raw,
            name: "Google Sheets",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H6v-2h6v2zm0-4H6v-2h6v2zm0-4H6V7h6v2zm6 8h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V7h4v2z"/>
                    </svg>
                </div>
            )
        }
    } else if (slug.includes("supabase")) {
        meta = {
            slug: raw,
            name: "Supabase",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0 shadow-xs">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M21.362 9.354H12V.396a.396.396 0 00-.716-.233L.416 13.916a.396.396 0 00.31.637H12v8.958a.396.396 0 00.716.233l10.868-13.753a.396.396 0 00-.222-.637z"/>
                    </svg>
                </div>
            )
        }
    } else if (slug.includes("outlook")) {
        meta = {
            slug: raw,
            name: "Outlook",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                    O
                </div>
            )
        }
    } else if (slug.includes("browserbase")) {
        meta = {
            slug: raw,
            name: "Browserbase",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-[#FF5C00] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                    B
                </div>
            )
        }
    } else if (slug.includes("serp")) {
        meta = {
            slug: raw,
            name: "SerpApi",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                    S
                </div>
            )
        }
    } else if (slug.includes("web_search") || slug.includes("search")) {
        meta = {
            slug: raw,
            name: "Web Search",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                    🔍
                </div>
            )
        }
    } else {
        const displayName = raw
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, (c: string) => c.toUpperCase())

        meta = {
            slug: raw,
            name: displayName || "Tool",
            icon: (
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs uppercase shrink-0">
                    {displayName.charAt(0) || "T"}
                </div>
            )
        }
    }

    TOOL_META_CACHE.set(raw, meta)
    return meta
}

// Memoized Time Picker Panel
const TimePickerPanel = React.memo(function TimePickerPanel({
    selectedHour,
    selectedMinute,
    selectedPeriod,
    onHourSelect,
    onMinuteSelect,
    onPeriodSelect,
    hourContainerRef,
    minuteContainerRef,
}: {
    selectedHour: string
    selectedMinute: string
    selectedPeriod: "AM" | "PM"
    onHourSelect: (h: string) => void
    onMinuteSelect: (m: string) => void
    onPeriodSelect: (p: "AM" | "PM") => void
    hourContainerRef: React.RefObject<HTMLDivElement | null>
    minuteContainerRef: React.RefObject<HTMLDivElement | null>
}) {
    return (
        <div className="flex gap-1 bg-white select-none">
            {/* Hours Column */}
            <div
                ref={hourContainerRef}
                className="flex-1 flex flex-col gap-0.5 max-h-48 overflow-y-auto py-0.5 pr-0.5 scrollbar-thin"
            >
                {HOURS.map((h) => {
                    const isSelected = selectedHour === h
                    return (
                        <button
                            key={h}
                            type="button"
                            data-selected={isSelected}
                            onClick={() => onHourSelect(h)}
                            className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors cursor-pointer text-center ${
                                isSelected
                                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                                    : "text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                            {h}
                        </button>
                    )
                })}
            </div>

            <div className="w-[1px] bg-slate-100 my-1 shrink-0" />

            {/* Minutes Column */}
            <div
                ref={minuteContainerRef}
                className="flex-1 flex flex-col gap-0.5 max-h-48 overflow-y-auto py-0.5 pr-0.5 scrollbar-thin"
            >
                {MINUTES.map((m) => {
                    const isSelected = selectedMinute === m
                    return (
                        <button
                            key={m}
                            type="button"
                            data-selected={isSelected}
                            onClick={() => onMinuteSelect(m)}
                            className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors cursor-pointer text-center ${
                                isSelected
                                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                                    : "text-slate-700 hover:bg-blue-100"
                            }`}
                        >
                            {m}
                        </button>
                    )
                })}
            </div>

            <div className="w-[1px] bg-slate-100 my-1 shrink-0" />

            {/* AM / PM Column */}
            <div className="flex flex-col gap-1 py-0.5 shrink-0">
                {PERIODS.map((p) => {
                    const isSelected = selectedPeriod === p
                    return (
                        <button
                            key={p}
                            type="button"
                            onClick={() => onPeriodSelect(p)}
                            className={`py-1.5 px-2.5 text-xs font-medium rounded-md transition-colors cursor-pointer text-center ${
                                isSelected
                                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                                    : "text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                            {p}
                        </button>
                    )
                })}
            </div>
        </div>
    )
})

// Memoized Tool Card Component
const ToolCard = React.memo(function ToolCard({
    tool,
    isConnected,
    onToggle,
}: {
    tool: { slug: string; name: string; icon?: React.ReactNode; logo?: string; connected?: boolean }
    isConnected: boolean
    onToggle: (slug: string) => void
}) {
    return (
        <div className="rounded-2xl border border-slate-200/90 p-3.5 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg">
                    {/* {tool.connected ? (
                        <Link2 className="size-4 text-emerald-600" />
                    ) : (
                        <Unlink className="size-4 text-muted-foreground" />
                    )} */}
                    {tool.logo ? (
                        <img
                            src={tool.logo}
                            alt={tool.name}
                            width={30}
                            height={30}
                            className="rounded-md object-contain"
                        />
                    ) : (
                        tool.icon
                    )}
                </div>
                <div>
                    <p className="text-sm font-medium">
                        {tool.name}
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
                onClick={() => onToggle(tool.slug)}
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
})

function AgentEditSheet({
    agentConfig: propAgentConfig,
    setUpdatedAgent,
    openSheet_ = false,
    closeSheet,
    // backwards-compatibility props
    agent,
    createdAgent,
    open,
    onOpenChange,
    trigger,
    onSave,
}: Props) {
    const agentConfig = propAgentConfig ?? agent ?? createdAgent ?? null

    const [draftAgent, setDraftAgent] = useState<CreatedAgentType | null>(agentConfig)
    const [skillInput, setSkillInput] = useState("")
    const [tools, setTools] = useState<EditableTool[]>([])
    const [loadingTools, setLoadingTools] = useState(false)
    const [connectingSlug, setConnectingSlug] = useState<string | null>(null)
    const [openSheet, setOpenSheet] = useState(openSheet_ || open || false)

    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    // Time picker state
    const [timePickerOpen, setTimePickerOpen] = useState(false)
    const [selectedHour, setSelectedHour] = useState("09")
    const [selectedMinute, setSelectedMinute] = useState("00")
    const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("AM")

    const hourContainerRef = useRef<HTMLDivElement | null>(null)
    const minuteContainerRef = useRef<HTMLDivElement | null>(null)
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

    //Get Tools
    const GetTools = async () => {
        setLoadingTools(true)
        try {
            const result = await axios.get('/api/agent/tools?agentId=' + agentConfig?.agentId)
            console.log(result.data)
            if (Array.isArray(result.data)) {
                setTools(result.data)
            }
        } catch (error) {
            console.error("Failed to fetch tools:", error)
        } finally {
            setLoadingTools(false)
        }
    }

    const [availableToolsList, setAvailableToolsList] = useState<any[]>([])

    // Fetch all available system tools
    useEffect(() => {
        const fetchAvailableTools = async () => {
            try {
                const res = await axios.get('/api/agent/tools?all=true')
                if (Array.isArray(res.data)) {
                    setAvailableToolsList(res.data)
                }
            } catch (e) {
                console.warn("Failed to load available tools", e)
            }
        }
        fetchAvailableTools()
    }, [])

    const unaddedTools = useMemo(() => {
        const currentSlugs = new Set((tools || []).map((t) => t.slug.toLowerCase()))
        return availableToolsList.filter((avail) => !currentSlugs.has(avail.slug.toLowerCase()))
    }, [availableToolsList, tools])

    const handleAddTool = (newTool: any) => {
        const toolObj: EditableTool = {
            slug: newTool.slug,
            name: newTool.name,
            connected: false,
            logo: newTool.icon || ""
        }
        setTools((prev) => [...prev, toolObj])
        setDraftAgent((prev: any) => ({
            ...prev,
            tools: [...(prev?.tools || []), newTool.slug]
        }))
        toast.add({
            type: 'success',
            title: `Added ${newTool.name} to agent!`
        })
    }

    const handleRemoveTool = (slug: string) => {
        setTools((prev) => prev.filter((t) => t.slug !== slug))
        setDraftAgent((prev: any) => ({
            ...prev,
            tools: (prev?.tools || []).filter((t: any) => {
                const s = typeof t === "string" ? t : t?.slug || ""
                return s !== slug
            })
        }))
        toast.add({
            type: 'info',
            title: "Tool removed from agent"
        })
    }

    useEffect(() => {
        setDraftAgent(agentConfig)
        agentConfig && GetTools()
        if (agentConfig?.schedule?.time) {
            const parsedTime = parseTimeString(agentConfig.schedule.time)
            setSelectedHour(parsedTime.hour)
            setSelectedMinute(parsedTime.minute)
            setSelectedPeriod(parsedTime.period as "AM" | "PM")
        }
    }, [agentConfig])

    // Sync openSheet if controlled via open prop or openSheet_
    useEffect(() => {
        if (open !== undefined) {
            setOpenSheet(open)
        } else if (openSheet_ !== undefined) {
            setOpenSheet(openSheet_)
        }
    }, [open, openSheet_])

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
        }
    }, [])

    const updateDraft = (key: string, value: any) => {
        setDraftAgent((prev: any) => ({
            ...prev,
            [key]: value,
        }))
    }

    const onHandleInputChange = useCallback((field: string, value: any) => {
        updateDraft(field, value)
    }, [])

    const onHandleScheduleChange = useCallback((field: string, value: any) => {
        setDraftAgent((prev: any) => ({
            ...prev,
            schedule: {
                ...prev?.schedule,
                [field]: value,
            },
        }))
    }, [])

    const shuffleImage = () => {
        const randomSeed = Math.random().toString(36).substring(2, 9)
        const newUrl = `https://api.dicebear.com/10.x/bottts-neutral/svg?seed=${randomSeed}`
        updateDraft("agentImage", newUrl)
    }

    const addSkill = () => {
        const trimmed = (skillInput || "").trim()
        if (trimmed) {
            setDraftAgent((current: any) => {
                const existing = current?.skills || []
                if (existing.includes(trimmed)) return current
                return {
                    ...current,
                    skills: [...existing, trimmed],
                }
            })
            setSkillInput("")
        }
    }

    const removeSkill = (skillToRemove: string | number) => {
        setDraftAgent((prev: any) => ({
            ...prev,
            skills: (prev?.skills || []).filter((s: string, i: number) =>
                typeof skillToRemove === "number" ? i !== skillToRemove : s !== skillToRemove
            ),
        }))
    }

    // hasSchedule check matching screenshot line 133
    const hasSchedule =
        draftAgent?.schedule?.type === "once" ||
        draftAgent?.schedule?.type === "recurring"

    // Auto-scroll selected hour & minute into view when popover opens
    useEffect(() => {
        if (timePickerOpen) {
            const timer = setTimeout(() => {
                const selectedHourEl = hourContainerRef.current?.querySelector('[data-selected="true"]')
                selectedHourEl?.scrollIntoView({ block: "center", behavior: "smooth" })

                const selectedMinuteEl = minuteContainerRef.current?.querySelector('[data-selected="true"]')
                selectedMinuteEl?.scrollIntoView({ block: "center", behavior: "smooth" })
            }, 50)
            return () => clearTimeout(timer)
        }
    }, [timePickerOpen])

    const handleHourSelect = useCallback((h: string) => {
        setSelectedHour(h)
        const newTime = `${h}:${selectedMinute} ${selectedPeriod}`
        onHandleScheduleChange("time", newTime)
    }, [selectedMinute, selectedPeriod, onHandleScheduleChange])

    const handleMinuteSelect = useCallback((m: string) => {
        setSelectedMinute(m)
        const newTime = `${selectedHour}:${m} ${selectedPeriod}`
        onHandleScheduleChange("time", newTime)
    }, [selectedHour, selectedPeriod, onHandleScheduleChange])

    const handlePeriodSelect = useCallback((p: "AM" | "PM") => {
        setSelectedPeriod(p)
        const newTime = `${selectedHour}:${selectedMinute} ${p}`
        onHandleScheduleChange("time", newTime)
    }, [selectedHour, selectedMinute, onHandleScheduleChange])

    const toggleToolConnection = useCallback((slug: string) => {
        setTools((prev) =>
            prev.map((t) => (t.slug === slug ? { ...t, connected: !t.connected } : t))
        )
        setDraftAgent((prev: any) => {
            const rawTools = prev?.tools || []
            const updatedTools = rawTools.map((t: any) => {
                const s = typeof t === "string" ? t : t?.slug || t?.name || ""
                if (s === slug) {
                    const isConn = typeof t === "object" ? Boolean(t?.connected) : false
                    return typeof t === "string"
                        ? { name: s, slug: s, connected: !isConn }
                        : { ...t, connected: !isConn }
                }
                return t
            })
            return {
                ...prev,
                tools: updatedTools,
            }
        })
    }, [])

    // Memoize tools array and processed tool items
    const toolsList = useMemo(() => {
        return Array.isArray(draftAgent?.tools) ? draftAgent.tools : []
    }, [draftAgent?.tools])

    const toolItems = useMemo(() => {
        return toolsList.map((t: any) => getToolMeta(t))
    }, [toolsList])

    const toolDisplayItems = useMemo(() => {
        if (tools && tools.length > 0) {
            return tools.map((t) => {
                const meta = getToolMeta(t.slug)
                return {
                    slug: t.slug,
                    name: t.name || meta.name || t.slug,
                    logo: t.logo,
                    icon: meta.icon,
                    connected: Boolean(t.connected),
                }
            })
        }
        return toolItems.map((meta) => {
            const matchingTool = toolsList.find((t: any) => {
                const s = typeof t === "string" ? t : t?.slug || t?.name || ""
                return s === meta.slug
            })
            const isConn = typeof matchingTool === "object" ? Boolean(matchingTool?.connected) : false
            return {
                ...meta,
                connected: isConn,
            }
        })
    }, [tools, toolItems, toolsList])

    const connectedCount = useMemo(() => {
        return toolDisplayItems.filter((t) => t.connected).length
    }, [toolDisplayItems])

    const handleCloseSheet = useCallback(() => {
        setOpenSheet(false)
        onOpenChange?.(false)
        closeSheet?.()
    }, [onOpenChange, closeSheet])

    // handleSubmit matching screenshots 1 & 2
    const handleSubmit = useCallback(async (event?: any) => {
        event?.preventDefault?.()
        setIsSaving(true)
        try {
            // update to DB as well
            const result = await axios.put('/api/agent/configure', {
                ...draftAgent
            })
            console.log(result.data)

            if (result.data?.error) {
                toast.add({
                    type: 'error',
                    title: result.data?.error,
                })
                return
            }

            // Update Updated Agent to parent
            const savedAgent = result.data || draftAgent
            setUpdatedAgent?.(savedAgent)
            onSave?.(savedAgent)
            setSaved(true)

            toast.add({
                type: 'success',
                title: "Agent Updated!",
            })

            saveTimerRef.current = setTimeout(() => {
                setSaved(false)
                handleCloseSheet()
            }, 800)
        } catch (err: any) {
            console.error("Failed to save agent updates:", err)
            toast.add({
                type: 'error',
                title: String(err?.response?.data?.error || err?.message || "Failed to update agent"),
            })
        } finally {
            setIsSaving(false)
        }
    }, [draftAgent, setUpdatedAgent, onSave, handleCloseSheet])

    const isControlled = open !== undefined
    const isSheetOpen = isControlled ? open : openSheet

    const handleOpenChange = (newOpen: boolean) => {
        setOpenSheet(newOpen)
        onOpenChange?.(newOpen)
        if (!newOpen && closeSheet) {
            closeSheet()
        }
    }

    useEffect(() => {
        const handleFocus = () => {
            if (agentConfig?.agentId) {
                GetTools()
            }
        }
        window.addEventListener("focus", handleFocus)
        return () => window.removeEventListener("focus", handleFocus)
    }, [agentConfig?.agentId])

    if (!draftAgent) {
        return null
    }

    const connectTool = async (slug: string) => {
        setConnectingSlug(slug)
        try {
            const result = await axios.post('/api/agent/tools/connect', {
                agentId: agentConfig?.agentId ?? '',
                toolSlug: slug
            })
            console.log(result.data)

            if (result?.data?.redirectUrl) {
                window.open(result.data.redirectUrl, "_blank")
                toast.add({
                    type: 'success',
                    title: 'Opening authorization window...'
                })
            } else if (result?.data?.message) {
                toast.add({
                    type: 'info',
                    title: result.data.message
                })
            }
        } catch (error: any) {
            console.error("Failed to connect tool:", error)
            toast.add({
                type: 'error',
                title: error?.response?.data?.error || "Failed to connect tool"
            })
        } finally {
            setConnectingSlug(null)
        }
    }

    return (
        <Sheet open={isSheetOpen} onOpenChange={handleOpenChange}>
            {trigger ? (
                <SheetTrigger render={trigger as React.ReactElement} />
            ) : open === undefined && openSheet_ === false ? (
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
                            {draftAgent?.agentImage ? (
                                <img
                                    src={draftAgent.agentImage}
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
                            {draftAgent?.agentImage ? (
                                <img
                                    src={draftAgent.agentImage}
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
                                onClick={shuffleImage}
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
                            value={draftAgent?.name || ""}
                            onChange={(e) => onHandleInputChange("name", e.target.value)}
                            placeholder="Agent Name"
                            className="h-10 text-xs sm:text-sm rounded-lg"
                        />
                    </div>

                    {/* Objective */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-800">Objective</label>
                        <Textarea
                            value={draftAgent?.objective || ""}
                            onChange={(e) => onHandleInputChange("objective", e.target.value)}
                            placeholder="Review events and tasks to create a prioritized daily focus plan."
                            className="min-h-[85px] text-xs sm:text-sm leading-relaxed rounded-lg resize-y"
                        />
                    </div>

                    {/* Instructions */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-800">Instructions</label>
                        <Textarea
                            value={draftAgent?.instructions || ""}
                            onChange={(e) => onHandleInputChange("instructions", e.target.value)}
                            placeholder="1. Fetch today's scheduled meetings and events..."
                            className="min-h-[170px] text-xs sm:text-sm leading-relaxed rounded-lg resize-y font-normal"
                        />
                    </div>

                    {/* Schedule Card with hasSchedule check */}
                    <div className="rounded-2xl border border-slate-200/90 p-4 space-y-3.5 bg-white">
                        <div>
                            <h4 className="font-semibold text-sm text-slate-900">Schedule</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Choose when and how often this agent runs.</p>
                        </div>

                        <div className={`grid ${hasSchedule ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Run Type</label>
                                <select
                                    value={draftAgent?.schedule?.type || "manual"}
                                    onChange={(e) => onHandleScheduleChange("type", e.target.value)}
                                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none focus:border-purple-500 cursor-pointer"
                                >
                                    <option value="manual">manual</option>
                                    <option value="scheduled">scheduled</option>
                                    <option value="recurring">recurring</option>
                                    <option value="once">once</option>
                                </select>
                            </div>

                            {/* Interactive Time Picker Popover (shown when hasSchedule) */}
                            {hasSchedule && (
                                <div className="space-y-1.5 relative">
                                    <label className="text-xs font-semibold text-slate-700">Time</label>
                                    <Popover open={timePickerOpen} onOpenChange={setTimePickerOpen}>
                                        <PopoverTrigger
                                            type="button"
                                            className="flex items-center justify-between h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none hover:border-slate-300 focus:border-purple-500 cursor-pointer text-left transition-colors"
                                        >
                                            <span className={draftAgent?.schedule?.time && draftAgent?.schedule?.time !== "--:-- --" ? "text-slate-900" : "text-slate-400 font-normal"}>
                                                {draftAgent?.schedule?.time || "--:-- --"}
                                            </span>
                                            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1.5" />
                                        </PopoverTrigger>
                                        <PopoverContent
                                            align="end"
                                            side="bottom"
                                            sideOffset={4}
                                            className="z-60 w-[190px] p-1.5 bg-white border border-slate-200 shadow-2xl rounded-xl ring-1 ring-slate-900/5 focus:outline-none"
                                        >
                                            <TimePickerPanel
                                                selectedHour={selectedHour}
                                                selectedMinute={selectedMinute}
                                                selectedPeriod={selectedPeriod}
                                                onHourSelect={handleHourSelect}
                                                onMinuteSelect={handleMinuteSelect}
                                                onPeriodSelect={handlePeriodSelect}
                                                hourContainerRef={hourContainerRef}
                                                minuteContainerRef={minuteContainerRef}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}
                        </div>

                        {/* Frequency (shown when hasSchedule) */}
                        {hasSchedule && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Frequency</label>
                                <select
                                    value={draftAgent?.schedule?.frequency || "on-demand"}
                                    onChange={(e) => onHandleScheduleChange("frequency", e.target.value)}
                                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none focus:border-purple-500 cursor-pointer"
                                >
                                    <option value="on-demand">on-demand</option>
                                    <option value="daily">daily</option>
                                    <option value="weekly">weekly</option>
                                    <option value="hourly">hourly</option>
                                    <option value="monthly">monthly</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                        <div>
                            <h4 className="font-semibold text-sm text-slate-900">Skills</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Add or remove capabilities this agent should use.</p>
                        </div>

                        {(draftAgent?.skills || []).length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {(draftAgent?.skills || []).map((skill: string, index: number) => (
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
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-slate-900">
                                Connected Tools
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {tools.filter((t) => t.connected).length} of{" "}
                                {tools.length} connected
                            </p>
                        </div>

                        {unaddedTools.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    className="h-8 px-2.5 inline-flex items-center gap-1.5 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer outline-none text-slate-700"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add Tool</span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl shadow-lg border-slate-200">
                                    <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Available Tools
                                    </div>
                                    <div className="max-h-56 overflow-y-auto space-y-0.5">
                                        {unaddedTools.map((avail) => (
                                            <DropdownMenuItem
                                                key={avail.slug}
                                                onClick={() => handleAddTool(avail)}
                                                className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium cursor-pointer rounded-lg hover:bg-slate-100"
                                            >
                                                <div className="size-5 rounded flex items-center justify-center shrink-0">
                                                    {avail.icon ? (
                                                        <img src={avail.icon} alt={avail.name} className="w-4 h-4 object-contain" />
                                                    ) : (
                                                        getToolMeta(avail.slug).icon
                                                    )}
                                                </div>
                                                <span className="truncate flex-1 text-slate-700">{avail.name}</span>
                                                <Plus className="w-3.5 h-3.5 text-slate-400" />
                                            </DropdownMenuItem>
                                        ))}
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    <div className="space-y-2">
                        {loadingTools && (
                            <div className="p-2 border rounded-2xl flex items-center justify-center gap-2 text-sm text-slate-500">
                                <Loader2Icon className="animate-spin" /> Loading Tools....
                            </div>
                        )}
                        {tools.map((tool, index) => (
                            <div
                                key={`${tool.name}-${index}`}
                                className="rounded-2xl border border-slate-200/90 p-3.5 flex items-center justify-between bg-white"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex size-9 items-center justify-center rounded-lg">
                                        {/* {tool.connected ? (
                                            <Link2 className="size-4 text-emerald-600" />
                                        ) : (
                                            <Unlink className="size-4 text-muted-foreground" />
                                        )} */}
                                        {tool.logo ? (
                                            <img
                                                src={tool.logo}
                                                alt={tool.name}
                                                width={30}
                                                height={30}
                                                className="rounded-md object-contain"
                                            />
                                        ) : (
                                            getToolMeta(tool.slug).icon
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">
                                            {tool.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {tool.connected ? (
                                                <span className="text-emerald-600">Connected</span>
                                            ) : (
                                                <span className="text-red-500">Not connected</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <Button
                                        type="button"
                                        onClick={() => connectTool(tool.slug)}
                                        variant={
                                            tool.connected
                                                ? "outline"
                                                : "default"
                                        }
                                        size="sm"
                                        disabled={connectingSlug === tool.slug}
                                    >
                                        {connectingSlug === tool.slug ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                                Connecting...
                                            </>
                                        ) : (
                                            tool.connected ? "Disconnect" : "Connect"
                                        )}
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTool(tool.slug)}
                                        className="size-7 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                        title="Remove tool"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {!loadingTools && tools.length === 0 && (
                            <div className="p-4 text-center border border-dashed rounded-2xl text-xs text-slate-400">
                                No connected tools required for this agent.
                            </div>
                        )}
                    </div>

                    {/* Output Format */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-800">Output Format</label>
                        <Textarea
                            value={draftAgent?.outputFormat || ""}
                            onChange={(e) => onHandleInputChange("outputFormat", e.target.value)}
                            placeholder="A well-structured Markdown document containing..."
                            className="min-h-[140px] text-xs sm:text-sm leading-relaxed rounded-lg resize-y"
                        />
                    </div>
                </div>

                {/* BOTTOM FOOTER */}
                <div className="shrink-0 sticky bottom-0 z-20 bg-white border-t border-slate-200/90 px-6 py-3.5 flex items-center justify-end gap-2.5 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
                    <SheetClose
                        onClick={handleCloseSheet}
                        className="h-9 px-4 inline-flex items-center justify-center text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer outline-none"
                    >
                        Cancel
                    </SheetClose>

                    <Button
                        size="sm"
                        disabled={isSaving}
                        onClick={handleSubmit}
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

export default React.memo(AgentEditSheet)