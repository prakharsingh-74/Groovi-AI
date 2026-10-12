'use client';

import React from 'react';
import {
  Clock,
  Zap,
  Bot,
  Activity,
  Check,
  Code2,
  Calendar,
  Search,
  ExternalLink,
  ShieldCheck,
  Terminal
} from 'lucide-react';
import { Crosshair, CornerAccents, Container, Heading } from './ui-elements';
import { cn } from '@/lib/utils';

function FeatureCard({
  title,
  subtitle,
  description,
  icon: Icon,
  className,
  children,
}: {
  title: string;
  subtitle: string;
  description: React.ReactNode;
  icon: React.ElementType;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn('h-full w-full', className)}>
      <div className="group relative h-full w-full border border-white/10 bg-[#0e1017] p-8 transition-colors duration-300 hover:bg-white/[0.02] rounded-sm flex flex-col justify-between">
        {/* Corner Accents */}
        <CornerAccents color="border-white/30" />

        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="text-violet-400 opacity-80 transition-transform duration-300 group-hover:scale-110">
              <Icon className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest border border-white/5 bg-white/[0.02] px-2 py-0.5 rounded">
              {subtitle}
            </span>
          </div>

          <h3 className="mb-2 text-lg font-bold font-mono tracking-wider text-white uppercase">
            {title}
          </h3>

          <p className="text-xs font-sans leading-relaxed text-zinc-400">
            {description}
          </p>
        </div>

        <div className="mt-6 w-full pt-4 border-t border-white/5">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="relative overflow-hidden bg-[#0c0d12] py-24 font-mono md:py-32">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Decorative Technical Borders */}
      <div className="absolute top-0 bottom-0 left-8 hidden w-px bg-white/5 md:left-16 lg:block" />
      <div className="absolute top-0 right-8 bottom-0 hidden w-px bg-white/5 md:right-16 lg:block" />

      <Crosshair position="top-left" />
      <Crosshair position="top-right" />
      <Crosshair position="bottom-left" />
      <Crosshair position="bottom-right" />

      <Container className="relative z-10">
        <div className="mb-16 flex flex-col items-start text-left md:items-center md:text-center">
          <div className="text-violet-400 mb-6 inline-flex items-center text-xs font-bold tracking-widest uppercase">
            <span className="mr-3 opacity-70">{'//'}</span>
            CORE CAPABILITIES
          </div>

          <Heading as="h2" variant="big" className="font-sans text-balance">
            Engineered for <span className="text-violet-400">autonomous scale</span>
          </Heading>

          <p className="mt-4 max-w-2xl font-mono text-xs tracking-widest text-zinc-400 uppercase">
            Everything your team needs to schedule, orchestrate, and observe autonomous AI workflows without server maintenance.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Card 1: Temporal Automation (span 2) */}
          <FeatureCard
            className="lg:col-span-2"
            icon={Clock}
            subtitle="// TEMPORAL ENGINE"
            title="Durable Scheduling"
            description="Set recurring schedules via natural language or cron. Inngest manages step retries, backoff, and distributed job queues."
          >
            <div className="rounded border border-white/5 bg-black/50 p-3.5 text-[11px] font-mono space-y-1.5 text-zinc-300">
              <div className="text-zinc-500 font-sans text-[10px] uppercase font-bold tracking-wider">Queue Specification</div>
              <div className="text-emerald-400">frequency: &quot;daily&quot; &bull; at: &quot;09:00:00 UTC&quot;</div>
              <div className="text-zinc-400">retry_strategy: exponential_backoff (max: 5)</div>
              <div className="text-violet-400 text-[10px]">durable_state: PERSISTED_PG_SESSION</div>
            </div>
          </FeatureCard>

          {/* Card 2: Deep SaaS Tool Bindings (span 3) */}
          <FeatureCard
            className="lg:col-span-3"
            icon={Zap}
            subtitle="// ZERO-CODE TOOLS"
            title="Live Tool Bindings"
            description="Composio handles authenticated OAuth 2.0 handshakes. Agents read databases, send Slack alerts, parse Gmail, and inspect GitHub PRs."
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[
                { name: 'Google Sheets', role: 'Read & Write' },
                { name: 'Slack API', role: 'Dispatches' },
                { name: 'GitHub', role: 'Issues & PRs' },
                { name: 'SERP Search', role: 'Live Web' },
              ].map((t) => (
                <div key={t.name} className="p-2.5 rounded border border-white/5 bg-white/[0.01] text-center">
                  <div className="text-xs font-mono font-semibold text-white">{t.name}</div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{t.role}</div>
                </div>
              ))}
            </div>
          </FeatureCard>

          {/* Card 3: Intent-Driven Agent Builder (span 3) */}
          <FeatureCard
            className="lg:col-span-3"
            icon={Bot}
            subtitle="// SYSTEM SYNTHESIS"
            title="Prompt-to-Agent Builder"
            description="Type a single prompt like 'Audit weekly runway variances and alert finance.' Groovi generates structured instructions and tool parameters."
          >
            <div className="rounded border border-white/5 bg-black/50 p-3.5 text-[11px] font-mono space-y-2">
              <div className="text-zinc-400 flex items-center justify-between">
                <span>INPUT_INTENT:</span>
                <span className="text-emerald-400 text-[10px]">RESOLVED</span>
              </div>
              <div className="text-zinc-300 font-sans italic bg-white/[0.02] p-2 rounded border border-white/5 text-xs">
                &ldquo;Every Monday, scan unread client issues on GitHub, summarize severity, and post to Slack.&rdquo;
              </div>
              <div className="text-violet-400 text-[10px]">
                TOOLS: [github_issues_get, slack_chat_post_message] &bull; SCHEDULE: 0 9 * * 1
              </div>
            </div>
          </FeatureCard>

          {/* Card 4: Neatlogs Full Observability (span 2) */}
          <FeatureCard
            className="lg:col-span-2"
            icon={Activity}
            subtitle="// OBSERVABILITY"
            title="Full LLM Telemetry"
            description="Track token consumption, cost, and latency for every inference step via native Neatlogs instrumentation."
          >
            <div className="rounded border border-white/5 bg-black/50 p-3.5 text-[11px] font-mono space-y-1 text-zinc-400">
              <div className="flex justify-between text-zinc-300 font-semibold">
                <span>neatlogs::agent-run</span>
                <span className="text-emerald-400">200 OK</span>
              </div>
              <div>prompt_tokens: 382 &bull; completion: 145</div>
              <div className="text-zinc-500 text-[10px]">latency: 312ms &bull; cost: $0.00014</div>
            </div>
          </FeatureCard>
        </div>
      </Container>
    </section>
  );
}
