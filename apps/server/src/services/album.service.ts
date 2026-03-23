import { createId } from '@paralleldrive/cuid2';
import { db } from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { uploadImage } from '../utils/cloudinary.js';
import { checkPlanLimit, enforcePlanLimit } from './billing.service.js';

interface CreateAlbumInput {
  title: string;
  description?: string;
  coverPhoto?: string;
}

interface UpdateAlbumInput {
  title?: string;
  description?: string;
  coverPhoto?: string;
}

interface AddPhotoInput {
  file: string;
  caption?: string;
  sortOrder?: number;
}

async function resolveImage(image: string | undefined | null, folder: string): Promise<string | null> {
  if (!image) return null;
  if (image.startsWith('data:')) {
    const result = await uploadImage(image, folder);
    return result.url;
  }
  return image;
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

async function verifyAlbumOwnership(albumId: string, userId: string) {
  const album = await db
    .selectFrom('albums')
    .select('couple_id')
    .where('id', '=', albumId)
    .executeTakeFirst();

  if (!album) throw NotFoundError('Album');
  await verifyCoupleOwnership(album.couple_id, userId);
  return album;
}

export async function create(coupleId: string, userId: string, input: CreateAlbumInput) {
  await verifyCoupleOwnership(coupleId, userId);

  const planCheck = await checkPlanLimit(coupleId, 'albums');
  enforcePlanLimit(planCheck, 'albums');

  const coverUrl = await resolveImage(input.coverPhoto, 'albums');

  const album = await db
    .insertInto('albums')
    .values({
      id: createId(),
      couple_id: coupleId,
      title: input.title,
      description: input.description ?? null,
      cover_photo: coverUrl,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return album;
}

export async function getById(id: string) {
  const album = await db
    .selectFrom('albums')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!album) throw NotFoundError('Album');
  return album;
}

export async function listByCoupleId(coupleId: string) {
  return db
    .selectFrom('albums')
    .selectAll()
    .where('couple_id', '=', coupleId)
    .orderBy('created_at', 'desc')
    .execute();
}

export async function update(id: string, userId: string, input: UpdateAlbumInput) {
  const album = await getById(id);
  await verifyCoupleOwnership(album.couple_id, userId);

  const updateData: Record<string, unknown> = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.coverPhoto !== undefined) updateData.cover_photo = await resolveImage(input.coverPhoto, 'albums');

  if (Object.keys(updateData).length === 0) return album;

  return db
    .updateTable('albums')
    .set(updateData)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function remove(id: string, userId: string) {
  const album = await getById(id);
  await verifyCoupleOwnership(album.couple_id, userId);
  await db.deleteFrom('albums').where('id', '=', id).execute();
  return true;
}

export async function getPhotos(albumId: string) {
  return db
    .selectFrom('album_photos')
    .selectAll()
    .where('album_id', '=', albumId)
    .orderBy('sort_order', 'asc')
    .orderBy('created_at', 'asc')
    .execute();
}

export async function getPhotoCount(albumId: string): Promise<number> {
  const result = await db
    .selectFrom('album_photos')
    .where('album_id', '=', albumId)
    .select(db.fn.countAll<number>().as('count'))
    .executeTakeFirstOrThrow();
  return Number(result.count);
}

export async function addPhoto(albumId: string, userId: string, input: AddPhotoInput) {
  await verifyAlbumOwnership(albumId, userId);

  const imageUrl = await resolveImage(input.file, 'albums');
  if (!imageUrl) throw new Error('File is required');

  const photo = await db
    .insertInto('album_photos')
    .values({
      id: createId(),
      album_id: albumId,
      media_url: imageUrl,
      caption: input.caption ?? null,
      sort_order: input.sortOrder ?? 0,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return photo;
}

export async function removePhoto(photoId: string, userId: string) {
  const photo = await db
    .selectFrom('album_photos')
    .selectAll()
    .where('id', '=', photoId)
    .executeTakeFirst();

  if (!photo) throw NotFoundError('Album Photo');
  await verifyAlbumOwnership(photo.album_id, userId);

  await db.deleteFrom('album_photos').where('id', '=', photoId).execute();
  return true;
}

export async function reorderPhotos(albumId: string, userId: string, photoIds: string[]) {
  await verifyAlbumOwnership(albumId, userId);

  for (let i = 0; i < photoIds.length; i++) {
    await db
      .updateTable('album_photos')
      .set({ sort_order: i })
      .where('id', '=', photoIds[i])
      .where('album_id', '=', albumId)
      .execute();
  }

  return true;
}
