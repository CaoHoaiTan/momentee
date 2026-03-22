'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';

interface RsvpFormProps {
  onSubmit: (data: { name: string; email?: string; status: string; plusOne: boolean; note?: string }) => void;
  loading?: boolean;
}

export function RsvpForm({ onSubmit, loading = false }: RsvpFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('ATTENDING');
  const [plusOne, setPlusOne] = useState(false);
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      email: email.trim() || undefined,
      status,
      plusOne,
      note: note.trim() || undefined,
    });
    setName('');
    setEmail('');
    setStatus('ATTENDING');
    setPlusOne(false);
    setNote('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <h3 className="text-lg font-semibold text-gray-900">RSVP</h3>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          maxLength={100}
          className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)]"
          disabled={loading}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Email (optional)</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)]"
          disabled={loading}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Will you attend?</label>
        <div className="flex gap-2">
          {[
            { value: 'ATTENDING', label: 'Yes!', icon: '🎉' },
            { value: 'MAYBE', label: 'Maybe', icon: '🤔' },
            { value: 'DECLINED', label: "Can't make it", icon: '😢' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
                status === opt.value
                  ? 'bg-[var(--color-coral)] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={plusOne}
          onChange={(e) => setPlusOne(e.target.checked)}
          className="rounded"
          disabled={loading}
        />
        Bringing a plus one
      </label>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Note (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Any dietary preferences or message..."
          className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)]"
          disabled={loading}
        />
      </div>

      <Button type="submit" variant="primary" size="sm" loading={loading} disabled={!name.trim()}>
        Submit RSVP
      </Button>
    </form>
  );
}
