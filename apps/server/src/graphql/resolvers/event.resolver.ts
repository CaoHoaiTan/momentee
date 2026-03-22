import * as eventService from '../../services/event.service.js';
import { requireAuth } from '../../utils/errors.js';
import type { GQLContext } from '../context.js';

function stripNulls(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = v === null ? undefined : v;
  }
  return result;
}

export const eventResolvers = {
  Query: {
    events: async (_parent: unknown, args: { coupleId: string }) => {
      return eventService.listEventsByCoupleId(args.coupleId);
    },

    event: async (_parent: unknown, args: { id: string }) => {
      return eventService.getEventById(args.id);
    },

    rsvps: async (_parent: unknown, args: { eventId: string }) => {
      return eventService.listRsvpsByEventId(args.eventId);
    },
  },

  Mutation: {
    createEvent: async (
      _parent: unknown,
      args: { coupleId: string; input: Record<string, unknown> },
      context: GQLContext,
    ) => {
      requireAuth(context);
      const cleaned = stripNulls(args.input) as {
        title: string;
        description?: string;
        location?: string;
        startDate: string;
        endDate?: string;
        coverPhoto?: string;
        isPublic?: boolean;
        maxGuests?: number;
      };
      return eventService.createEvent(args.coupleId, context.user.userId, cleaned);
    },

    updateEvent: async (
      _parent: unknown,
      args: { id: string; input: Record<string, unknown> },
      context: GQLContext,
    ) => {
      requireAuth(context);
      const cleaned = stripNulls(args.input) as {
        title?: string;
        description?: string;
        location?: string;
        startDate?: string;
        endDate?: string;
        coverPhoto?: string;
        isPublic?: boolean;
        maxGuests?: number;
      };
      return eventService.updateEvent(args.id, context.user.userId, cleaned);
    },

    deleteEvent: async (
      _parent: unknown,
      args: { id: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return eventService.removeEvent(args.id, context.user.userId);
    },

    createRsvp: async (
      _parent: unknown,
      args: { eventId: string; input: Record<string, unknown> },
    ) => {
      // No auth required — guests can RSVP
      const cleaned = stripNulls(args.input) as {
        name: string;
        email?: string;
        status?: 'attending' | 'maybe' | 'declined';
        plusOne?: boolean;
        note?: string;
      };
      return eventService.createRsvp(args.eventId, cleaned);
    },

    deleteRsvp: async (
      _parent: unknown,
      args: { id: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return eventService.removeRsvp(args.id, context.user.userId);
    },
  },

  Event: {
    coupleId: (parent: { couple_id: string }) => parent.couple_id,
    startDate: (parent: { start_date: Date }) => parent.start_date,
    endDate: (parent: { end_date: Date | null }) => parent.end_date,
    coverPhoto: (parent: { cover_photo: string | null }) => parent.cover_photo,
    isPublic: (parent: { is_public: boolean }) => parent.is_public,
    maxGuests: (parent: { max_guests: number | null }) => parent.max_guests,
    createdAt: (parent: { created_at: Date }) => parent.created_at,
    updatedAt: (parent: { updated_at: Date }) => parent.updated_at,
    rsvps: async (parent: { id: string }) => {
      return eventService.listRsvpsByEventId(parent.id);
    },
  },

  Rsvp: {
    eventId: (parent: { event_id: string }) => parent.event_id,
    plusOne: (parent: { plus_one: boolean }) => parent.plus_one,
    createdAt: (parent: { created_at: Date }) => parent.created_at,
  },

  RsvpStatus: {
    ATTENDING: 'attending',
    MAYBE: 'maybe',
    DECLINED: 'declined',
  },
};
