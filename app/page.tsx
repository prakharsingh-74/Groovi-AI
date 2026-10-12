'use client';

import React from 'react';
import Navbar from '@/components/landing/navbar';
import Hero from '@/components/landing/hero';
import Stats from '@/components/landing/stats';
import Features from '@/components/landing/features';
import AnimatedBento from '@/components/landing/animated-bento';
import TemplatesShowcase from '@/components/landing/templates-showcase';
import Pricing from '@/components/landing/pricing';
import FAQ from '@/components/landing/faq';
import Footer from '@/components/landing/footer';

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0c0d12] text-zinc-100 selection:bg-violet-500/30 selection:text-violet-200 antialiased">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <AnimatedBento />
      <TemplatesShowcase />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
