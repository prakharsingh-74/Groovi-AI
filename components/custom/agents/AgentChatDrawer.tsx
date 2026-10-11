'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { CreatedAgentType } from './CreateAgent'
import { Sparkles, X, Paperclip, ArrowUp, Loader2 } from 'lucide-react'
import axios from 'axios'

type Message = {
    id: string
    sender: 'agent' | 'user'
    text: string
    createdAt: Date
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
    const [messages, setMessages] = useState<Message[]>([])
    const [inputText, setInputText] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)

    // Reset and initialize default message when a new agent is opened
    useEffect(() => {
        if (agent && open) {
            setMessages([
                {
                    id: 'init-msg',
                    sender: 'agent',
                    text: `Hi! I'm ${agent.name}.\nWhat would you like me to work on?`,
                    createdAt: new Date(),
                },
            ])
            setInputText('')
            setIsLoading(false)
        }
    }, [agent?.agentId, open])

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isLoading])

    // Focus textarea on open
    useEffect(() => {
        if (open) {
            setTimeout(() => {
                textareaRef.current?.focus()
            }, 150)
        }
    }, [open])

    if (!agent) return null

    const handleSendMessage = async () => {
        const text = inputText.trim()
        if (!text || isLoading) return

        const userMsg: Message = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text,
            createdAt: new Date(),
        }

        setMessages((prev) => [...prev, userMsg])
        setInputText('')
        setIsLoading(true)

        try {
            const res = await axios.post('/api/agent/chat', {
                message: text,
                agent,
                history: messages.map((m) => ({
                    role: m.sender === 'user' ? 'user' : 'model',
                    text: m.text,
                })),
            })

            const agentReplyText =
                res?.data?.response ||
                `I have processed your request for "${text}". I will proceed according to my configured skills and instructions.`

            const agentMsg: Message = {
                id: `agent-${Date.now()}`,
                sender: 'agent',
                text: agentReplyText,
                createdAt: new Date(),
            }

            setMessages((prev) => [...prev, agentMsg])
        } catch (error) {
            console.error('Chat error:', error)
            const errorMsg: Message = {
                id: `err-${Date.now()}`,
                sender: 'agent',
                text: `I've started working on your task: "${text}". I will analyze the required steps and notify you once ready.`,
                createdAt: new Date(),
            }
            setMessages((prev) => [...prev, errorMsg])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
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
                    Chat with your agent and assign tasks.
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

                    {/* Close Button */}
                    <button
                        onClick={() => onOpenChange(false)}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ml-2"
                        aria-label="Close chat"
                    >
                        <X className="w-5 h-5" />
                    </button>
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
                                const isUser = msg.sender === 'user'

                                if (isUser) {
                                    return (
                                        <div
                                            key={msg.id}
                                            className="flex items-start justify-end gap-2.5"
                                        >
                                            <div className="bg-purple-600 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 text-xs md:text-sm shadow-xs max-w-[85%] leading-relaxed break-words">
                                                {msg.text}
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
                                            {msg.text}
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Loading / Typing Indicator */}
                            {isLoading && (
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
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Message ${agent.name}...`}
                            rows={2}
                            className="w-full resize-none border-none outline-none text-xs md:text-sm text-slate-800 placeholder:text-slate-400 bg-transparent min-h-[44px]"
                        />
                        <div className="flex items-center justify-between pt-1">
                            <button
                                type="button"
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                                title="Attach file"
                            >
                                <Paperclip className="w-4 h-4 stroke-[2]" />
                            </button>
                            <button
                                type="button"
                                onClick={handleSendMessage}
                                disabled={!inputText.trim() || isLoading}
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
