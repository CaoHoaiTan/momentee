import { GraphQLScalarType, Kind } from 'graphql';
import {
  createCoupleSchema,
  updateCoupleSchema,
  daysBetween,
} from '@momentee/shared';
import * as coupleService from '../../services/couple.service.js';
import { requireAuth } from '../../utils/errors.js';
import type { GQLContext } from '../context.js';

export const coupleResolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'A date string in YYYY-MM-DD format',
    serialize(value: unknown): string | null {
      if (value === null || value === undefined) return null;
      if (typeof value === 'string') return value;
      if (value instanceof Date) {
        return value.toISOString().split('T')[0];
      }
      throw new Error('Date cannot represent an invalid date value');
    },
    parseValue(value: unknown): string {
      if (typeof value === 'string') return value;
      throw new Error('Date cannot represent non-string type');
    },
    parseLiteral(ast): string {
      if (ast.kind === Kind.STRING) return ast.value;
      throw new Error('Date cannot represent non-string type');
    },
  }),

  Query: {
    couple: async (
      _parent: unknown,
      args: { slug: string },
      _context: GQLContext,
    ) => {
      return coupleService.getBySlug(args.slug);
    },

    coupleById: async (
      _parent: unknown,
      args: { id: string },
      _context: GQLContext,
    ) => {
      return coupleService.getById(args.id);
    },

    myCouple: async (
      _parent: unknown,
      _args: unknown,
      context: GQLContext,
    ) => {
      requireAuth(context);
      return coupleService.getByUserId(context.user.userId);
    },
  },

  Mutation: {
    createCouple: async (
      _parent: unknown,
      args: { input: { displayName: string; anniversary?: string; bio?: string } },
      context: GQLContext,
    ) => {
      requireAuth(context);
      const validated = createCoupleSchema.parse(args.input);
      return coupleService.create(context.user.userId, validated);
    },

    updateCouple: async (
      _parent: unknown,
      args: { id: string; input: Record<string, unknown> },
      context: GQLContext,
    ) => {
      requireAuth(context);
      const validated = updateCoupleSchema.parse(args.input);
      return coupleService.update(args.id, context.user.userId, validated);
    },

    deleteCouple: async (
      _parent: unknown,
      args: { id: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return coupleService.remove(args.id, context.user.userId);
    },

    acceptInvite: async (
      _parent: unknown,
      args: { inviteCode: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return coupleService.acceptInvite(
        context.user.userId,
        args.inviteCode,
      );
    },

    incrementViewCount: async (
      _parent: unknown,
      args: { slug: string },
      _context: GQLContext,
    ) => {
      return coupleService.incrementViews(args.slug);
    },
  },

  Couple: {
    displayName: (parent: { display_name: string }) => parent.display_name,
    coverPhoto: (parent: { cover_photo: string | null }) => parent.cover_photo,
    weddingDate: (parent: { wedding_date: string | null }) =>
      parent.wedding_date,
    customDomain: (parent: { custom_domain: string | null }) =>
      parent.custom_domain,
    isPublic: (parent: { is_public: boolean }) => parent.is_public,
    layoutConfig: (parent: { layout_config: Record<string, unknown> | null }) =>
      parent.layout_config ? JSON.stringify(parent.layout_config) : null,
    viewCount: (parent: { view_count: number }) => parent.view_count,
    createdAt: (parent: { created_at: Date }) => parent.created_at,
    inviteCode: (
      parent: { invite_code: string; partner1_id: string; partner2_id: string | null },
      _args: unknown,
      context: GQLContext,
    ) => {
      // Only show invite code to couple members
      const userId = context.user?.userId;
      if (
        userId &&
        (parent.partner1_id === userId || parent.partner2_id === userId)
      ) {
        return parent.invite_code;
      }
      return null;
    },

    partner1: async (parent: { partner1_id: string }) => {
      return coupleService.getPartner(parent.partner1_id);
    },

    partner2: async (parent: { partner2_id: string | null }) => {
      if (!parent.partner2_id) return null;
      return coupleService.getPartner(parent.partner2_id);
    },

    daysTogether: (parent: { anniversary: string | null }) => {
      if (!parent.anniversary) return 0;
      return daysBetween(parent.anniversary, new Date());
    },

    totalWishes: async (parent: { id: string }) => {
      const stats = await coupleService.getStats(parent.id);
      return stats.totalWishes;
    },

    totalPhotos: async (parent: { id: string }) => {
      const stats = await coupleService.getStats(parent.id);
      return stats.totalPhotos;
    },
  },
};
