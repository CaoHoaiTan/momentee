'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MediaItem {
  url: string;
  caption: string | null;
}

interface GalleryPolaroidProps {
  images: MediaItem[];
  onImageClick: (index: number) => void;
}

const rotations = [-3, 2, -1.5, 3, -2, 1, -2.5, 1.5, -1, 2.5, -3, 1.8];

export function GalleryPolaroid({ images, onImageClick }: GalleryPolaroidProps) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((img, i) => {
        const rotation = rotations[i % rotations.length];

        return (
          <motion.button
            key={i}
            onClick={() => onImageClick(i)}
            className="group"
            initial={{ opacity: 0, rotate: rotation * 2, scale: 0.8 }}
            whileInView={{ opacity: 1, rotate: rotation, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            whileHover={{ rotate: 0, scale: 1.05, zIndex: 10 }}
          >
            <div
              className="overflow-hidden rounded-sm shadow-md transition-shadow duration-300 group-hover:shadow-xl"
              style={{ background: 'var(--theme-surface, #fff)' }}
            >
              {/* Photo area */}
              <div className="m-2 mb-0 aspect-square overflow-hidden">
                <img
                  src={img.url}
                  alt={img.caption ?? ''}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Caption area (polaroid bottom) */}
              <div className="px-2 py-3 text-center">
                <p
                  className="line-clamp-1 text-xs font-handwriting"
                  style={{ color: 'var(--theme-text-muted)', minHeight: '1.25rem' }}
                >
                  {img.caption ?? ''}
                </p>
              </div>
            </div>

            {/* Tape decoration */}
            <div
              className="absolute -top-2 left-1/2 h-4 w-10 -translate-x-1/2 rounded-sm opacity-40"
              style={{
                background: 'var(--color-coral)',
                transform: `translateX(-50%) rotate(${rotation > 0 ? -2 : 2}deg)`,
              }}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
