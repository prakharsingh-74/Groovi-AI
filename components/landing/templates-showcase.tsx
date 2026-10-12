'use client';

import React from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Mail,
  Search,
  GitPullRequest,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { Crosshair, CornerAccents, Container, Heading } from './ui-elements';

const TEMPLATES = [
  {
    title: 'AI CFO & Burn Rate Sentinel',
    category: 'Finance & Strategy',
    description: 'Monitors cash runway, calculates monthly burn rate, and delivers executive financial health briefings.',
    tools: ['Google Sheets', 'Slack'],
    icon: DollarSign,
    accent: 'text-emerald-400',
    badge: 'Featured',
  },
  {
    title: 'Executive Inbox & Morning Standup',
    category: 'Productivity',
    description: 'Scans unread emails for high-priority action items, cross-references Google Calendar, and delivers morning digests.',
    tools: ['Gmail', 'Google Calendar', 'Slack'],
    icon: Mail,
    accent: 'text-blue-400',
    badge: 'Popular',
  },
  {
    title: 'Competitive Intelligence Scout',
    category: 'Market Research',
    description: 'Tracks rival pricing updates, changelogs, and breaking AI announcements across developer communities.',
    tools: ['SERP Search', 'Browserbase'],
    icon: Search,
    accent: 'text-purple-400',
    badge: 'Automation',
  },
  {
    title: 'GitHub Issue Triage & Reviewer',
    category: 'Engineering',
    description: 'Monitors pull requests and issue submissions, classifies bug severity, and alerts engineering in Slack.',
    tools: ['GitHub', 'Slack'],
    icon: GitPullRequest,
    accent: 'text-zinc-300',
    badge: 'DevOps',
  },
];

export default function TemplatesShowcase() {
  return (
    <section id="templates" className="relative overflow-hidden bg-[#0c0d12] py-24 font-mono md:py-32">
      {/* Decorative Technical Borders */}
      <div className="absolute top-0 left-0 hidden w-full border-t border-white/5 lg:block" />
      <div className="absolute top-0 bottom-0 left-8 hidden w-px bg-white/5 md:left-16 lg:block" />
      <div className="absolute top-0 right-8 bottom-0 hidden w-px bg-white/5 md:right-16 lg:block" />

      <Crosshair position="top-left" />
      <Crosshair position="top-right" />
      <Crosshair position="bottom-left" />
      <Crosshair position="bottom-right" />

      <Container className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="text-violet-400 mb-6 inline-flex items-center text-xs font-bold tracking-widest uppercase">
              <span className="mr-3 opacity-70">{'//'}</span>
              PRODUCTION TEMPLATES
            </div>

            <Heading as="h2" variant="big" className="font-sans">
              Deploy verified agents <span className="text-violet-400">instantly</span>
            </Heading>

            <p className="mt-4 max-w-xl font-mono text-xs tracking-widest text-zinc-400 uppercase">
              Pick a verified multi-tool agent template to clone into your workspace or customize via natural language.
            </p>
          </div>

          <Link
            href="/dashboard/templates"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-violet-400 hover:text-violet-300 transition-colors"
          >
            <span>View All 8+ Templates in Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <div
                key={tpl.title}
                className="group relative border border-white/10 bg-[#0e1017] p-7 rounded-sm flex flex-col justify-between transition-colors hover:bg-white/[0.02]"
              >
                <CornerAccents color="border-white/30" />

                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded border border-white/10 bg-white/[0.03] flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${tpl.accent}`} />
                    </div>
                    <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded border border-white/10 bg-white/[0.02] text-zinc-400">
                      {tpl.badge}
                    </span>
                  </div>

                  <h3 className="font-sans font-bold text-lg text-white mt-4 group-hover:text-violet-300 transition-colors">
                    {tpl.title}
                  </h3>

                  <p className="text-xs font-sans text-zinc-400 mt-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-zinc-500">
                    <span className="text-zinc-600">TOOLS: </span>
                    <span className="text-zinc-300">{tpl.tools.join(', ')}</span>
                  </div>

                  <Link
                    href="/dashboard/templates"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-white group-hover:text-violet-400 transition-colors"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
