'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Terminal,
  Clock,
  Sparkles,
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import { Crosshair, CornerAccents, Container, Heading, SubHeading } from './ui-elements';

const ROTATING_WORDS = [
  'Daily Operations',
  'Executive Briefs',
  'Incident Triage',
  'Financial Audits',
  'Market Intel',
];

const INTEGRATIONS = [
  { name: 'Gmail', icon: '/logos/gmail.webp' },
  { name: 'Slack', icon: '/logos/slack.png' },
  { name: 'Google Calendar', icon: '/logos/calendar.png' },
  { name: 'Google Sheets', icon: '/logos/googlesheets.png' },
  { name: 'GitHub', icon: '/logos/github.svg' },
  { name: 'Notion', icon: '/logos/notion.png' },
  { name: 'Supabase', icon: '/logos/supabase.png' },
  { name: 'Browserbase', icon: '/logos/browserbase.png' },
  { name: 'SERP Search', icon: '/logos/serp_search.png' },
];

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#0c0d12] pt-32 pb-24 font-mono md:pt-40 md:pb-32">
      {/* Decorative Technical Borders */}
      <div className="absolute top-0 bottom-0 left-8 hidden w-px bg-white/5 md:left-16 lg:block" />
      <div className="absolute top-0 right-8 bottom-0 hidden w-px bg-white/5 md:right-16 lg:block" />
      <div className="absolute top-24 left-0 hidden w-full border-t border-white/5 lg:block" />

      {/* Technical Crosshairs */}
      <Crosshair position="top-left" className="top-24" />
      <Crosshair position="top-right" className="top-24" />
      <Crosshair position="bottom-left" />
      <Crosshair position="bottom-right" />

      {/* Abstract Background Concentric Circles (Landing-01 Geometry) */}
      <div className="pointer-events-none absolute top-1/2 left-0 flex h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/5 opacity-25">
        <div className="flex h-[600px] w-[600px] items-center justify-center rounded-full border border-dashed border-white/10">
          <div className="flex h-[400px] w-[400px] items-center justify-center rounded-full border border-white/5">
            <div className="h-[200px] w-[200px] rounded-full border border-dashed border-white/5" />
          </div>
        </div>
      </div>

      {/* Ambient Top Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_70%)] blur-3xl" />

      <Container className="relative z-10 flex flex-col items-center justify-center text-center">
        {/* Monospace Telemetry Badge */}
        <div className="mb-8 inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-violet-400 backdrop-blur-sm rounded-sm">
          <span className="opacity-70">{'//'}</span>
          <span>AUTONOMOUS AGENT RUNTIME &bull; v2.0 ENGINE</span>
        </div>

        {/* Main Heading with dynamic rotating word */}
        <div className="max-w-4xl mx-auto">
          <Heading as="h1" variant="big" className="mb-2 font-sans">
            Autonomous Agents
          </Heading>

          <Heading as="h1" variant="big" className="mb-8 font-sans">
            <span className="text-zinc-400">Engineered for </span>
            <span className="inline-block relative text-violet-400 transition-all duration-300">
              {ROTATING_WORDS[wordIndex]}
            </span>
          </Heading>

          {/* Subheading */}
          <SubHeading className="mx-auto max-w-2xl text-pretty mb-10 text-zinc-400">
            Configure, bind tools, and schedule background AI workforces. Powered by Google Gemini and Inngest for durable, zero-drift autonomous execution across your entire SaaS stack.
          </SubHeading>

          {/* CTAs matching Landing-01 High-contrast buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 bg-white text-zinc-950 px-8 py-3.5 text-xs font-mono font-bold tracking-widest uppercase transition-all hover:bg-zinc-200 active:scale-[0.97] rounded-sm shadow-xl shadow-white/5"
            >
              <span>Start Building Free</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/dashboard/templates"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/15 bg-white/[0.02] text-zinc-200 px-8 py-3.5 text-xs font-mono font-bold tracking-widest uppercase transition-all hover:bg-white/5 hover:text-white active:scale-[0.97] rounded-sm"
            >
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Explore Templates</span>
            </Link>
          </div>

          {/* Telemetry strip badges */}
          <div className="mt-14 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 font-mono text-[11px] tracking-widest text-zinc-500 uppercase">
              <span className="h-px w-8 bg-white/10" />
              PRODUCTION-GRADE INFRASTRUCTURE
              <span className="h-px w-8 bg-white/10" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {['3 Agents Free', '100% Inngest Reliability', 'One-Click OAuth Tools', 'Full Neatlogs Telemetry'].map((stat) => (
                <div
                  key={stat}
                  className="border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-[11px] font-mono font-semibold tracking-wider text-zinc-400 uppercase rounded-sm"
                >
                  {stat}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Terminal Mockup */}
        <div className="mt-16 w-full max-w-4xl relative text-left">
          <div className="group relative border border-white/10 bg-[#0e1017]/90 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden rounded-sm">
            {/* Box Corner Accents */}
            <CornerAccents color="border-violet-500/60" size="h-2.5 w-2.5" />

            {/* Terminal Window Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-xs text-zinc-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                  groovi-agent-runner://ai-cfo-daily-sync
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVE &bull; INNGEST SCHEDULED
                </span>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-6 font-mono text-xs space-y-3.5">
              <div className="flex items-start gap-3 text-zinc-400">
                <span className="text-violet-400 font-bold select-none">[09:00:00 UTC]</span>
                <div>
                  <span className="text-white font-semibold">Cron Trigger:</span> Scheduled executive briefing for <span className="text-amber-300">finance-operations</span>
                </div>
              </div>

              {/* Step 1 */}
              <div className="p-3 rounded border border-white/5 bg-white/[0.01] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <div>
                    <div className="text-zinc-200 font-sans font-medium text-xs">Querying Cash Balances &amp; Monthly Burn</div>
                    <div className="text-zinc-500 text-[11px]">Tool executed: composio/google_sheets_read_range</div>
                  </div>
                </div>
                <span className="text-emerald-400 font-medium text-[11px]">✓ 200 OK (82ms)</span>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded border border-white/5 bg-white/[0.01] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <div>
                    <div className="text-zinc-200 font-sans font-medium text-xs">Synthesizing Runway Risk &amp; Variance Brief</div>
                    <div className="text-zinc-500 text-[11px]">Model: Gemini 2.5 Flash &bull; Neatlogs trace tokens: 412</div>
                  </div>
                </div>
                <span className="text-violet-400 font-medium text-[11px]">✓ Completed (214ms)</span>
              </div>

              {/* Step 3 */}
              <div className="p-3 rounded border border-white/5 bg-white/[0.01] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                    03
                  </div>
                  <div>
                    <div className="text-zinc-200 font-sans font-medium text-xs">Dispatching Slack Executive Briefing</div>
                    <div className="text-zinc-500 text-[11px]">Channel: #executive-briefs &bull; Status: 4 leads notified</div>
                  </div>
                </div>
                <span className="text-blue-400 font-medium text-[11px]">✓ Dispatched (45ms)</span>
              </div>

              {/* Terminal Footer */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-zinc-500 text-[11px] border-t border-white/5 gap-1">
                <span>Execution status: Success &bull; Total latency: 341ms</span>
                <span className="text-zinc-400">Next occurrence: Tomorrow at 9:00 AM UTC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Integrations Marquee Row */}
        <div className="mt-16 w-full max-w-5xl">
          <div className="flex items-center justify-center gap-2 mb-6 text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
            <span className="text-violet-400">{'//'}</span> Zero-Code Tool Bindings Powered by Composio OAuth
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {INTEGRATIONS.map((tool) => (
              <div
                key={tool.name}
                className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all cursor-default"
              >
                <img
                  src={tool.icon}
                  alt={tool.name}
                  className="w-4 h-4 object-contain opacity-85"
                />
                <span className="text-xs font-mono text-zinc-300">
                  {tool.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
