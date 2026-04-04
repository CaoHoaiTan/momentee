'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_NOTIFICATIONS, GET_UNREAD_COUNT } from '../../graphql/queries/notification.queries';
import { MARK_NOTIFICATIONS_READ } from '../../graphql/mutations/notification.mutations';

interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

const TYPE_ICONS: Record<string, string> = {
  new_wish: '💌',
  new_rsvp: '📅',
  new_comment: '💬',
  new_reaction: '❤️',
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: countData } = useQuery<{ unreadNotificationCount: number }>(GET_UNREAD_COUNT, {
    pollInterval: open ? 15000 : 60000,
  });

  const { data: notifData } = useQuery<{ notifications: NotificationData[] }>(GET_NOTIFICATIONS, {
    variables: { limit: 10 },
    skip: !open,
  });

  const [markRead] = useMutation(MARK_NOTIFICATIONS_READ, {
    refetchQueries: [{ query: GET_UNREAD_COUNT }],
    onError: () => {},
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const count = countData?.unreadNotificationCount ?? 0;
  const notifications = notifData?.notifications ?? [];

  const handleOpen = () => {
    setOpen(!open);
    if (!open && count > 0) {
      markRead();
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleOpen} className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-coral)] text-[10px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-100">
          <div className="border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${!n.isRead ? 'bg-[var(--color-coral)]/5' : ''}`}
                >
                  <span className="text-lg">{TYPE_ICONS[n.type] ?? '🔔'}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500">{n.message}</p>
                  </div>
                  <span className="text-xs text-gray-400">{relativeTime(n.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
