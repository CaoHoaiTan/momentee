'use client';

import React, { useEffect, useRef, useState } from 'react';

interface CoupleStatsProps {
  daysTogether: number;
  totalWishes: number;
  totalPhotos: number;
  viewCount: number;
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1200;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p
        className="text-3xl font-bold"
        style={{ color: 'var(--theme-text)' }}
      >
        <AnimatedNumber value={value} />
      </p>
      <p className="mt-1 text-sm" style={{ color: 'var(--theme-text-muted)' }}>
        {label}
      </p>
    </div>
  );
}

export function CoupleStats({
  daysTogether,
  totalWishes,
  totalPhotos,
  viewCount,
}: CoupleStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      <Stat label="Days Together" value={daysTogether} />
      <Stat label="Wishes" value={totalWishes} />
      <Stat label="Photos" value={totalPhotos} />
      <Stat label="Views" value={viewCount} />
    </div>
  );
}
