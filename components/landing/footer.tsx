'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Github, Twitter, Disc as Discord } from 'lucide-react';
import { Crosshair, CornerAccents, Container } from './ui-elements';
import { cn } from '@/lib/utils';

function FooterLinkColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 font-mono">
      <div className="text-violet-400 text-xs tracking-widest uppercase flex items-center gap-1.5">
        <span className="opacity-70">{'//'}</span> {title}
      </div>
      <div className="flex flex-col gap-2.5 text-xs text-zinc-400">
        {children}
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-[#08090d] text-zinc-300 font-mono">
      {/* Decorative Technical Crosshairs */}
      <Crosshair position="top-left" />
      <Crosshair position="top-right" />

      <Container className="relative z-10 pt-20 pb-12">
        {/* Top Grid */}
        <div className="relative grid grid-cols-1 gap-12 border-b border-white/5 pb-16 lg:grid-cols-12 lg:gap-8">
          {/* Left Side: Brand & Mission (span 5) */}
          <div className="flex flex-col items-start pr-0 lg:col-span-5 lg:pr-8">
            <div className="text-violet-400 mb-6 flex items-center gap-2 text-xs tracking-widest uppercase font-mono">
              <span className="opacity-70">{'//'}</span> GROOVI AI ARCHITECTURE
            </div>

            <h3 className="mb-4 font-sans text-3xl font-bold tracking-tight text-white md:text-4xl">
              Autonomous execution <br className="hidden lg:block" /> for modern teams
            </h3>

            <p className="mb-8 max-w-md font-sans text-xs leading-relaxed text-zinc-400">
              Groovi AI is the durable execution layer for background agents—connecting Gmail, Slack, GitHub, and Sheets with Inngest scheduled queues.
            </p>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-white text-zinc-950 px-7 py-3 text-xs font-mono font-bold tracking-widest uppercase hover:bg-zinc-200 transition-colors active:scale-[0.97] rounded-sm shadow-md"
            >
              <span>Launch Dashboard</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Right Side: Columns (span 7) */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7 lg:pl-8">
            <FooterLinkColumn title="PLATFORM">
              <Link href="/dashboard" className="hover:text-white transition-colors">Agents Console</Link>
              <Link href="/dashboard/templates" className="hover:text-white transition-colors">Templates</Link>
              <Link href="/dashboard/integrations" className="hover:text-white transition-colors">Connected Tools</Link>
              <Link href="/dashboard/billing" className="hover:text-white transition-colors">Billing &amp; Plans</Link>
            </FooterLinkColumn>

            <FooterLinkColumn title="ENGINEERING">
              <span className="text-zinc-500 cursor-default">Inngest Durable Queues</span>
              <span className="text-zinc-500 cursor-default">Composio OAuth 2.0</span>
              <span className="text-zinc-500 cursor-default">Neatlogs Telemetry</span>
              <span className="text-zinc-500 cursor-default">Google Gemini 2.5 Flash</span>
            </FooterLinkColumn>

            <FooterLinkColumn title="ECOSYSTEM">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub Repository</a>
              <a href="#pricing" className="hover:text-white transition-colors">Free vs Pro</a>
              <a href="#faq" className="hover:text-white transition-colors">Specifications</a>
              <span className="text-zinc-500 cursor-default">v2.0 Production</span>
            </FooterLinkColumn>
          </div>

          {/* Vertical divider line for desktop */}
          <div className="absolute top-0 bottom-0 left-[41.666%] hidden w-px bg-white/5 lg:block" />
        </div>

        {/* Middle Section (Technical Strip with loading bar graphics) */}
        <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden border-b border-white/5 py-6 md:flex-row">
          <div className="relative z-10 flex w-full flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="font-mono text-xs tracking-widest uppercase text-emerald-400">
                All Systems Operational
              </span>
            </div>

            {/* Technical loading bar graphic from landing-01 */}
            <div className="hidden items-center gap-[2px] opacity-80 lg:flex">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-3.5 w-1.5 transition-colors',
                    i < 16 ? 'bg-violet-500' : 'bg-white/10'
                  )}
                />
              ))}
            </div>

            <div className="text-violet-400 font-mono text-xs tracking-widest uppercase">
              {'[ GROOVI AI // RUNTIME READY ]'}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-start justify-between gap-8 pt-10 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-gradient-to-br from-violet-600 to-indigo-600 p-[1px]">
              <div className="w-full h-full bg-[#0b0d14] rounded flex items-center justify-center">
                <Image src="/logo.svg" alt="Groovi AI" width={16} height={16} />
              </div>
            </div>
            <span className="font-mono text-sm font-bold tracking-wider text-white uppercase">
              Groovi AI
            </span>
            <span className="text-xs text-zinc-600 font-mono hidden sm:inline">&bull;</span>
            <span className="text-xs text-zinc-500 font-sans hidden sm:inline">
              Autonomous background intelligence for high-velocity teams.
            </span>
          </div>

          <div className="text-xs font-mono text-zinc-500">
            &copy; {new Date().getFullYear()} Groovi AI. All rights reserved.
          </div>
        </div>
      </Container>

      {/* Bottom Crosshairs */}
      <Crosshair position="bottom-left" />
      <Crosshair position="bottom-right" />
    </footer>
  );
}
