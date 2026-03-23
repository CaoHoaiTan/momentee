import * as albumService from '../../services/album.service.js';
import { requireAuth } from '../../utils/errors.js';
import type { GQLContext } from '../context.js';

function stripNulls(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = v === null ? undefined : v;
  }
  return result;
}

export const albumResolvers = {
  Query: {
    albums: async (_parent: unknown, args: { coupleId: string }) => {
      return albumService.listByCoupleId(args.coupleId);
    },

    album: async (_parent: unknown, args: { id: string }) => {
      return albumService.getById(args.id);
    },
  },

  Mutation: {
    createAlbum: async (
      _parent: unknown,
      args: { coupleId: string; input: Record<string, unknown> },
      context: GQLContext,
    ) => {
      requireAuth(context);
      const cleaned = stripNulls(args.input) as {
        title: string;
        description?: string;
        coverPhoto?: string;
      };
      return albumService.create(args.coupleId, context.user.userId, cleaned);
    },

    updateAlbum: async (
      _parent: unknown,
      args: { id: string; input: Record<string, unknown> },
      context: GQLContext,
    ) => {
      requireAuth(context);
      const cleaned = stripNulls(args.input) as {
        title?: string;
        description?: string;
        coverPhoto?: string;
      };
      return albumService.update(args.id, context.user.userId, cleaned);
    },

    deleteAlbum: async (
      _parent: unknown,
      args: { id: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return albumService.remove(args.id, context.user.userId);
    },

    addAlbumPhoto: async (
      _parent: unknown,
      args: { albumId: string; input: Record<string, unknown> },
      context: GQLContext,
    ) => {
      requireAuth(context);
      const cleaned = stripNulls(args.input) as {
        file: string;
        caption?: string;
        sortOrder?: number;
      };
      return albumService.addPhoto(args.albumId, context.user.userId, cleaned);
    },

    removeAlbumPhoto: async (
      _parent: unknown,
      args: { id: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return albumService.removePhoto(args.id, context.user.userId);
    },

    reorderAlbumPhotos: async (
      _parent: unknown,
      args: { albumId: string; photoIds: string[] },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return albumService.reorderPhotos(args.albumId, context.user.userId, args.photoIds);
    },
  },

  Album: {
    coupleId: (parent: { couple_id: string }) => parent.couple_id,
    coverPhoto: (parent: { cover_photo: string | null }) => parent.cover_photo,
    createdAt: (parent: { created_at: Date }) => parent.created_at,
    updatedAt: (parent: { updated_at: Date }) => parent.updated_at,
    photos: (parent: { id: string }) => albumService.getPhotos(parent.id),
    photoCount: (parent: { id: string }) => albumService.getPhotoCount(parent.id),
  },

  AlbumPhoto: {
    albumId: (parent: { album_id: string }) => parent.album_id,
    mediaUrl: (parent: { media_url: string }) => parent.media_url,
    sortOrder: (parent: { sort_order: number }) => parent.sort_order,
    createdAt: (parent: { created_at: Date }) => parent.created_at,
  },
};
