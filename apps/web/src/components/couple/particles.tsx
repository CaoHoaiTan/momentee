'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type ParticleType = 'hearts' | 'stars' | 'shapes' | 'none';

interface ParticlesProps {
  type: ParticleType;
  count?: number;
}

interface Particle {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  emoji: string;
}

const emojiSets: Record<Exclude<ParticleType, 'none'>, string[]> = {
  hearts: ['💕', '💖', '💗', '❤️', '🩷'],
  stars: ['✨', '⭐', '🌟', '💫'],
  shapes: ['◆', '●', '▲', '■', '◇'],
};

function generateParticles(type: Exclude<ParticleType, 'none'>, count: number): Particle[] {
  const emojis = emojiSets[type];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: type === 'shapes' ? 10 + Math.random() * 14 : 14 + Math.random() * 10,
    delay: Math.random() * 8,
    duration: 10 + Math.random() * 15,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
  }));
}

export function Particles({ type, count = 15 }: ParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (type === 'none') return;
    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    // Reduce count on mobile
    const isMobile = window.innerWidth < 768;
    setParticles(generateParticles(type, isMobile ? Math.floor(count / 2) : count));
  }, [type, count]);

  if (type === 'none' || particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute select-none opacity-20"
          style={{
            left: `${p.x}%`,
            fontSize: `${p.size}px`,
            top: '-5%',
          }}
          animate={{
            y: ['0vh', '105vh'],
            x: [0, Math.sin(p.id) * 30],
            rotate: [0, 360],
            opacity: [0, 0.25, 0.15, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}
