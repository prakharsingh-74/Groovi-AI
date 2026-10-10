'use client'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { ArrowUp, BriefcaseBusiness, Loader2, Loader2Icon, Mail, Plus, Search } from 'lucide-react'
import React, { useState } from 'react'
import AIAgentQuestions from './AIAgentQuestions'

const quickSuggestions = [
    {
        label: "Find AI jobs",
        prompt: "Find the latest AI developer jobs posted this week that match my skills and summarize the best oppurtunities for me."
    },
    {
        label: "Inbox summary",
        prompt: "check my inbox and summarize the most important email, especifically anything that requires my reply or attention."
    },
    {
        label: "research topic",
        prompt: "research a topic across the web, compare multiple sources and give me a concise summary with the most important findings."
    },
    {
        label: "Plan my day",
        prompt: "check my calendar and upcoming tasks, then create a schedule"
    },
    {
        label: "reddit trends",
        prompt: "find trending reddit discussions about AI tools and agents, then summarize the most useful and interesting conversations."
    },
]

const templates = [
    {
        title: "Find latest jobs",
        description: "Search the web for the latest jobs matching my profile",
        icon: BriefcaseBusiness,
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
        border: "hover: border-orange-300",
        glow: "hover: border-orange-300",
    },
    {
        title: "daily inbox summary",
        description: "Summarize important emails and highlight what ",
        icon: Mail,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        border: "hover: border-blue-300",
        glow: "hover: border-blue-300",
    },
    {
        title: "Research a topic",
        description: "Search the web for the latest jobs matching my profile",
        icon: Search,
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
        border: "hover: border-purple-300",
        glow: "hover: border-purple-300",
    },
]

type AgentConfigResp = {
    status: "needs_clarification" | "ready"
    clarificationQuestions: clarificationQuestion,
    config: any
}

export type ClarificationQuestion = {
    id: string
    question: string
    type: "single_select" | "multi_select" | "text" | "number"
    options: string[]
    allowCustom: boolean
    customPlaceholder: string
}

export type clarificationQuestion = ClarificationQuestion

function CreateAgent() {

    const [prompt, setPrompt] = useState('')
    const [configResult, setConfigResult] = useState<AgentConfigResp | null>(null);
    const [loading, setLoading] = useState(false);

    const OnSubmit = async () => {
        setLoading(true);
        const result = await axios.post('/api/agent/configure', {
            prompt: prompt
        });

        console.log(result.data);
        setConfigResult(result.data);
        setLoading(false);
    }

    const onComplete = async (ans: any) => {
        console.log("OnComplete", ans);
        setConfigResult(null);
        const updatedPrompt = prompt + "\n" + JSON.stringify(ans);
        setLoading(true);
        const result = await axios.post('/api/agent/configure', {
            prompt: updatedPrompt
        });

        console.log(result.data);
        setConfigResult(result.data);
        setLoading(false);
    }

    return (
        <div className='mt-5'>
            <div>
                <h2 className='text-2xl font-semibold tracking-tight'>Create New Agent</h2>
                <p className='mt-1 text-sm text-muted-foreground'>Ask what type of agent you want to create, Type your goal, task or workflow </p>
            </div>

            {/* Prompt box */}

            <div className='w-full border rounded-2xl bg-background p-3 mt-3 shadow-lg shadow-purple-100 hover:shadow-purple-200 '>
                <textarea placeholder='Describe the agent you want to create...'
                    className='min-h-[90px] w-full resize-none bg-transparent px-2 py-2 outline-none'
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                />
                <div className='flex justify-between items-center'>
                    <div>
                        <Button variant={'ghost'} size={'icon'}>
                            <Plus />
                        </Button>
                    </div>
                    <Button
                        disabled={loading}
                        onClick={OnSubmit} size={'icon'} className={'h-9 w-9 rounded-full bg-purple-600'}>
                        {loading ? <Loader2 className='animate-spin' /> : <ArrowUp />}
                    </Button>
                </div>
            </div>

            <div className='mt-3 flex gap-2'>
                {quickSuggestions.map((suggestion, index) => (
                    <Button key={index} variant={'outline'}
                        onClick={() => setPrompt(suggestion.prompt)}
                        className='hover:tet-purple-700 hover:bg-purple-200 hover:border-purple-700'>
                        {suggestion.label}
                    </Button>
                ))}
            </div>

            {loading ? <div className='flex gap-2 items-center p-5 mt-7 border rounded-xl shadow'>
                <Loader2Icon className='animate-spin' />
                <h2>Generating Agent Config...</h2>
            </div> :

                !configResult && <div className='mt-10'>
                    <h2 className='flex text-lg justify-between items-center font-semibold'>Get started <span className='text-sm font-medium'>view all</span></h2>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3 mt-3'>
                        {templates.map((template, index) => (
                            <div key={index} className={`border rounded-2xl p-5 hover:cursor-pointer hover:shadow-lg ${template.border} ${template.glow}`}>
                                <template.icon className={`h-12 w-12 p-2 ${template.iconBg} ${template.iconColor} rounded-xl`} />
                                <div className='mt-6'>
                                    <h2 className='font-semibold text-foreground'>{template.title}</h2>
                                    <p className='text-sm mt-2 leading-5 text-muted-foreground'>{template.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>}

            {configResult &&
                <div>
                    {configResult.status == 'needs_clarification' && (
                        <AIAgentQuestions
                            questionList={configResult.clarificationQuestions}
                            onComplete={onComplete}
                        />
                    )}
                    {configResult.status == 'ready' && (
                        <div className='p-5 border rounded-2xl mt-5 bg-slate-50'>
                            <p className='break-all font-mono text-sm'>{JSON.stringify(configResult)}</p>
                        </div>
                    )}
                </div>
            }
        </div>
    )
}
export default CreateAgent