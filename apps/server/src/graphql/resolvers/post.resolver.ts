import * as mediaService from '../../services/media.service.js';
import { uploadImage } from '../../utils/cloudinary.js';
import { requireAuth } from '../../utils/errors.js';
import type { GQLContext } from '../context.js';

export const postResolvers = {
  Query: {
    posts: async (
      _parent: unknown,
      args: { coupleId: string; limit?: number; offset?: number },
      context: GQLContext,
    ) => {
      return mediaService.listPostsByCouple(
        args.coupleId,
        args.limit ?? 20,
        args.offset ?? 0,
        context.user?.userId,
      );
    },

    post: async (
      _parent: unknown,
      args: { id: string },
      _context: GQLContext,
    ) => {
      return mediaService.getPostById(args.id);
    },
  },

  Mutation: {
    createPost: async (
      _parent: unknown,
      args: {
        coupleId: string;
        input: {
          caption?: string;
          type: 'photo' | 'video' | 'story' | 'letter' | 'milestone';
          visibility?: 'public' | 'friends_only' | 'private';
          media: Array<{ file: string; type: 'image' | 'video' | 'gif' }>;
        };
      },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return mediaService.createPost(
        args.coupleId,
        context.user.userId,
        args.input,
      );
    },

    deletePost: async (
      _parent: unknown,
      args: { id: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return mediaService.deletePost(args.id, context.user.userId);
    },

    uploadImage: async (
      _parent: unknown,
      args: { file: string; folder: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      const result = await uploadImage(args.file, args.folder);
      return {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
      };
    },
  },

  Post: {
    coupleId: (parent: { couple_id: string }) => parent.couple_id,
    isPinned: (parent: { is_pinned: boolean }) => parent.is_pinned,
    createdAt: (parent: { created_at: Date }) => parent.created_at,
    updatedAt: (parent: { updated_at: Date }) => parent.updated_at,
  },

  Media: {
    postId: (parent: { post_id: string }) => parent.post_id,
    blurHash: (parent: { blur_hash: string | null }) => parent.blur_hash,
    sortOrder: (parent: { sort_order: number }) => parent.sort_order,
  },
};
