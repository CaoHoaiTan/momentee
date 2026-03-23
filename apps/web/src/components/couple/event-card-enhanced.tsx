'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';

interface EventData {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  isPublic: boolean;
  maxGuests: number | null;
  rsvps: { id: string; name: string; status: string; plusOne: boolean }[];
}

interface EventCardEnhancedProps {
  event: EventData;
  children: React.ReactNode; // RSVP form slot
}

function getTimeUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return 'Event has passed';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  if (days > 30) return `in ${Math.floor(days / 30)} months`;
  if (days > 0) return `in ${days}d ${hours}h`;
  return `in ${hours}h`;
}

function buildCalendarUrl(event: EventData): string {
  const start = new Date(event.startDate).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const end = event.endDate
    ? new Date(event.endDate).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    : new Date(new Date(event.startDate).getTime() + 2 * 60 * 60 * 1000)
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description ?? '',
    location: event.location ?? '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function EventCardEnhanced({ event, children }: EventCardEnhancedProps) {
  const attending = event.rsvps.filter(
    (r) => r.status === 'ATTENDING' || r.status === 'attending',
  ).length;
  const timeLabel = getTimeUntil(event.startDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>
              {event.title}
            </h3>
            {event.description && (
              <p className="mt-1 text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                {event.description}
              </p>
            )}
          </div>

          {/* Countdown badge */}
          <span
            className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: 'var(--color-coral)',
              color: '#fff',
              opacity: new Date(event.startDate).getTime() < Date.now() ? 0.5 : 1,
            }}
          >
            {timeLabel}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm" style={{ color: 'var(--theme-text-muted)' }}>
          <span>
            {new Date(event.startDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {event.location && <span>{event.location}</span>}
          <span>
            {attending} attending
            {event.maxGuests ? ` / ${event.maxGuests} max` : ''}
          </span>
        </div>

        {/* Action row */}
        <div className="mt-3 flex gap-2">
          <a
            href={buildCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
            style={{
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text)',
            }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Add to Calendar
          </a>
        </div>

        <div className="mt-4 border-t pt-4" style={{ borderColor: 'var(--theme-border)' }}>
          {children}
        </div>
      </Card>
    </motion.div>
  );
}
