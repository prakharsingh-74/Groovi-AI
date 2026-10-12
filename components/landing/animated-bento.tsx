'use client';

import React, { useState } from 'react';
import {
  Bot,
  Play,
  Clock,
  Sparkles,
  DollarSign,
  Mail,
  Search,
  GitPullRequest,
  Check,
  Terminal,
  Activity
} from 'lucide-react';
import { Crosshair, CornerAccents, Container, Heading } from './ui-elements';
import { cn } from '@/lib/utils';

const AGENT_PRESETS = [
  {
    id: 'cfo',
    name: 'AI CFO & Burn Rate Sentinel',
    icon: DollarSign,
    schedule: 'Daily @ 09:00 AM UTC',
    tools: ['Google Sheets', 'Slack'],
    status: 'ACTIVE • INNGEST SCHEDULED',
    summary: 'Queries monthly burn rate and runway from sheets, alerts Slack channel #finance if runway < 6 months.',
  },
  {
    id: 'inbox',
    name: 'Executive Inbox & Morning Standup',
    icon: Mail,
    schedule: 'Daily @ 08:30 AM EST',
    tools: ['Gmail', 'Google Calendar', 'Slack'],
    status: 'ACTIVE • INNGEST SCHEDULED',
    summary: 'Scans unread emails for high-priority sender actions, cross-checks calendar conflicts, sends digest to Slack.',
  },
  {
    id: 'scout',
    name: 'Competitive Intelligence Scout',
    icon: Search,
    schedule: 'Weekly • Mondays 07:00 AM UTC',
    tools: ['SERP Search', 'Browserbase'],
    status: 'ACTIVE • INNGEST SCHEDULED',
    summary: 'Performs live web queries for competitor pricing updates and changelogs, formats briefing into Notion.',
  },
  {
    id: 'github',
    name: 'GitHub Issue Triage & Reviewer',
    icon: GitPullRequest,
    schedule: 'Hourly recurring trigger',
    tools: ['GitHub', 'Slack'],
    status: 'ACTIVE • INNGEST SCHEDULED',
    summary: 'Monitors pull requests and triage labels, verifies CI/CD status, and alerts on-call engineering leads.',
  },
];

export default function AnimatedBento() {
  const [selectedAgent, setSelectedAgent] = useState(AGENT_PRESETS[0]);
  const [selectedFreq, setSelectedFreq] = useState<'hourly' | 'daily' | 'weekly'>('daily');
  const [simulatedRunning, setSimulatedRunning] = useState(false);
  const [simulatedResult, setSimulatedResult] = useState<string | null>(null);

  const handleSimulateRun = () => {
    setSimulatedRunning(true);
    setSimulatedResult(null);
    setTimeout(() => {
      setSimulatedRunning(false);
      setSimulatedResult(`✓ 200 OK • Dispatched in 284ms (${selectedAgent.tools.join(' + ')})`);
    }, 800);
  };

  return (
    <section id="interactive" className="relative overflow-hidden bg-[#0c0d12] py-24 font-mono md:py-32">
      {/* Decorative Technical Borders */}
      <div className="absolute top-0 left-0 hidden w-full border-t border-white/5 lg:block" />
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
            INTERACTIVE PLAYGROUND
          </div>

          <Heading as="h2" variant="big" className="font-sans text-balance">
            Interactions that <span className="text-violet-400">execute with intent</span>
          </Heading>

          <p className="mt-4 max-w-2xl font-mono text-xs tracking-widest text-zinc-400 uppercase">
            Select an agent prototype below to inspect its live configuration, tool bindings, and dispatch triggers.
          </p>
        </div>

        {/* 3-Column Interactive Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Column 1: Agent Selector (span 1) */}
          <div className="relative border border-white/10 bg-[#0e1017] p-6 rounded-sm flex flex-col justify-between">
            <CornerAccents color="border-white/30" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">
                [ SELECT AGENT PROTOTYPE ]
              </div>

              <div className="space-y-2.5">
                {AGENT_PRESETS.map((agent) => {
                  const Icon = agent.icon;
                  const isSelected = selectedAgent.id === agent.id;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => {
                        setSelectedAgent(agent);
                        setSimulatedResult(null);
                      }}
                      className={cn(
                        'w-full text-left p-3.5 rounded border transition-all flex items-center justify-between cursor-pointer',
                        isSelected
                          ? 'border-violet-500/50 bg-violet-500/10 text-white'
                          : 'border-white/5 bg-white/[0.01] text-zinc-400 hover:border-white/15 hover:bg-white/[0.03]'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-7 h-7 rounded flex items-center justify-center',
                            isSelected ? 'bg-violet-600 text-white' : 'bg-white/5 text-zinc-400'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-sans text-xs font-semibold">{agent.name}</div>
                          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                            {agent.tools.join(' • ')}
                          </div>
                        </div>
                      </div>

                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-zinc-500">
              Click any agent to inspect runtime behavior &rarr;
            </div>
          </div>

          {/* Column 2 & 3: Runtime Inspector & Dispatcher (span 2) */}
          <div className="lg:col-span-2 relative border border-white/10 bg-[#0e1017] p-6 rounded-sm flex flex-col justify-between">
            <CornerAccents color="border-violet-500/50" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  [ RUNTIME SPECIFICATION // {selectedAgent.id.toUpperCase()} ]
                </div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  {selectedAgent.status}
                </div>
              </div>

              {/* Title and summary */}
              <h3 className="text-xl font-bold font-sans text-white mb-2">
                {selectedAgent.name}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-6">
                {selectedAgent.summary}
              </p>

              {/* Tool Pills */}
              <div className="space-y-3 mb-6">
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  ACTIVE OAUTH PERMISSIONS:
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.tools.map((tool) => (
                    <span
                      key={tool}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-white/10 bg-white/[0.03] text-xs font-mono text-zinc-200"
                    >
                      <Check className="w-3 h-3 text-emerald-400" />
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Frequency Selector */}
              <div className="space-y-3">
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  TRIGGER FREQUENCY SCHEDULE:
                </div>
                <div className="flex gap-2">
                  {[
                    { key: 'hourly', label: 'Hourly' },
                    { key: 'daily', label: 'Daily (9:00 AM UTC)' },
                    { key: 'weekly', label: 'Weekly (Mondays)' },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setSelectedFreq(f.key as any)}
                      className={cn(
                        'px-3.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer border',
                        selectedFreq === f.key
                          ? 'border-violet-500 bg-violet-600 text-white shadow-sm'
                          : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5'
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Dispatch Simulator */}
            <div className="mt-8 pt-5 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs font-mono text-zinc-400">
                {simulatedResult ? (
                  <span className="text-emerald-400">{simulatedResult}</span>
                ) : (
                  <span>Ready to test dispatch trigger</span>
                )}
              </div>

              <button
                onClick={handleSimulateRun}
                disabled={simulatedRunning}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-white text-zinc-950 font-mono font-bold text-xs hover:bg-zinc-200 transition-all cursor-pointer active:scale-[0.97] disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 text-zinc-950 fill-zinc-950" />
                <span>{simulatedRunning ? 'Dispatched to Inngest...' : 'Simulate 1-Click Run'}</span>
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
