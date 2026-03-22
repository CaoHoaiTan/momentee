import {
  createMilestoneSchema,
  updateMilestoneSchema,
} from '@momentee/shared';
import * as milestoneService from '../../services/milestone.service.js';
import { requireAuth } from '../../utils/errors.js';
import type { GQLContext } from '../context.js';

// GraphQL sends null for absent optional fields; Zod .optional() only accepts undefined
function stripNulls(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = v === null ? undefined : v;
  }
  return result;
}

export const milestoneResolvers = {
  Query: {
    milestones: async (
      _parent: unknown,
      args: { coupleId: string },
      _context: GQLContext,
    ) => {
      return milestoneService.listByCoupleId(args.coupleId);
    },

    milestone: async (
      _parent: unknown,
      args: { id: string },
      _context: GQLContext,
    ) => {
      return milestoneService.getById(args.id);
    },
  },

  Mutation: {
    createMilestone: async (
      _parent: unknown,
      args: { coupleId: string; input: Record<string, unknown> },
      context: GQLContext,
    ) => {
      requireAuth(context);
      const validated = createMilestoneSchema.parse(stripNulls(args.input));
      return milestoneService.create(
        args.coupleId,
        context.user.userId,
        validated,
      );
    },

    updateMilestone: async (
      _parent: unknown,
      args: { id: string; input: Record<string, unknown> },
      context: GQLContext,
    ) => {
      requireAuth(context);
      const validated = updateMilestoneSchema.parse(stripNulls(args.input));
      return milestoneService.update(
        args.id,
        context.user.userId,
        validated,
      );
    },

    deleteMilestone: async (
      _parent: unknown,
      args: { id: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return milestoneService.remove(args.id, context.user.userId);
    },

    reorderMilestones: async (
      _parent: unknown,
      args: { coupleId: string; orderedIds: string[] },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return milestoneService.reorder(
        args.coupleId,
        context.user.userId,
        args.orderedIds,
      );
    },
  },

  Milestone: {
    coupleId: (parent: { couple_id: string }) => parent.couple_id,
    sortOrder: (parent: { sort_order: number }) => parent.sort_order,
    createdAt: (parent: { created_at: Date }) => parent.created_at,
  },
};
