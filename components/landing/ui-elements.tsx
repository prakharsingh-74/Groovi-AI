'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function Crosshair({
  position,
  className,
}: {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}) {
  const isTop = position.startsWith('top');
  const isLeft = position.endsWith('left');

  return (
    <div
      className={cn(
        'pointer-events-none absolute z-10 hidden h-4 w-4 lg:block',
        isTop ? 'top-0 -translate-y-1/2' : 'bottom-0 translate-y-1/2',
        isLeft ? 'left-8 -translate-x-1/2 md:left-16' : 'right-8 translate-x-1/2 md:right-16',
        className
      )}
    >
      <div className="absolute top-1/2 right-0 left-0 h-px bg-white/20" />
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20" />
    </div>
  );
}

export function CornerAccents({
  color = 'border-white/40',
  size = 'h-2 w-2',
}: {
  color?: string;
  size?: string;
}) {
  return (
    <>
      <div className={cn('pointer-events-none absolute top-0 left-0 border-t border-l', size, color)} />
      <div className={cn('pointer-events-none absolute top-0 right-0 border-t border-r', size, color)} />
      <div className={cn('pointer-events-none absolute bottom-0 left-0 border-b border-l', size, color)} />
      <div className={cn('pointer-events-none absolute right-0 bottom-0 border-r border-b', size, color)} />
    </>
  );
}

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto w-full max-w-7xl px-4 md:px-8 lg:px-12 xl:px-16', className)}>
      {children}
    </div>
  );
}

export function Heading({
  children,
  className,
  as: Component = 'h2',
  variant = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  variant?: 'big' | 'default';
}) {
  return (
    <Component
      className={cn(
        'font-bold tracking-tight text-white',
        variant === 'big'
          ? 'text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05]'
          : 'text-2xl sm:text-4xl md:text-5xl leading-tight',
        className
      )}
    >
      {children}
    </Component>
  );
}

export function SubHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'text-sm sm:text-base leading-relaxed text-zinc-400 font-sans',
        className
      )}
    >
      {children}
    </p>
  );
}

export function CountingNumber({ value }: { value: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const numMatch = value.match(/\d+/);
  const targetNumber = numMatch ? parseInt(numMatch[0], 10) : 0;
  const suffix = value.replace(/\d+/g, '');
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();
          const duration = 1800; // ms

          const step = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.floor(easeOut * targetNumber));

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setDisplayValue(targetNumber);
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [targetNumber]);

  return (
    <span ref={containerRef} className="tabular-nums font-mono">
      {displayValue}
      {suffix}
    </span>
  );
}
