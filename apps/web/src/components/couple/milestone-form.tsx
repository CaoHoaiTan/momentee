'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMilestoneSchema } from '@momentee/shared';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface MilestoneFormData {
  title: string;
  description?: string;
  date: string;
  icon?: string;
}

interface MilestoneFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MilestoneFormData) => void;
  loading?: boolean;
  initialData?: {
    title: string;
    description: string | null;
    date: string;
    icon: string | null;
  } | null;
}

export function MilestoneForm({
  open,
  onClose,
  onSubmit,
  loading = false,
  initialData = null,
}: MilestoneFormProps) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MilestoneFormData>({
    resolver: zodResolver(createMilestoneSchema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      icon: '',
    },
  });

  useEffect(() => {
    if (open && initialData) {
      reset({
        title: initialData.title,
        description: initialData.description ?? '',
        date: initialData.date,
        icon: initialData.icon ?? '',
      });
    } else if (open) {
      reset({ title: '', description: '', date: '', icon: '' });
    }
  }, [open, initialData, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">
          {isEdit ? 'Edit Milestone' : 'Add Milestone'}
        </h3>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Title
            </label>
            <Input
              {...register('title')}
              placeholder="e.g. First Date"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Date
            </label>
            <Input
              type="date"
              {...register('date')}
            />
            {errors.date && (
              <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="What made this moment special?"
              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)]"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Icon (emoji)
            </label>
            <Input
              {...register('icon')}
              placeholder="e.g. 💕"
            />
            {errors.icon && (
              <p className="mt-1 text-xs text-red-500">{errors.icon.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
            >
              {isEdit ? 'Save Changes' : 'Add Milestone'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
