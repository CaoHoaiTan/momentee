import { createId } from '@paralleldrive/cuid2';
import { db } from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import {
  uploadImage,
  uploadVideo,
  uploadAvatar,
  deleteAsset,
  type UploadResult,
} from '../utils/cloudinary.js';

// ─── Upload helpers ──────────────────────────────────────────────────

export async function uploadPostMedia(
  file: string,
  type: 'image' | 'video' | 'gif',
): Promise<UploadResult> {
  if (type === 'video') {
    return uploadVideo(file, 'posts');
  }
  return uploadImage(file, 'posts');
}

export async function uploadUserAvatar(file: string): Promise<UploadResult> {
  return uploadAvatar(file);
}

export async function uploadCoverPhoto(file: string): Promise<UploadResult> {
  return uploadImage(file, 'covers');
}

// ─── Post CRUD ───────────────────────────────────────────────────────

interface CreatePostInput {
  caption?: string;
  type: 'photo' | 'video' | 'story' | 'letter' | 'milestone';
  visibility?: 'public' | 'friends_only' | 'private';
  media: Array<{
    file: string; // base64 or URL
    type: 'image' | 'video' | 'gif';
  }>;
}

export async function createPost(
  coupleId: string,
  userId: string,
  input: CreatePostInput,
) {
  await verifyCoupleOwnership(coupleId, userId);

  // Upload all media to Cloudinary
  const uploaded = await Promise.all(
    input.media.map((m) => uploadPostMedia(m.file, m.type)),
  );

  // Create post + media in a transaction
  return db.transaction().execute(async (trx) => {
    const postId = createId();
    const post = await trx
      .insertInto('posts')
      .values({
        id: postId,
        couple_id: coupleId,
        caption: input.caption ?? null,
        type: input.type,
        visibility: input.visibility ?? 'public',
        is_pinned: false,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    const mediaRecords = await Promise.all(
      uploaded.map(async (upload, index) => {
        return trx
          .insertInto('media')
          .values({
            id: createId(),
            post_id: postId,
            url: upload.url,
            thumbnail: upload.thumbnail,
            blur_hash: null,
            type: input.media[index].type,
            width: upload.width,
            height: upload.height,
            sort_order: index,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
      }),
    );

    return { ...post, media: mediaRecords };
  });
}

export async function getPostById(id: string) {
  const post = await db
    .selectFrom('posts')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!post) throw NotFoundError('Post');

  const media = await db
    .selectFrom('media')
    .selectAll()
    .where('post_id', '=', id)
    .orderBy('sort_order', 'asc')
    .execute();

  return { ...post, media };
}

export async function listPostsByCouple(
  coupleId: string,
  limit = 20,
  offset = 0,
) {
  const posts = await db
    .selectFrom('posts')
    .selectAll()
    .where('couple_id', '=', coupleId)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset)
    .execute();

  // Fetch media for all posts in one query
  if (posts.length === 0) return [];

  const postIds = posts.map((p) => p.id);
  const allMedia = await db
    .selectFrom('media')
    .selectAll()
    .where('post_id', 'in', postIds)
    .orderBy('sort_order', 'asc')
    .execute();

  const mediaByPost = new Map<string, typeof allMedia>();
  for (const m of allMedia) {
    const arr = mediaByPost.get(m.post_id) ?? [];
    arr.push(m);
    mediaByPost.set(m.post_id, arr);
  }

  return posts.map((post) => ({
    ...post,
    media: mediaByPost.get(post.id) ?? [],
  }));
}

export async function deletePost(id: string, userId: string) {
  const post = await getPostById(id);
  await verifyCoupleOwnership(post.couple_id, userId);

  // Delete media from Cloudinary
  for (const m of post.media) {
    const publicId = extractPublicId(m.url);
    if (publicId) {
      await deleteAsset(publicId, m.type === 'video' ? 'video' : 'image').catch(
        () => {}, // best-effort cleanup
      );
    }
  }

  await db.deleteFrom('posts').where('id', '=', id).execute();
  return true;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function extractPublicId(url: string): string | null {
  // Cloudinary URLs: .../upload/v123456/momentee/posts/abc.jpg
  const match = url.match(/\/upload\/v\d+\/(.+)\.\w+$/);
  return match?.[1] ?? null;
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
