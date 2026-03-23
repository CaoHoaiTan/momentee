'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MediaItem {
  url: string;
  caption: string | null;
}

interface GalleryMasonryProps {
  images: MediaItem[];
  onImageClick: (index: number) => void;
}

export function GalleryMasonry({ images, onImageClick }: GalleryMasonryProps) {
  // Split images into columns for masonry effect
  const cols = 3;
  const columns: MediaItem[][] = Array.from({ length: cols }, () => []);
  images.forEach((img, i) => {
    columns[i % cols].push(img);
  });

  // Track global index for click handler
  const getGlobalIndex = (colIdx: number, rowIdx: number): number => {
    return rowIdx * cols + colIdx;
  };

  return (
    <div className="flex gap-2 sm:gap-3">
      {columns.map((col, colIdx) => (
        <div key={colIdx} className="flex flex-1 flex-col gap-2 sm:gap-3">
          {col.map((img, rowIdx) => {
            const globalIdx = getGlobalIndex(colIdx, rowIdx);
            // Vary aspect ratios for visual interest
            const aspectRatios = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[3/2]'];
            const aspectClass = aspectRatios[(colIdx + rowIdx) % aspectRatios.length];

            return (
              <motion.button
                key={globalIdx}
                onClick={() => onImageClick(globalIdx)}
                className={`group relative ${aspectClass} overflow-hidden rounded-xl`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: globalIdx * 0.05 }}
              >
                <img
                  src={img.url}
                  alt={img.caption ?? ''}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {img.caption && (
                    <p className="absolute bottom-3 left-3 right-3 line-clamp-2 text-xs text-white">
                      {img.caption}
                    </p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
