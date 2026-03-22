import { createId } from '@paralleldrive/cuid2';
import { db } from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

interface CreateEventInput {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  coverPhoto?: string;
  isPublic?: boolean;
  maxGuests?: number;
}

interface UpdateEventInput {
  title?: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  coverPhoto?: string;
  isPublic?: boolean;
  maxGuests?: number;
}

interface CreateRsvpInput {
  name: string;
  email?: string;
  status?: 'attending' | 'maybe' | 'declined';
  plusOne?: boolean;
  note?: string;
}

export async function createEvent(coupleId: string, userId: string, input: CreateEventInput) {
  await verifyCoupleOwnership(coupleId, userId);

  const event = await db
    .insertInto('events')
    .values({
      id: createId(),
      couple_id: coupleId,
      title: input.title,
      description: input.description ?? null,
      location: input.location ?? null,
      start_date: input.startDate,
      end_date: input.endDate ?? null,
      cover_photo: input.coverPhoto ?? null,
      is_public: input.isPublic ?? true,
      max_guests: input.maxGuests ?? null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return event;
}

export async function getEventById(id: string) {
  const event = await db
    .selectFrom('events')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!event) throw NotFoundError('Event');
  return event;
}

export async function listEventsByCoupleId(coupleId: string) {
  return db
    .selectFrom('events')
    .selectAll()
    .where('couple_id', '=', coupleId)
    .orderBy('start_date', 'asc')
    .execute();
}

export async function updateEvent(id: string, userId: string, input: UpdateEventInput) {
  const event = await getEventById(id);
  await verifyCoupleOwnership(event.couple_id, userId);

  const updateData: Record<string, unknown> = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.location !== undefined) updateData.location = input.location;
  if (input.startDate !== undefined) updateData.start_date = input.startDate;
  if (input.endDate !== undefined) updateData.end_date = input.endDate;
  if (input.coverPhoto !== undefined) updateData.cover_photo = input.coverPhoto;
  if (input.isPublic !== undefined) updateData.is_public = input.isPublic;
  if (input.maxGuests !== undefined) updateData.max_guests = input.maxGuests;

  if (Object.keys(updateData).length === 0) return event;

  updateData.updated_at = new Date();

  return db
    .updateTable('events')
    .set(updateData)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function removeEvent(id: string, userId: string) {
  const event = await getEventById(id);
  await verifyCoupleOwnership(event.couple_id, userId);
  await db.deleteFrom('events').where('id', '=', id).execute();
  return true;
}

// ─── RSVP ─────────────────────────────────────────────────────────

export async function createRsvp(eventId: string, input: CreateRsvpInput) {
  const event = await getEventById(eventId);

  // Check max guests
  if (event.max_guests) {
    const { count } = await db
      .selectFrom('rsvps')
      .where('event_id', '=', eventId)
      .where('status', '=', 'attending')
      .select(db.fn.countAll<number>().as('count'))
      .executeTakeFirstOrThrow();

    if (Number(count) >= event.max_guests) {
      throw ForbiddenError('This event has reached maximum capacity');
    }
  }

  const rsvp = await db
    .insertInto('rsvps')
    .values({
      id: createId(),
      event_id: eventId,
      name: input.name,
      email: input.email ?? null,
      status: input.status ?? 'attending',
      plus_one: input.plusOne ?? false,
      note: input.note ?? null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return rsvp;
}

export async function listRsvpsByEventId(eventId: string) {
  return db
    .selectFrom('rsvps')
    .selectAll()
    .where('event_id', '=', eventId)
    .orderBy('created_at', 'desc')
    .execute();
}

export async function removeRsvp(id: string, userId: string) {
  const rsvp = await db
    .selectFrom('rsvps')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!rsvp) throw NotFoundError('RSVP');

  const event = await getEventById(rsvp.event_id);
  await verifyCoupleOwnership(event.couple_id, userId);

  await db.deleteFrom('rsvps').where('id', '=', id).execute();
  return true;
}

async function verifyCoupleOwnership(coupleId: string, userId: string) {
  const couple = await db
    .selectFrom('couples')
    .select(['partner1_id', 'partner2_id'])
    .where('id', '=', coupleId)
    .executeTakeFirst();

  if (!couple) throw NotFoundError('Couple');
  if (couple.partner1_id !== userId && couple.partner2_id !== userId) {
    throw ForbiddenError('You are not a member of this couple');
  }
}
