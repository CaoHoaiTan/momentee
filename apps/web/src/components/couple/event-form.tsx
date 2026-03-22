'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface EventFormData {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isPublic?: boolean;
  maxGuests?: number;
}

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => void;
  loading?: boolean;
  initialData?: {
    title: string;
    description: string | null;
    location: string | null;
    startDate: string;
    endDate: string | null;
    isPublic: boolean;
    maxGuests: number | null;
  } | null;
}

export function EventForm({ open, onClose, onSubmit, loading = false, initialData = null }: EventFormProps) {
  const isEdit = !!initialData;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EventFormData>();

  useEffect(() => {
    if (open && initialData) {
      reset({
        title: initialData.title,
        description: initialData.description ?? '',
        location: initialData.location ?? '',
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '',
        isPublic: initialData.isPublic,
        maxGuests: initialData.maxGuests ?? undefined,
      });
    } else if (open) {
      reset({ title: '', description: '', location: '', startDate: '', endDate: '', isPublic: true });
    }
  }, [open, initialData, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">{isEdit ? 'Edit Event' : 'Create Event'}</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
            <Input {...register('title', { required: 'Title is required' })} placeholder="e.g. Our Wedding" />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Start Date & Time</label>
            <Input type="datetime-local" {...register('startDate', { required: 'Start date is required' })} />
            {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">End Date & Time</label>
            <Input type="datetime-local" {...register('endDate')} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
            <Input {...register('location')} placeholder="e.g. Grand Ballroom, Hotel XYZ" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Tell your guests about the event..."
              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Max Guests (optional)</label>
            <Input type="number" {...register('maxGuests', { valueAsNumber: true })} placeholder="Leave empty for unlimited" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" loading={loading}>
              {isEdit ? 'Save Changes' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
