'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import {
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    Database,
    DollarSign,
    ExternalLink,
    Filter,
    Flame,
    GitPullRequest,
    Layers,
    Loader2,
    Mail,
    MessageSquareHeart,
    Rocket,
    Search,
    Sparkles,
    TrendingUp,
    Zap,
    Lock,
    Crown,
    ArrowRight,
    ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useContext, useState } from "react";
import { UserDetailContext } from "@/context/UserDetailContext";

interface AgentTemplate {
    id: string;
    title: string;
    category: "Finance & Strategy" | "Productivity" | "Engineering" | "Research & Intelligence" | "Marketing & Growth" | "Operations";
    description: string;
    prompt: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    accentBorder: string;
    frequency: string;
    tools: { name: string; slug: string }[];
    sampleOutput: string;
    badgeText?: string;
}

const TEMPLATES: AgentTemplate[] = [
    {
        id: "ai-cfo",
        title: "AI CFO & Financial Analyst",
        category: "Finance & Strategy",
        description: "Monitors cash runway, calculates burn rate, analyzes department expenses, and delivers executive financial briefings.",
        prompt: "Act as my AI CFO. Analyze our current burn rate and cash runway for the next 12 months, break down department expenses, and generate a concise executive financial health briefing.",
        icon: DollarSign,
        iconColor: "text-emerald-500",
        iconBg: "bg-emerald-500/10 border-emerald-500/20",
        accentBorder: "hover:border-emerald-500/40",
        frequency: "Weekly Briefing",
        badgeText: "Featured",
        tools: [
            { name: "cfo.ai", slug: "cfo_ai" },
            { name: "Google Sheets", slug: "googlesheets" },
            { name: "Slack", slug: "slack" },
        ],
        sampleOutput: "Executive Briefing: Cash Balance: $1,000,000 | MRR: $35,000 | Net Burn: $80,000/mo | Runway: 12.5 months. Departments: Engineering (45%), Sales & Mktg (25%), G&A (15%), CS (15%). Status: Healthy.",
    },
    {
        id: "executive-inbox",
        title: "Executive Inbox & Daily Standup",
        category: "Productivity",
        description: "Scans unread emails for critical action items, correlates with today's calendar meetings, and sends a daily morning brief to Slack.",
        prompt: "Check my Gmail inbox for high-priority emails, summarize key action items, cross-reference with today's Google Calendar meetings, and send me a concise morning briefing via Slack.",
        icon: Mail,
        iconColor: "text-blue-500",
        iconBg: "bg-blue-500/10 border-blue-500/20",
        accentBorder: "hover:border-blue-500/40",
        frequency: "Daily at 8:30 AM",
        badgeText: "Popular",
        tools: [
            { name: "Gmail", slug: "gmail" },
            { name: "Google Calendar", slug: "google_calendar" },
            { name: "Slack", slug: "slack" },
        ],
        sampleOutput: "☀️ Morning Standup: 3 High-Priority Emails pending reply. 4 Meetings scheduled today (Next: Product Sync at 10:00 AM). Slack notification dispatched to #my-standup.",
    },
    {
        id: "competitive-intel",
        title: "Competitive Intelligence & Web Researcher",
        category: "Research & Intelligence",
        description: "Monitors competitor pricing updates, changelogs, and breaking industry announcements, delivering synthesized intelligence dossiers.",
        prompt: "Search the web and news for recent announcements, product updates, and pricing changes from key competitors. Synthesize the findings into an executive intelligence report.",
        icon: Search,
        iconColor: "text-purple-500",
        iconBg: "bg-purple-500/10 border-purple-500/20",
        accentBorder: "hover:border-purple-500/40",
        frequency: "Weekly on Friday",
        tools: [
            { name: "Web Search", slug: "web_search" },
            { name: "SERP Search", slug: "serp_search" },
            { name: "Browserbase", slug: "browserbase" },
        ],
        sampleOutput: "Competitive Dossier: Analyzed 6 rival changelogs. Competitor A released native agents. Competitor B revised seat pricing by +15%. Full analysis saved.",
    },
    {
        id: "github-triage",
        title: "GitHub Issue Triage & Code Reviewer",
        category: "Engineering",
        description: "Monitors pull requests and issue submissions, classifies bug severity, flags breaking changes, and pings the engineering channel in Slack.",
        prompt: "Monitor new pull requests and issue submissions in GitHub. Summarize bug reports, prioritize high-severity items, and notify the engineering team channel in Slack.",
        icon: GitPullRequest,
        iconColor: "text-zinc-300",
        iconBg: "bg-zinc-800/80 border-zinc-700",
        accentBorder: "hover:border-zinc-500/40",
        frequency: "Hourly Trigger",
        tools: [
            { name: "GitHub", slug: "github" },
            { name: "Slack", slug: "slack" },
        ],
        sampleOutput: "Engineering Digest: 3 PRs ready for review (2 approvals needed). 1 high-severity bug: 'Session timeout on refresh' assigned to @frontend-team.",
    },
    {
        id: "customer-feedback",
        title: "Customer NPS & Feedback Synthesizer",
        category: "Operations",
        description: "Aggregates customer support tickets and user feedback across Notion and Sheets, clustering top feature requests and sentiment trends.",
        prompt: "Aggregate recent customer feedback and support tickets from Notion and Google Sheets. Classify common pain points, perform sentiment analysis, and post top customer feature requests in Slack.",
        icon: MessageSquareHeart,
        iconColor: "text-rose-500",
        iconBg: "bg-rose-500/10 border-rose-500/20",
        accentBorder: "hover:border-rose-500/40",
        frequency: "Weekly on Wednesday",
        tools: [
            { name: "Notion", slug: "notion" },
            { name: "Google Sheets", slug: "googlesheets" },
            { name: "Slack", slug: "slack" },
        ],
        sampleOutput: "Customer Voice Report: 88% Positive NPS. Top recurring request: 'Export runs to CSV'. Logged 3 user pain points into Notion Product Backlog.",
    },
    {
        id: "trend-hunter",
        title: "Social Trend & Tech Discussion Hunter",
        category: "Marketing & Growth",
        description: "Scours developer communities, Reddit, and Hacker News for viral discussions, converting user pain points into structured marketing content.",
        prompt: "Discover trending discussions and viral threads about AI developer tools on Reddit and tech forums. Extract key audience questions and save structured content ideas into Notion.",
        icon: TrendingUp,
        iconColor: "text-amber-500",
        iconBg: "bg-amber-500/10 border-amber-500/20",
        accentBorder: "hover:border-amber-500/40",
        frequency: "Daily at 9:00 AM",
        tools: [
            { name: "SERP Search", slug: "serp_search" },
            { name: "Web Search", slug: "web_search" },
            { name: "Notion", slug: "notion" },
        ],
        sampleOutput: "Content Hunter: 4 high-engagement threads analyzed on r/MachineLearning. Generated 3 technical blog outlines and stored in Notion Content Planner.",
    },
    {
        id: "postgres-sentinel",
        title: "PostgreSQL Database Performance Sentinel",
        category: "Engineering",
        description: "Inspects database connections, slow queries, and table record counts, alerting DevOps in Slack if latency spikes exceed threshold limits.",
        prompt: "Inspect Postgres database slow query logs, connection pools, and record spikes. Alert the DevOps team in Slack if query response latency exceeds normal operational thresholds.",
        icon: Database,
        iconColor: "text-emerald-400",
        iconBg: "bg-emerald-950/30 border-emerald-800/40",
        accentBorder: "hover:border-emerald-500/40",
        frequency: "Every 6 Hours",
        tools: [
            { name: "Supabase", slug: "supabase" },
            { name: "Slack", slug: "slack" },
        ],
        sampleOutput: "Database Sentinel: Connection pool healthy (18%). Avg response time 22ms. 0 query timeouts over past 6 hours. Status: Green.",
    },
    {
        id: "calendar-coordinator",
        title: "Smart Cross-Team Meeting Coordinator",
        category: "Productivity",
        description: "Scans cross-team calendar availability, schedules optimal sprint synchronization blocks, and dispatches agendas ahead of meetings.",
        prompt: "Scan all team member calendars to find optimal 45-minute slots for the weekly sprint sync, send calendar invites, and ping the Slack channel with the meeting agenda.",
        icon: Calendar,
        iconColor: "text-sky-500",
        iconBg: "bg-sky-500/10 border-sky-500/20",
        accentBorder: "hover:border-sky-500/40",
        frequency: "Weekly on Monday",
        tools: [
            { name: "Google Calendar", slug: "google_calendar" },
            { name: "Outlook", slug: "outlook" },
            { name: "Slack", slug: "slack" },
        ],
        sampleOutput: "Sync Scheduled: Slot locked for Tuesday 2:00 PM - 2:45 PM. Invites distributed to 5 attendees. Agenda checklist posted to #team-sync.",
    },
];

const CATEGORIES = [
    "All",
    "Finance & Strategy",
    "Productivity",
    "Engineering",
    "Research & Intelligence",
    "Marketing & Growth",
    "Operations",
];

function MiniToolLogo({ slug, name }: { slug: string; name: string }) {
    const [failed, setFailed] = useState(false);
    const lower = (slug || "").toLowerCase();
    const ext = lower.includes("gmail") ? "webp" : lower.includes("github") ? "svg" : "png";
    const logoUrl = `/logos/${lower}.${ext}`;

    if (!failed) {
        return (
            <img
                src={logoUrl}
                alt={name}
                width={16}
                height={16}
                className="w-4 h-4 object-contain rounded-xs shrink-0"
                onError={() => setFailed(true)}
            />
        );
    }

    return (
        <span className="w-4 h-4 rounded-xs bg-muted text-[10px] font-bold flex items-center justify-center uppercase">
            {name.charAt(0)}
        </span>
    );
}

export default function TemplatesPage() {
    const router = useRouter();
    const { userDetail } = useContext(UserDetailContext);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [previewTemplate, setPreviewTemplate] = useState<AgentTemplate | null>(null);
    const [launchingId, setLaunchingId] = useState<string | null>(null);
    const [launchedSuccess, setLaunchedSuccess] = useState<boolean>(false);

    const isPro = userDetail?.plan === "pro" || userDetail?.isPro;

    const filteredTemplates = TEMPLATES.filter((tpl) => {
        const matchesCategory = selectedCategory === "All" || tpl.category === selectedCategory;
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
            !query ||
            tpl.title.toLowerCase().includes(query) ||
            tpl.description.toLowerCase().includes(query) ||
            tpl.tools.some((t) => t.name.toLowerCase().includes(query));

        return matchesCategory && matchesSearch;
    });

    const handleCustomizeInBuilder = (template: AgentTemplate) => {
        const encodedPrompt = encodeURIComponent(template.prompt);
        router.push(`/dashboard/agents?prompt=${encodedPrompt}`);
    };

    const handleOneClickLaunch = async (template: AgentTemplate) => {
        try {
            setLaunchingId(template.id);
            setLaunchedSuccess(false);

            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
            const response = await axios.post("/api/agent/configure", {
                prompt: template.prompt,
                timezone: timezone,
            });

            console.log("Template launch response:", response.data);
            setLaunchedSuccess(true);

            // Redirect to agents list after a short delay
            setTimeout(() => {
                router.push("/dashboard/agents");
            }, 1200);
        } catch (err) {
            console.error("Failed to launch agent from template:", err);
            alert("Could not automatically launch agent. Redirecting to builder...");
            handleCustomizeInBuilder(template);
        } finally {
            setLaunchingId(null);
        }
    };

    // If user detail is still loading
    if (!userDetail) {
        return (
            <div className="w-full flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    <p className="text-sm font-medium">Checking subscription status...</p>
                </div>
            </div>
        );
    }

    // Free Tier Lock Screen / Paywall
    if (!isPro) {
        return (
            <div className="w-full flex justify-center min-h-[calc(100vh-4rem)] bg-background">
                <div className="w-full max-w-5xl px-6 md:px-10 py-12 flex flex-col items-center text-center">
                    {/* Lock Pill */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-blue-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-6 shadow-xs">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Groovi Pro Exclusive Feature</span>
                    </div>

                    {/* Paywall Header */}
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl leading-tight">
                        Unlock Production-Ready <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Agent Templates</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-2xl text-base md:text-lg leading-relaxed">
                        Free tier accounts include up to 3 custom agents. Access to our curated library of 8+ autonomous templates with pre-configured tools and schedules is exclusively available to Pro members.
                    </p>

                    {/* CTA Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <Button
                            onClick={() => router.push("/dashboard/billing")}
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 h-auto text-base rounded-xl gap-2.5 shadow-lg shadow-blue-500/25 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                        >
                            <Crown className="w-5 h-5 text-amber-300 fill-amber-300" />
                            <span>Upgrade to Pro ($40/month)</span>
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/dashboard/billing")}
                            className="w-full sm:w-auto h-auto py-3 px-6 text-base rounded-xl cursor-pointer"
                        >
                            View Plans &amp; Billing
                        </Button>
                    </div>

                    {/* Features Comparison Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12 w-full text-left">
                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card shadow-xs">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">8+ Autonomous Templates</h3>
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                AI CFO, Executive Inbox Standup, Competitor Scout, GitHub Triager, and Database Sentinel pre-configured with tool bindings.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card shadow-xs">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">Unlimited Agents</h3>
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                Free tier is strictly capped at 3 agents. Pro gives you unrestricted creation of agents for all your personal and team tasks.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card shadow-xs">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">Priority Execution &amp; Traces</h3>
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                Enjoy accelerated execution queues, full Neatlogs LLM telemetry traces, and dedicated priority support.
                            </p>
                        </div>
                    </div>

                    {/* Blurred Template Teaser Section */}
                    <div className="w-full mt-12 relative rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-900/30 p-6">
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-[6px] z-10 flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center mb-3 shadow-md">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                                Template Library Locked
                            </h4>
                            <p className="text-xs text-muted-foreground max-w-md mt-1">
                                Upgrade to Groovi Pro to unlock 1-click deployment and full customization of all templates.
                            </p>
                            <Button
                                size="sm"
                                onClick={() => router.push("/dashboard/billing")}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl gap-2 cursor-pointer shadow-xs"
                            >
                                <Crown className="w-4 h-4" />
                                Unlock All Templates
                            </Button>
                        </div>

                        {/* Faded preview cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 opacity-40 pointer-events-none select-none">
                            {TEMPLATES.slice(0, 3).map((tpl) => {
                                const Icon = tpl.icon;
                                return (
                                    <div key={tpl.id} className="p-4 rounded-xl border bg-white dark:bg-slate-900 text-left">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon className={`w-4 h-4 ${tpl.iconColor}`} />
                                            <span className="font-semibold text-xs truncate">{tpl.title}</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground line-clamp-2">{tpl.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center min-h-[calc(100vh-4rem)]">
            <div className="w-full max-w-7xl px-6 md:px-10 lg:px-16 py-10">
                {/* Hero Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-400">
                            <Sparkles className="w-3.5 h-3.5" />
                            Production-Ready AI Agents
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Agent Templates</h1>
                        <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
                            Accelerate your workflows with pre-configured autonomous agents. Choose a template to customize in the visual builder or launch with one click.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => router.push("/dashboard/agents")}
                            className="gap-2 shrink-0"
                        >
                            <Zap className="w-4 h-4 text-amber-500" />
                            Custom Agent Builder
                        </Button>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Category Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                        {CATEGORIES.map((cat) => {
                            const isSelected = selectedCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                                        isSelected
                                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                                            : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full md:w-72 shrink-0">
                        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-background border rounded-xl pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all"
                        />
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {filteredTemplates.map((template) => {
                        const Icon = template.icon;

                        return (
                            <div
                                key={template.id}
                                className={`group rounded-2xl border bg-card p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${template.accentBorder}`}
                            >
                                <div>
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div
                                            className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${template.iconBg}`}
                                        >
                                            <Icon className={`w-5 h-5 ${template.iconColor}`} />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {template.badgeText && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[11px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400"
                                                >
                                                    <Flame className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" />
                                                    {template.badgeText}
                                                </Badge>
                                            )}
                                            <Badge
                                                variant="outline"
                                                className="text-[11px] font-normal text-muted-foreground"
                                            >
                                                {template.category}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Title & Description */}
                                    <h3 className="font-semibold text-lg mt-4 group-hover:text-primary transition-colors">
                                        {template.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                                        {template.description}
                                    </p>

                                    {/* Frequency Badge */}
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-4 font-medium">
                                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>{template.frequency}</span>
                                    </div>

                                    {/* Integrated Tools Stack */}
                                    <div className="mt-4 pt-4 border-t">
                                        <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                                            Integrated Tools
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            {template.tools.map((tool) => (
                                                <div
                                                    key={tool.slug}
                                                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/60 border border-border text-xs font-medium text-foreground"
                                                >
                                                    <MiniToolLogo slug={tool.slug} name={tool.name} />
                                                    <span>{tool.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Card Actions */}
                                <div className="mt-6 pt-4 border-t flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 text-xs"
                                        onClick={() => setPreviewTemplate(template)}
                                    >
                                        Preview
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="flex-1 text-xs gap-1.5"
                                        onClick={() => handleCustomizeInBuilder(template)}
                                    >
                                        <Rocket className="w-3.5 h-3.5" />
                                        Use Template
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredTemplates.length === 0 && (
                    <div className="py-20 text-center">
                        <Layers className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                        <h3 className="font-semibold text-lg">No templates match your search</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                            Try adjusting your search query or select another category.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedCategory("All");
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>

            {/* Template Detailed Preview Dialog */}
            <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
                <DialogContent className="max-w-2xl">
                    {previewTemplate && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${previewTemplate.iconBg}`}
                                    >
                                        {React.createElement(previewTemplate.icon, {
                                            className: `w-5 h-5 ${previewTemplate.iconColor}`,
                                        })}
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl font-bold">
                                            {previewTemplate.title}
                                        </DialogTitle>
                                        <DialogDescription className="text-xs mt-0.5">
                                            {previewTemplate.category} • {previewTemplate.frequency}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-4 py-2">
                                <div>
                                    <h4 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-1.5">
                                        Overview
                                    </h4>
                                    <p className="text-sm text-foreground leading-relaxed">
                                        {previewTemplate.description}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-1.5">
                                        Agent Prompt & Instructions
                                    </h4>
                                    <div className="p-3 rounded-xl bg-muted/60 border text-xs font-mono text-foreground leading-relaxed select-all">
                                        {previewTemplate.prompt}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-2">
                                        Connected Integrations Required
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {previewTemplate.tools.map((t) => (
                                            <div
                                                key={t.slug}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border text-xs font-medium"
                                            >
                                                <MiniToolLogo slug={t.slug} name={t.name} />
                                                <span>{t.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-1.5">
                                        Sample Output
                                    </h4>
                                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-foreground leading-relaxed">
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
                                            Agent Execution Briefing:
                                        </span>
                                        {previewTemplate.sampleOutput}
                                    </div>
                                </div>

                                {launchedSuccess && (
                                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Agent successfully launched! Redirecting to your dashboard...</span>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    variant="outline"
                                    onClick={() => handleCustomizeInBuilder(previewTemplate)}
                                    disabled={!!launchingId}
                                >
                                    Customize in Builder
                                </Button>
                                <Button
                                    onClick={() => handleOneClickLaunch(previewTemplate)}
                                    disabled={!!launchingId || launchedSuccess}
                                    className="gap-2"
                                >
                                    {launchingId ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Launching Agent...
                                        </>
                                    ) : (
                                        <>
                                            <Rocket className="w-4 h-4" />
                                            One-Click Launch
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
