'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EasterEggProps {
  children: React.ReactNode;
  threshold?: number;
}

interface Burst {
  id: number;
  emoji: string;
  x: number;
  y: number;
  angle: number;
}

const BURST_EMOJIS = ['💕', '💖', '✨', '🎉', '💗', '❤️', '🩷', '💫', '🥰', '💝'];

export function EasterEgg({ children, threshold = 10 }: EasterEggProps) {
  const [clicks, setClicks] = useState(0);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [triggered, setTriggered] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const next = clicks + 1;
      setClicks(next);

      if (next >= threshold && !triggered) {
        setTriggered(true);

        // Generate burst of particles
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const newBursts: Burst[] = Array.from({ length: 30 }, (_, i) => ({
          id: Date.now() + i,
          emoji: BURST_EMOJIS[Math.floor(Math.random() * BURST_EMOJIS.length)],
          x: cx,
          y: cy,
          angle: (i / 30) * 360,
        }));
        setBursts(newBursts);

        // Clean up after animation
        setTimeout(() => {
          setBursts([]);
          setTriggered(false);
          setClicks(0);
        }, 3000);
      }
    },
    [clicks, threshold, triggered],
  );

  return (
    <>
      <span
        onClick={handleClick}
        className="cursor-pointer select-none transition-transform active:scale-125"
        role="button"
        tabIndex={0}
        aria-hidden="true"
      >
        {children}
      </span>

      <AnimatePresence>
        {bursts.length > 0 && (
          <div className="pointer-events-none fixed inset-0 z-[100]" aria-hidden="true">
            {bursts.map((b) => {
              const rad = (b.angle * Math.PI) / 180;
              const dist = 100 + Math.random() * 200;
              const endX = Math.cos(rad) * dist;
              const endY = Math.sin(rad) * dist - 150; // bias upward

              return (
                <motion.span
                  key={b.id}
                  className="absolute text-2xl"
                  style={{ left: b.x, top: b.y }}
                  initial={{ opacity: 1, scale: 0 }}
                  animate={{
                    opacity: [1, 1, 0],
                    scale: [0, 1.5, 0.8],
                    x: endX,
                    y: endY,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                >
                  {b.emoji}
                </motion.span>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
