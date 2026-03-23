'use client';

import React, { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: string;
  label?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function calcTimeLeft(target: string): TimeLeft {
  const diff = new Date(target).getTime() - Date.now();
  const isPast = diff < 0;
  const abs = Math.abs(diff);

  return {
    days: Math.floor(abs / (1000 * 60 * 60 * 24)),
    hours: Math.floor((abs / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((abs / (1000 * 60)) % 60),
    seconds: Math.floor((abs / 1000) % 60),
    isPast,
  };
}

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold tabular-nums sm:text-3xl">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-wider opacity-60">
        {label}
      </span>
    </div>
  );
}

export function Countdown({ targetDate, label }: CountdownProps) {
  const [time, setTime] = useState<TimeLeft>(() => calcTimeLeft(targetDate));

  useEffect(() => {
    const id = setInterval(() => setTime(calcTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <p className="text-xs uppercase tracking-widest opacity-70">{label}</p>
      )}
      <div className="flex items-center gap-3 sm:gap-4">
        <Digit value={time.days} label="days" />
        <span className="text-xl opacity-40">:</span>
        <Digit value={time.hours} label="hrs" />
        <span className="text-xl opacity-40">:</span>
        <Digit value={time.minutes} label="min" />
        <span className="text-xl opacity-40">:</span>
        <Digit value={time.seconds} label="sec" />
      </div>
      {time.isPast && (
        <p className="text-xs opacity-60">since this special day</p>
      )}
    </div>
  );
}
