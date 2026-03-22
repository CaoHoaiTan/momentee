import * as notificationService from '../../services/notification.service.js';
import { requireAuth } from '../../utils/errors.js';
import type { GQLContext } from '../context.js';

export const notificationResolvers = {
  Query: {
    notifications: async (
      _parent: unknown,
      args: { limit?: number; offset?: number; unreadOnly?: boolean },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return notificationService.listByUserId(context.user.userId, {
        limit: args.limit,
        offset: args.offset,
        unreadOnly: args.unreadOnly,
      });
    },

    unreadNotificationCount: async (
      _parent: unknown,
      _args: unknown,
      context: GQLContext,
    ) => {
      requireAuth(context);
      return notificationService.getUnreadCount(context.user.userId);
    },
  },

  Mutation: {
    markNotificationsRead: async (
      _parent: unknown,
      _args: unknown,
      context: GQLContext,
    ) => {
      requireAuth(context);
      return notificationService.markAllRead(context.user.userId);
    },

    markNotificationRead: async (
      _parent: unknown,
      args: { id: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return notificationService.markRead(args.id, context.user.userId);
    },

    deleteNotification: async (
      _parent: unknown,
      args: { id: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return notificationService.remove(args.id, context.user.userId);
    },
  },

  Notification: {
    userId: (parent: { user_id: string }) => parent.user_id,
    coupleId: (parent: { couple_id: string | null }) => parent.couple_id,
    isRead: (parent: { is_read: boolean }) => parent.is_read,
    createdAt: (parent: { created_at: Date }) => parent.created_at,
  },
};
