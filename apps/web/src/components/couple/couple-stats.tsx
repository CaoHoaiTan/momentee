'use client';

import React from 'react';

interface CoupleStatsProps {
  daysTogether: number;
  totalWishes: number;
  totalPhotos: number;
  viewCount: number;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
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
