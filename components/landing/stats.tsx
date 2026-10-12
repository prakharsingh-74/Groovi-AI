'use client';

import React from 'react';
import {
  ShieldCheck,
  Zap,
  Layers,
  Activity,
  Clock,
  Terminal
} from 'lucide-react';
import { Crosshair, CornerAccents, Container, Heading, CountingNumber } from './ui-elements';

const STATS_DATA = [
  {
    id: 1,
    value: '100%',
    label: 'Inngest Cron Reliability',
    sub: 'Durable background execution',
    icon: ShieldCheck,
  },
  {
    id: 2,
    value: '8+',
    label: 'Production Templates',
    sub: 'Pre-configured workflows',
    icon: Layers,
  },
  {
    id: 3,
    value: '10+',
    label: 'SaaS Tool Bindings',
    sub: 'Authenticated OAuth 2.0',
    icon: Zap,
  },
  {
    id: 4,
    value: '340ms',
    label: 'Median Step Latency',
    sub: 'Gemini Flash token streaming',
    icon: Activity,
  },
];

export default function Stats() {
  return (
    <section id="stats" className="relative w-full overflow-hidden bg-[#0c0d12] py-24 font-mono md:py-32">
      {/* Decorative Technical Borders */}
      <div className="absolute top-0 left-0 hidden w-full border-t border-white/5 lg:block" />
      <div className="absolute bottom-0 left-0 hidden w-full border-b border-white/5 lg:block" />
      <div className="absolute top-0 bottom-0 left-8 hidden w-px bg-white/5 md:left-16 lg:block" />
      <div className="absolute top-0 right-8 bottom-0 hidden w-px bg-white/5 md:right-16 lg:block" />

      {/* Crosshairs at intersections */}
      <Crosshair position="top-left" />
      <Crosshair position="top-right" />
      <Crosshair position="bottom-left" />
      <Crosshair position="bottom-right" />

      <Container className="relative z-10">
        <div className="mb-16 flex flex-col items-start text-left md:items-center md:text-center">
          <div className="text-violet-400 mb-6 inline-flex items-center text-xs font-bold tracking-widest uppercase">
            <span className="mr-3 opacity-70">{'//'}</span>
            TELEMETRY DATA
          </div>

          <Heading as="h2" variant="big" className="font-sans text-balance">
            Autonomous execution <br />
            with <span className="text-violet-400">zero drift</span>
          </Heading>

          <p className="mt-6 max-w-2xl font-mono text-xs tracking-widest text-pretty text-zinc-400 uppercase">
            Stop building brittle cron scripts. Groovi AI delivers enterprise-grade queueing, continuous retries, and comprehensive Neatlogs LLM observability.
          </p>
        </div>

        {/* 4 Technical Stat Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS_DATA.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className="group relative border border-white/10 bg-[#0e1017] p-8 text-center transition-colors duration-300 hover:bg-white/[0.03] rounded-sm"
              >
                {/* Corner Accents */}
                <CornerAccents color="border-white/30" />

                <div className="flex h-full w-full flex-col items-center justify-center">
                  <div className="mb-5 text-violet-400 opacity-80 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="mb-2 font-mono text-4xl font-bold tracking-tight text-white tabular-nums lg:text-5xl">
                    <CountingNumber value={stat.value} />
                  </div>

                  <div className="text-xs font-bold tracking-widest text-zinc-300 uppercase">
                    {stat.label}
                  </div>

                  <div className="mt-1 text-[11px] tracking-wider text-zinc-500 uppercase">
                    {stat.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
