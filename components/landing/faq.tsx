'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Crosshair, CornerAccents, Container, Heading } from './ui-elements';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    q: 'How does Groovi AI execute agents autonomously?',
    a: 'Groovi AI pairs Google Gemini models with Inngest durable job queues and Composio tool bindings. When you schedule an agent (e.g. daily at 9:00 AM UTC), Inngest triggers the runner at exact cron boundaries, coordinates LLM tool calls, and dispatches real outputs hands-free.',
  },
  {
    q: 'What is the limit on the Free tier?',
    a: 'The Free tier includes up to 3 active autonomous agents with complete access to natural language instructions, manual triggers, and connected OAuth tools. When you hit the 3-agent limit or want access to our pre-built Production Template library, you can upgrade to Pro ($40/month).',
  },
  {
    q: 'Are my OAuth credentials and SaaS tokens secure?',
    a: 'Yes. All authentication handshakes (Gmail, Slack, GitHub, Sheets, Notion) are secured through Composio encrypted token vaults. We never store raw API tokens in plaintext or expose credentials during prompt execution.',
  },
  {
    q: 'How does Inngest handle network failures and third-party rate limits?',
    a: 'Inngest provides durable step execution with automatic exponential backoff. If an external API (like Slack or GitHub) experiences temporary downtime or rate limiting, the step automatically retries without restarting the entire agent workflow from scratch.',
  },
  {
    q: 'What LLM models power Groovi AI agents?',
    a: 'Groovi AI is powered by Google Gemini 2.5 Flash and Gemini Pro models for low-latency reasoning and multi-step tool calling, fully observed through Neatlogs telemetry.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative overflow-hidden bg-[#0c0d12] py-24 font-mono md:py-32">
      {/* Decorative Technical Borders */}
      <div className="absolute top-0 left-0 hidden w-full border-t border-white/5 lg:block" />
      <div className="absolute top-0 bottom-0 left-8 hidden w-px bg-white/5 md:left-16 lg:block" />
      <div className="absolute top-0 right-8 bottom-0 hidden w-px bg-white/5 md:right-16 lg:block" />

      <Crosshair position="top-left" />
      <Crosshair position="top-right" />
      <Crosshair position="bottom-left" />
      <Crosshair position="bottom-right" />

      <Container className="relative z-10 max-w-4xl">
        <div className="mb-16 flex flex-col items-start text-left md:items-center md:text-center">
          <div className="text-violet-400 mb-6 inline-flex items-center text-xs font-bold tracking-widest uppercase">
            <span className="mr-3 opacity-70">{'//'}</span>
            SPECIFICATIONS &amp; FAQ
          </div>

          <Heading as="h2" variant="big" className="font-sans text-balance">
            Everything you need <span className="text-violet-400">to know</span>
          </Heading>

          <p className="mt-4 max-w-lg font-mono text-xs tracking-widest text-zinc-400 uppercase">
            Architectural answers regarding runtime autonomy, billing limits, and security.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="relative border border-white/10 bg-[#0e1017] rounded-sm overflow-hidden transition-all"
              >
                <CornerAccents color="border-white/20" size="h-2 w-2" />

                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-xs sm:text-sm font-mono font-bold tracking-wider text-zinc-200 hover:text-white cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-violet-400 text-xs font-normal">0{idx + 1}.</span>
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-zinc-500 transition-transform duration-200 shrink-0 ml-2',
                      isOpen && 'rotate-180 text-violet-400'
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs font-sans text-zinc-400 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
