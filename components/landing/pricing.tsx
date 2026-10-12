'use client';

import React from 'react';
import Link from 'next/link';
import {
  Check,
  Lock,
  Crown,
  ArrowRight,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { Crosshair, CornerAccents, Container, Heading } from './ui-elements';

export default function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden bg-[#0c0d12] py-24 font-mono md:py-32">
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
            PRICING MATRIX
          </div>

          <Heading as="h2" variant="big" className="font-sans text-balance">
            Start free, scale with <span className="text-violet-400">Pro</span>
          </Heading>

          <p className="mt-4 max-w-xl font-mono text-xs tracking-widest text-zinc-400 uppercase">
            Transparent limits powered by Clerk Billing. No hidden fees or surprise usage charges.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Free Tier */}
          <div className="relative border border-white/10 bg-[#0e1017] p-8 rounded-sm flex flex-col justify-between transition-colors hover:bg-white/[0.02]">
            <CornerAccents color="border-white/30" />

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-sans font-bold text-xl text-white">Free Plan</h3>
                <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded border border-white/10 bg-white/[0.02] text-zinc-400">
                  Tier 01
                </span>
              </div>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-5xl font-mono font-bold text-white">$0</span>
                <span className="text-xs font-mono text-zinc-500 uppercase">/ month</span>
              </div>

              <p className="text-xs font-sans text-zinc-400 mt-3 leading-relaxed">
                Ideal for testing personal autonomous workflows and experimenting with multi-tool agents.
              </p>

              <div className="mt-8 space-y-3.5 text-xs font-mono text-zinc-300">
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>3 Autonomous Agents</strong> limit</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Standard execution speed &amp; triggers</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All zero-code OAuth integrations</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-600 line-through">
                  <Lock className="w-4 h-4 text-zinc-700 shrink-0" />
                  <span>Production Template Library (Locked)</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-600 line-through">
                  <Lock className="w-4 h-4 text-zinc-700 shrink-0" />
                  <span>Priority queue execution</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <Link
                href="/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-sm border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white font-mono font-bold text-xs uppercase tracking-widest transition-all"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Pro Tier */}
          <div className="relative border border-violet-500/40 bg-gradient-to-b from-violet-950/20 to-[#0e1017] p-8 rounded-sm flex flex-col justify-between shadow-xl shadow-violet-950/20">
            <CornerAccents color="border-violet-400" />

            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-sm bg-violet-600 text-white font-mono text-[10px] font-bold uppercase tracking-widest">
              Recommended
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-sans font-bold text-xl text-white">Pro Plan</h3>
                  <Crown className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded border border-violet-500/30 bg-violet-500/10 text-violet-300">
                  Unlimited
                </span>
              </div>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-5xl font-mono font-bold text-white">$40</span>
                <span className="text-xs font-mono text-zinc-400 uppercase">/ month</span>
              </div>

              <p className="text-xs font-sans text-zinc-400 mt-3 leading-relaxed">
                For operations leads, builders, and teams requiring unconstrained agent scaling.
              </p>

              <div className="mt-8 space-y-3.5 text-xs font-mono text-zinc-200">
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-violet-400 shrink-0" />
                  <span><strong>Unlimited Autonomous Agents</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-violet-400 shrink-0" />
                  <span><strong>All 8+ Production Templates Unlocked</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-violet-400 shrink-0" />
                  <span><strong>Priority execution queue &amp; retries</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>Dedicated Discord/Slack engineering support</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>Advanced Neatlogs telemetry logs</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-violet-500/20">
              <Link
                href="/dashboard/billing"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-sm bg-violet-600 hover:bg-violet-500 text-white font-mono font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-violet-600/30 active:scale-[0.97]"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>Upgrade to Pro &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
