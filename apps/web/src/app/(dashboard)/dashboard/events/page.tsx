'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client/react';
import { useToast } from '../../../../lib/toast-context';
import { useAuth } from '../../../../hooks/useAuth';
import { useCouple } from '../../../../hooks/useCouple';
import { GET_EVENTS } from '../../../../graphql/queries/event.queries';
import { CREATE_EVENT, UPDATE_EVENT, DELETE_EVENT } from '../../../../graphql/mutations/event.mutations';
import { EventForm } from '../../../../components/couple/event-form';
import { ConfirmModal } from '../../../../components/ui/confirm-modal';
import { Button } from '../../../../components/ui/button';
import { LoadingSpinner } from '../../../../components/ui/loading-spinner';

interface EventData {
  id: string;
  coupleId: string;
  title: string;
  description: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  isPublic: boolean;
  maxGuests: number | null;
  rsvps: { id: string; name: string; status: string; plusOne: boolean }[];
  createdAt: string;
}

export default function EventsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { couple, loading: coupleLoading } = useCouple();
  const { showError, showSuccess } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || coupleLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!couple) {
      router.push('/onboarding');
    }
  }, [authLoading, coupleLoading, isAuthenticated, couple, router]);

  const { data, loading: eventsLoading } = useQuery<{ events: EventData[] }>(GET_EVENTS, {
    variables: { coupleId: couple?.id },
    skip: !couple?.id,
  });

  const refetchConfig = { refetchQueries: [{ query: GET_EVENTS, variables: { coupleId: couple?.id } }] };
  const [createEvent, { loading: creating }] = useMutation(CREATE_EVENT, { ...refetchConfig, onError: (error) => showError(error.message), onCompleted: () => showSuccess('Event created!') });
  const [updateEvent, { loading: updating }] = useMutation(UPDATE_EVENT, { ...refetchConfig, onError: (error) => showError(error.message), onCompleted: () => showSuccess('Event updated!') });
  const [deleteEvent, { loading: deleting }] = useMutation(DELETE_EVENT, { ...refetchConfig, onError: (error) => showError(error.message), onCompleted: () => showSuccess('Event deleted') });

  if (authLoading || coupleLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }
  if (!isAuthenticated || !couple) return null;

  const events = data?.events ?? [];

  const handleCreate = async (formData: { title: string; description?: string; location?: string; startDate: string; endDate?: string; maxGuests?: number }) => {
    await createEvent({
      variables: {
        coupleId: couple.id,
        input: {
          title: formData.title,
          description: formData.description || null,
          location: formData.location || null,
          startDate: formData.startDate,
          endDate: formData.endDate || null,
          maxGuests: formData.maxGuests || null,
        },
      },
    });
    setFormOpen(false);
  };

  const handleUpdate = async (formData: { title: string; description?: string; location?: string; startDate: string; endDate?: string; maxGuests?: number }) => {
    if (!editingEvent) return;
    await updateEvent({
      variables: {
        id: editingEvent.id,
        input: {
          title: formData.title,
          description: formData.description || null,
          location: formData.location || null,
          startDate: formData.startDate,
          endDate: formData.endDate || null,
          maxGuests: formData.maxGuests || null,
        },
      },
    });
    setEditingEvent(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteEvent({ variables: { id: deleteId } });
    setDeleteId(null);
  };

  const getAttendeeCount = (event: EventData) => {
    return event.rsvps.filter((r) => r.status === 'ATTENDING' || r.status === 'attending').length;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="mt-1 text-gray-500">Manage your upcoming events and RSVPs.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}>Create Event</Button>
      </div>

      {eventsLoading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-100">
          <span className="text-5xl">📅</span>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No events yet</h3>
          <p className="mt-1 text-sm text-gray-500">Create your first event to start collecting RSVPs</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={() => setFormOpen(true)}>Create Event</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md">
              <div className="p-5">
                <h3 className="truncate text-lg font-semibold text-gray-900">{event.title}</h3>
                {event.description && <p className="mt-1 line-clamp-2 text-sm text-gray-500">{event.description}</p>}
                <div className="mt-3 space-y-1 text-sm text-gray-500">
                  <p className="truncate">📅 {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  {event.location && <p className="truncate">📍 {event.location}</p>}
                  <p>👥 {getAttendeeCount(event)} attending{event.maxGuests ? ` / ${event.maxGuests} max` : ''}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingEvent(event)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(event.id)} className="!text-red-500">Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EventForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} loading={creating} />
      <EventForm open={!!editingEvent} onClose={() => setEditingEvent(null)} onSubmit={handleUpdate} loading={updating} initialData={editingEvent} />

      <ConfirmModal
        open={!!deleteId}
        title="Delete Event"
        message="Are you sure you want to delete this event? All RSVPs will also be deleted."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
