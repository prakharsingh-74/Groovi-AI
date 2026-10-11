'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { CreatedAgentType } from './CreateAgent'
import { Sparkles, X, ArrowUp, Loader2, RotateCcw } from 'lucide-react'
import axios from 'axios'
import { cleanAgentResponse } from '@/lib/utils'

type ChatMessage = {
    id: string
    role: 'agent' | 'user'
    content: string
}

type Props = {
    agent: CreatedAgentType | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function AgentChatDrawer({
    agent,
    open,
    onOpenChange,
}: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [prompt, setPrompt] = useState('')
    const [isAgentReplying, setIsAgentReplying] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)

    const storageKey = agent?.agentId ? `agent_chat_${agent.agentId}` : null

    // Load saved messages from localStorage or initialize with welcome message
    useEffect(() => {
        if (!agent || !open) return

        if (typeof window !== 'undefined' && storageKey) {
            try {
                const saved = localStorage.getItem(storageKey)
                if (saved) {
                    const parsed = JSON.parse(saved)
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setMessages(parsed)
                        setPrompt('')
                        setIsAgentReplying(false)
                        return
                    }
                }
            } catch (err) {
                console.error("Failed to load chat from localStorage:", err)
            }
        }

        // Default initial message when no saved chat exists
        setMessages([
            {
                id: 'init-msg',
                role: 'agent',
                content: `Hi! I'm ${agent.name}.\nWhat would you like me to work on?`,
            },
        ])
        setPrompt('')
        setIsAgentReplying(false)
    }, [agent?.agentId, open, storageKey])

    // Automatically persist chat messages whenever they change
    useEffect(() => {
        if (!agent || !storageKey || typeof window === 'undefined') return
        if (messages.length === 0) return

        try {
            localStorage.setItem(storageKey, JSON.stringify(messages))
        } catch (err) {
            console.error("Failed to save chat to localStorage:", err)
        }
    }, [messages, storageKey, agent])

    // Clear chat history for this agent
    const clearChat = () => {
        if (!agent) return
        if (storageKey && typeof window !== 'undefined') {
            try {
                localStorage.removeItem(storageKey)
            } catch (err) {
                console.error("Failed to clear chat storage:", err)
            }
        }
        setMessages([
            {
                id: 'init-msg',
                role: 'agent',
                content: `Hi! I'm ${agent.name}.\nWhat would you like me to work on?`,
            },
        ])
    }

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isAgentReplying])


    // Focus textarea on open
    useEffect(() => {
        if (open) {
            setTimeout(() => {
                textareaRef.current?.focus()
            }, 150)
        }
    }, [open])

    if (!agent) return null

    const sendMessage = async () => {
        const text = prompt.trim()
        if (!text || isAgentReplying) return

        const userMessage: ChatMessage = {
            id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `user-${Date.now()}`,
            role: 'user',
            content: text,
        }

        setMessages((prev) => [...prev, userMessage])
        setPrompt('')
        setIsAgentReplying(true)

        try {
            // Agent API call matching tutorial
            const result = await axios.post('/api/agent/run', {
                agentConfig: agent,
                agentId: agent?.agentId,
                input: text,
            })

            console.log(result.data?.finalOutput);

            const rawOutput = result.data?.finalOutput || (typeof result.data === "string" ? result.data : `I completed your request: "${text}".`);
            const cleanedOutput = cleanAgentResponse(rawOutput);

            const agentMessage: ChatMessage = {
                id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `agent-${Date.now()}`,
                role: "agent",
                content: cleanedOutput,
            }

            setMessages((prev) => [...prev, agentMessage])
        } catch (error: any) {
            console.error("Agent chat error:", error)
            const errorMsg = error?.response?.data?.error || error?.message || "Failed to process request. Please try again."
            const agentMessage: ChatMessage = {
                id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `agent-${Date.now()}`,
                role: 'agent',
                content: `⚠️ ${errorMsg}`,
            }
            setMessages((prev) => [...prev, agentMessage])
        } finally {
            setIsAgentReplying(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                showCloseButton={false}
                side="right"
                className="w-full sm:max-w-md md:max-w-[480px] p-0 flex flex-col h-full bg-white border-l border-slate-200/90 shadow-2xl gap-0 overflow-hidden"
            >
                <SheetTitle className="sr-only">Chat with {agent.name}</SheetTitle>
                <SheetDescription className="sr-only">
                    Chat with your agent and give it a task.
                </SheetDescription>

                {/* Top Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-[#bfdbfe] flex items-center justify-center shrink-0 overflow-hidden shadow-2xs border border-blue-100">
                            {agent.agentImage ? (
                                <img
                                    src={agent.agentImage}
                                    alt={agent.name}
                                    className="w-full h-full object-contain p-1"
                                />
                            ) : (
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                </div>
                            )}
                        </div>

                        {/* Title and Subtitle */}
                        <div className="min-w-0">
                            <h3 className="font-semibold text-slate-900 text-sm md:text-base leading-tight truncate">
                                {agent.name}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">
                                Chat with your agent and give it a task.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                        {/* Clear/Reset Chat Button */}
                        {messages.length > 1 && (
                            <button
                                onClick={clearChat}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Reset chat"
                                aria-label="Reset chat"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        )}

                        {/* Close Button */}
                        <button
                            onClick={() => onOpenChange(false)}
                            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            aria-label="Close chat"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Scrollable Chat Area */}
                <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-between scrollbar-thin">
                    <div className="space-y-6 flex-1 flex flex-col">
                        {/* Hero Start Banner */}
                        <div className="flex flex-col items-center justify-center text-center my-auto py-8 px-2">
                            <div className="w-11 h-11 rounded-2xl bg-[#f5efff] text-[#9333ea] flex items-center justify-center mb-3 shadow-2xs">
                                <Sparkles className="w-5 h-5 fill-current" />
                            </div>
                            <h4 className="text-sm md:text-[15px] font-semibold text-slate-900 leading-snug">
                                Start a chat with {agent.name}
                            </h4>
                            <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                                {agent.description ||
                                    agent.objective ||
                                    'Research current technology news across multiple web sources and deliver a concise, comparative summary highlighting key findings.'}
                            </p>
                        </div>

                        {/* Message Threads */}
                        <div className="space-y-4 mt-auto pt-4">
                            {messages.map((msg) => {
                                const isUser = msg.role === 'user'

                                if (isUser) {
                                    return (
                                        <div
                                            key={msg.id}
                                            className="flex items-start justify-end gap-2.5"
                                        >
                                            <div className="bg-purple-600 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 text-xs md:text-sm shadow-xs max-w-[85%] leading-relaxed break-words">
                                                {msg.content}
                                            </div>
                                        </div>
                                    )
                                }

                                return (
                                    <div
                                        key={msg.id}
                                        className="flex items-start gap-2.5"
                                    >
                                        {/* Agent Mini Avatar */}
                                        <div className="w-7 h-7 rounded-full bg-[#bfdbfe] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs border border-blue-100">
                                            {agent.agentImage ? (
                                                <img
                                                    src={agent.agentImage}
                                                    alt={agent.name}
                                                    className="w-full h-full object-contain p-0.5"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-0.5">
                                                    <div className="w-1 h-1 rounded-full bg-slate-800" />
                                                    <div className="w-1 h-1 rounded-full bg-slate-800" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Agent Message Bubble */}
                                        <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs px-4 py-3 text-xs md:text-sm text-slate-800 shadow-2xs max-w-[85%] leading-relaxed whitespace-pre-wrap break-words">
                                            {msg.role === 'agent' ? cleanAgentResponse(msg.content) : msg.content}
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Loading / Typing Indicator */}
                            {isAgentReplying && (
                                <div className="flex items-start gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-[#bfdbfe] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs border border-blue-100">
                                        <div className="flex items-center gap-0.5">
                                            <div className="w-1 h-1 rounded-full bg-slate-800" />
                                            <div className="w-1 h-1 rounded-full bg-slate-800" />
                                        </div>
                                    </div>
                                    <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs px-4 py-3 text-xs md:text-sm text-slate-500 shadow-2xs flex items-center gap-2">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                                        <span>{agent.name} is thinking...</span>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                </div>

                {/* Footer Input Area */}
                <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                    <div className="border border-slate-200 rounded-2xl p-3 bg-white focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-50 shadow-xs transition-all flex flex-col justify-between min-h-[96px]">
                        <textarea
                            ref={textareaRef}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Message ${agent.name}...`}
                            rows={2}
                            className="w-full resize-none border-none outline-none text-xs md:text-sm text-slate-800 placeholder:text-slate-400 bg-transparent min-h-[44px]"
                        />
                        <div className="flex items-center justify-end pt-1">
                            <button
                                type="button"
                                onClick={sendMessage}
                                disabled={!prompt.trim() || isAgentReplying}
                                className="w-8 h-8 rounded-full bg-[#a855f7] hover:bg-[#9333ea] disabled:bg-purple-300 text-white flex items-center justify-center cursor-pointer shadow-xs transition-all active:scale-95 disabled:cursor-not-allowed"
                                title="Send message"
                            >
                                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                            </button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
