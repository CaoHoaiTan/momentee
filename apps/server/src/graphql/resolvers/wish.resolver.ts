import { createWishSchema } from '@momentee/shared';
import * as wishService from '../../services/wish.service.js';
import { requireAuth } from '../../utils/errors.js';
import type { GQLContext } from '../context.js';

function stripNulls(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = v === null ? undefined : v;
  }
  return result;
}

export const wishResolvers = {
  Query: {
    wishes: async (
      _parent: unknown,
      args: { coupleId: string; limit?: number; offset?: number },
    ) => {
      return wishService.listByCoupleId(args.coupleId, args.limit, args.offset);
    },

    wish: async (_parent: unknown, args: { id: string }) => {
      return wishService.getById(args.id);
    },
  },

  Mutation: {
    createWish: async (
      _parent: unknown,
      args: { coupleId: string; input: Record<string, unknown> },
    ) => {
      // No auth required — guests can leave wishes
      const validated = createWishSchema.parse(stripNulls(args.input));
      return wishService.create(args.coupleId, validated);
    },

    deleteWish: async (
      _parent: unknown,
      args: { id: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return wishService.remove(args.id, context.user.userId);
    },

    approveWish: async (
      _parent: unknown,
      args: { id: string; approved: boolean },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return wishService.approve(args.id, context.user.userId, args.approved);
    },
  },

  Wish: {
    coupleId: (parent: { couple_id: string }) => parent.couple_id,
    authorName: (parent: { author_name: string }) => parent.author_name,
    authorAvatar: (parent: { author_avatar: string | null }) => parent.author_avatar,
    isAnonymous: (parent: { is_anonymous: boolean }) => parent.is_anonymous,
    isApproved: (parent: { is_approved: boolean }) => parent.is_approved,
    createdAt: (parent: { created_at: Date }) => parent.created_at,
  },
};
