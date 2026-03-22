import * as adminService from '../../services/admin.service.js';
import { requireAuth } from '../../utils/errors.js';
import type { GQLContext } from '../context.js';

export const adminResolvers = {
  Query: {
    adminStats: async (_parent: unknown, _args: unknown, context: GQLContext) => {
      requireAuth(context);
      await adminService.verifyAdmin(context.user.userId);
      return adminService.getStats();
    },

    adminUsers: async (
      _parent: unknown,
      args: { limit?: number; offset?: number; search?: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      await adminService.verifyAdmin(context.user.userId);
      return adminService.listUsers(args.limit, args.offset, args.search);
    },

    adminCouples: async (
      _parent: unknown,
      args: { limit?: number; offset?: number; search?: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      await adminService.verifyAdmin(context.user.userId);
      return adminService.listCouples(args.limit, args.offset, args.search);
    },
  },

  Mutation: {
    adminDeleteUser: async (_parent: unknown, args: { id: string }, context: GQLContext) => {
      requireAuth(context);
      await adminService.verifyAdmin(context.user.userId);
      return adminService.deleteUser(args.id);
    },

    adminDeleteCouple: async (_parent: unknown, args: { id: string }, context: GQLContext) => {
      requireAuth(context);
      await adminService.verifyAdmin(context.user.userId);
      return adminService.deleteCouple(args.id);
    },

    adminUpdateUserRole: async (
      _parent: unknown,
      args: { id: string; role: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      await adminService.verifyAdmin(context.user.userId);
      return adminService.updateUserRole(args.id, args.role as 'user' | 'admin');
    },
  },

  AdminCouple: {
    displayName: (parent: { display_name: string }) => parent.display_name,
    isPublic: (parent: { is_public: boolean }) => parent.is_public,
    viewCount: (parent: { view_count: number }) => parent.view_count,
    partner1Name: (parent: { partner1_name: string }) => parent.partner1_name,
    partner1Email: (parent: { partner1_email: string }) => parent.partner1_email,
    createdAt: (parent: { created_at: Date }) => parent.created_at,
  },
};
