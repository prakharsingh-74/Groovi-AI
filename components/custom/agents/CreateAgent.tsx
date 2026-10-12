'use client'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { ArrowUp, BriefcaseBusiness, DollarSign, Loader2, Loader2Icon, Mail, Plus, Search, Crown, Sparkles, AlertTriangle } from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AIAgentQuestions from './AIAgentQuestions'
import NewAgentCard from './NewAgentCard'
import { UserDetailContext } from '@/context/UserDetailContext'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const quickSuggestions = [
    {
        label: "AI CFO Briefing",
        prompt: "Act as my AI CFO. Analyze our current burn rate and cash runway for the next 12 months, break down department expenses, and generate a concise executive financial health briefing."
    },
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
        title: "AI CFO & Financial Analyst",
        description: "Monitors cash runway, calculates burn rate, and delivers executive financial health briefings.",
        prompt: "Act as my AI CFO. Analyze our current burn rate and cash runway for the next 12 months, break down department expenses, and generate a concise executive financial health briefing.",
        icon: DollarSign,
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        border: "hover:border-emerald-300",
        glow: "hover:border-emerald-300",
    },
    {
        title: "Find latest jobs",
        description: "Search the web for the latest jobs matching my profile",
        prompt: "Find the latest AI developer jobs posted this week that match my skills and summarize the best oppurtunities for me.",
        icon: BriefcaseBusiness,
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
        border: "hover: border-orange-300",
        glow: "hover: border-orange-300",
    },
    {
        title: "daily inbox summary",
        description: "Summarize important emails and highlight what ",
        prompt: "check my inbox and summarize the most important email, especifically anything that requires my reply or attention.",
        icon: Mail,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        border: "hover: border-blue-300",
        glow: "hover: border-blue-300",
    },
    {
        title: "Research a topic",
        description: "Search the web for the latest jobs matching my profile",
        prompt: "research a topic across the web, compare multiple sources and give me a concise summary with the most important findings.",
        icon: Search,
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
        border: "hover: border-purple-300",
        glow: "hover: border-purple-300",
    },
]

type AgentConfigResp = {
    status: "needs_clarification" | "ready"
    clarificationQuestions: ClarificationQuestion[],
    config: any
}

export type AgentSchedule = {
    type: "once" | "recurring" | "manual" | string
    frequency?: string
    time?: string
    timezone?: string
}

export type CreatedAgentType = {
    id: number,
    userEmail: string,
    agentId: string,
    name: string,
    agentImage: string,
    description: string,
    instructions: string,
    objective: string,
    tools: any,
    skills: string[],
    schedule: AgentSchedule,
    outputFormat: string,
    status: string,
    createdAt: string,
    composioSessionId?: string 
}

export type createdAgentType = CreatedAgentType


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
    const router = useRouter();
    const searchParams = useSearchParams();
    const { userDetail, setUserDetail } = useContext(UserDetailContext);
    const [prompt, setPrompt] = useState('')
    const [configResult, setConfigResult] = useState<AgentConfigResp | null>(null);
    const [createdAgent, setCreateadAgent] = useState<CreatedAgentType | null>(null);
    const [loading, setLoading] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [redirectCountdown, setRedirectCountdown] = useState(2);

    const isPro = userDetail?.plan === 'pro' || userDetail?.isPro;
    const agentCount = Number(userDetail?.agentCount || 0);

    const triggerLimitModalAndRedirect = () => {
        setShowLimitModal(true);
        let count = 2;
        setRedirectCountdown(count);
        const timer = setInterval(() => {
            count -= 1;
            setRedirectCountdown(count);
            if (count <= 0) {
                clearInterval(timer);
                router.push('/dashboard/billing');
            }
        }, 1000);
    };

    useEffect(() => {
        const queryPrompt = searchParams.get('prompt');
        if (queryPrompt) {
            setPrompt(queryPrompt);
        }
    }, [searchParams]);

    const getBrowserTimezone = () => {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    }

    const OnSubmit = async () => {
        if (!isPro && agentCount >= 3) {
            triggerLimitModalAndRedirect();
            return;
        }

        setLoading(true);
        const timezone = getBrowserTimezone();
        try {
            const result = await axios.post('/api/agent/configure', {
                prompt: prompt,
                timezone: timezone
            });

            console.log(result.data);
            setConfigResult(result.data);
            if (result.data?.status === 'ready' || result.data?.status_ === 'ready') {
                const agentData = result.data.dbResult ?? (result.data.config ? {
                    ...result.data.config,
                    agentId: result.data.agentId,
                    agentImage: result.data.agentImage,
                    status: 'active'
                } : null);
                setCreateadAgent(agentData);
                // Refresh user detail to increment agent count
                axios.get('/api/users').then(res => res.data && setUserDetail(res.data)).catch(() => {});
            }
        } catch (error: any) {
            console.error("Failed to generate agent config:", error);
            if (error.response?.data?.limitReached || error.response?.status === 403) {
                triggerLimitModalAndRedirect();
                return;
            }
        } finally {
            setLoading(false);
        }
    }

    const onComplete = async (ans: any) => {
        if (!isPro && agentCount >= 3) {
            triggerLimitModalAndRedirect();
            return;
        }

        console.log("OnComplete", ans);
        setConfigResult(null);
        const updatedPrompt = prompt + "\n" + JSON.stringify(ans);
        setLoading(true);
        try {
            const result = await axios.post('/api/agent/configure', {
                prompt: updatedPrompt,
                timezone: getBrowserTimezone()
            });

            console.log(result.data);
            setConfigResult(result.data);
            const agentData = result.data.dbResult ?? (result.data.config ? {
                ...result.data.config,
                agentId: result.data.agentId,
                agentImage: result.data.agentImage,
                status: 'active'
            } : null);
            setCreateadAgent(agentData);
            setLoading(false);
            // Refresh user detail to increment agent count
            axios.get('/api/users').then(res => res.data && setUserDetail(res.data)).catch(() => {});
        } catch (error: any) {
            console.error("Failed to submit clarification answers:", error);
            if (error.response?.data?.limitReached || error.response?.status === 403) {
                triggerLimitModalAndRedirect();
                return;
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='mt-5'>
            {/* Limit Banner if 3/3 agents used on Free tier */}
            {!isPro && agentCount >= 3 && (
                <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                                You have used the free tier of groovi ({agentCount}/3 agents created)
                            </h4>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                                Upgrade to Groovi Pro to create unlimited autonomous agents and access premium templates.
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => router.push('/dashboard/billing')}
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shrink-0 cursor-pointer"
                    >
                        <Crown className="w-4 h-4" />
                        Upgrade to Pro
                    </Button>
                </div>
            )}

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
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-3'>
                        {templates.map((template, index) => (
                            <div 
                                key={index} 
                                onClick={() => setPrompt(template.prompt || template.description)}
                                className={`border rounded-2xl p-5 hover:cursor-pointer hover:shadow-lg transition-all ${template.border} ${template.glow}`}
                            >
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
                    {configResult.status == 'needs_clarification'
                        &&
                        <div className='p-5 border rounded-2xl'>
                            <AIAgentQuestions
                                questionList={configResult.clarificationQuestions}
                                onComplete={onComplete}
                            />
                        </div>
                    }

                </div>
            }
            {createdAgent && <NewAgentCard createdAgent={createdAgent} />}

            {/* Free Tier Limit Reached Dialog */}
            <AlertDialog open={showLimitModal} onOpenChange={setShowLimitModal}>
                <AlertDialogContent className="max-w-md text-center p-6 sm:p-7">
                    <AlertDialogHeader className="items-center text-center">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 flex items-center justify-center mb-2 mx-auto">
                            <Crown className="w-7 h-7" />
                        </div>
                        <AlertDialogTitle className="text-xl font-bold">
                            You have used the free tier of groovi
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
                            You have created 3/3 agents allowed on the Free plan. Upgrade to Groovi Pro to unlock unlimited autonomous agents, premium templates, and priority execution.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="my-3 p-3 rounded-xl bg-muted/60 border text-xs text-muted-foreground">
                        Redirecting to Billing in <span className="font-bold text-foreground">{redirectCountdown}s</span>...
                    </div>
                    <AlertDialogFooter className="sm:justify-center">
                        <AlertDialogAction
                            onClick={() => router.push('/dashboard/billing')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl gap-2 cursor-pointer"
                        >
                            <Crown className="w-4 h-4" />
                            Go to Billing Now
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
export default CreateAgent