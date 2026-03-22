import { createCommentSchema } from '@momentee/shared';
import * as reactionService from '../../services/reaction.service.js';
import * as commentService from '../../services/comment.service.js';
import { requireAuth } from '../../utils/errors.js';
import type { GQLContext } from '../context.js';

export const reactionResolvers = {
  Query: {
    reactions: async (_parent: unknown, args: { postId: string }) => {
      return reactionService.listByPostId(args.postId);
    },

    reactionGroups: async (
      _parent: unknown,
      args: { postId: string },
      context: GQLContext,
    ) => {
      return reactionService.getGroupsByPostId(args.postId, context.user?.userId);
    },

    comments: async (
      _parent: unknown,
      args: { postId: string; limit?: number; offset?: number },
    ) => {
      return commentService.listByPostId(args.postId, args.limit, args.offset);
    },
  },

  Mutation: {
    toggleReaction: async (
      _parent: unknown,
      args: { postId: string; emoji: string },
      context: GQLContext,
    ) => {
      return reactionService.toggle({
        postId: args.postId,
        emoji: args.emoji,
        userId: context.user?.userId,
      });
    },

    createComment: async (
      _parent: unknown,
      args: { input: { postId: string; content: string; guestName?: string } },
      context: GQLContext,
    ) => {
      const validated = createCommentSchema.parse({
        content: args.input.content,
        guestName: args.input.guestName,
      });
      return commentService.create({
        postId: args.input.postId,
        content: validated.content,
        userId: context.user?.userId,
        guestName: validated.guestName,
      });
    },

    deleteComment: async (
      _parent: unknown,
      args: { id: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return commentService.remove(args.id, context.user.userId);
    },
  },

  Reaction: {
    postId: (parent: { post_id: string }) => parent.post_id,
    userId: (parent: { user_id: string | null }) => parent.user_id,
    guestName: (parent: { guest_name: string | null }) => parent.guest_name,
    createdAt: (parent: { created_at: Date }) => parent.created_at,
  },

  Comment: {
    postId: (parent: { post_id: string }) => parent.post_id,
    userId: (parent: { user_id: string | null }) => parent.user_id,
    guestName: (parent: { guest_name: string | null }) => parent.guest_name,
    createdAt: (parent: { created_at: Date }) => parent.created_at,
  },
};
