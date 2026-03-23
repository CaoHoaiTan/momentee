'use client';

import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export function LoveMeter() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div className="fixed left-0 right-0 top-0 z-50 h-1" aria-hidden="true">
      <motion.div
        className="h-full origin-left"
        style={{
          scaleX,
          background: 'linear-gradient(to right, var(--color-coral), var(--color-orange, var(--color-coral)))',
        }}
      />
    </div>
  );
}
