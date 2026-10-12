'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, UserButton } from '@clerk/nextjs';
import { Menu, X, ArrowRight, Github } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        scrolled
          ? 'bg-[#0c0d12]/90 backdrop-blur-md border-white/10 shadow-lg shadow-black/40 py-3.5'
          : 'bg-transparent border-transparent py-5'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 p-[1px] shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0b0d14] rounded-[7px] flex items-center justify-center">
              <Image src="/logo.svg" alt="Groovi AI" width={18} height={18} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm tracking-widest uppercase text-white group-hover:text-zinc-200 transition-colors">
              Groovi AI
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-zinc-400">
              v2.0
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8 font-mono text-xs tracking-wider uppercase text-zinc-400">
          <a href="#stats" className="hover:text-white transition-colors">Telemetry</a>
          <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
          <a href="#interactive" className="hover:text-white transition-colors">Playground</a>
          <a href="#templates" className="hover:text-white transition-colors">Templates</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">Specs</a>
        </nav>

        {/* Auth / Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://github.com/prakharsingh-74/groovi-ai"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center h-9 w-9 border border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 transition-colors rounded-sm"
            aria-label="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>

          {isLoaded && isSignedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 h-9 bg-white text-zinc-950 font-mono font-bold tracking-wider uppercase px-4 text-xs hover:bg-zinc-200 transition-colors active:scale-[0.97] rounded-sm"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="h-9 flex items-center px-3.5 font-mono text-xs tracking-wider uppercase text-zinc-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 h-9 bg-white text-zinc-950 font-mono font-bold tracking-wider uppercase px-4 text-xs hover:bg-zinc-200 transition-colors active:scale-[0.97] rounded-sm shadow-sm"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <div className="flex md:hidden items-center gap-3">
          {isLoaded && isSignedIn && <UserButton />}
          <button
            className="text-zinc-200 p-1.5 border border-white/10 bg-white/5 rounded"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0c0d12] border-b border-white/10 shadow-2xl p-6 flex flex-col gap-4">
          <nav className="flex flex-col gap-3 font-mono text-xs uppercase tracking-widest text-zinc-300">
            <a
              href="#stats"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/5 hover:text-white"
            >
              // Telemetry Data
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/5 hover:text-white"
            >
              // Core Capabilities
            </a>
            <a
              href="#interactive"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/5 hover:text-white"
            >
              // Interactive Playground
            </a>
            <a
              href="#templates"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/5 hover:text-white"
            >
              // Production Templates
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/5 hover:text-white"
            >
              // Pricing Matrix
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/5 hover:text-white"
            >
              // Specifications &amp; FAQ
            </a>
          </nav>

          <div className="pt-2 flex flex-col gap-2">
            {isLoaded && isSignedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-white text-zinc-950 font-mono font-bold tracking-widest uppercase py-3 text-xs rounded-sm hover:bg-zinc-200"
              >
                Go to Dashboard &rarr;
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center border border-white/10 text-white font-mono font-bold tracking-widest uppercase py-2.5 text-xs rounded-sm hover:bg-white/5"
                >
                  Sign In
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-white text-zinc-950 font-mono font-bold tracking-widest uppercase py-3 text-xs rounded-sm hover:bg-zinc-200"
                >
                  Get Started Free &rarr;
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
