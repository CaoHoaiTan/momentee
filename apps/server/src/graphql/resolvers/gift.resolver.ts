import * as giftService from '../../services/gift.service.js';
import { requireAuth } from '../../utils/errors.js';
import type { GQLContext } from '../context.js';

function stripNulls(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = v === null ? undefined : v;
  }
  return result;
}

export const giftResolvers = {
  Query: {
    giftAccounts: async (_parent: unknown, args: { coupleId: string }) => {
      return giftService.listByCoupleId(args.coupleId);
    },

    giftAccount: async (_parent: unknown, args: { id: string }) => {
      return giftService.getById(args.id);
    },
  },

  Mutation: {
    createGiftAccount: async (
      _parent: unknown,
      args: { coupleId: string; input: Record<string, unknown> },
      context: GQLContext,
    ) => {
      requireAuth(context);
      const cleaned = stripNulls(args.input) as {
        bankName?: string;
        accountNumber?: string;
        accountHolder?: string;
        qrCode?: string;
        note?: string;
      };
      return giftService.create(args.coupleId, context.user.userId, cleaned);
    },

    updateGiftAccount: async (
      _parent: unknown,
      args: { id: string; input: Record<string, unknown> },
      context: GQLContext,
    ) => {
      requireAuth(context);
      const cleaned = stripNulls(args.input) as {
        bankName?: string;
        accountNumber?: string;
        accountHolder?: string;
        qrCode?: string;
        note?: string;
        isActive?: boolean;
      };
      return giftService.update(args.id, context.user.userId, cleaned);
    },

    deleteGiftAccount: async (
      _parent: unknown,
      args: { id: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return giftService.remove(args.id, context.user.userId);
    },
  },

  GiftAccount: {
    coupleId: (parent: { couple_id: string }) => parent.couple_id,
    bankName: (parent: { bank_name: string | null }) => parent.bank_name,
    accountNumber: (parent: { account_number: string | null }) => parent.account_number,
    accountHolder: (parent: { account_holder: string | null }) => parent.account_holder,
    qrCode: (parent: { qr_code: string | null }) => parent.qr_code,
    isActive: (parent: { is_active: boolean }) => parent.is_active,
    createdAt: (parent: { created_at: Date }) => parent.created_at,
  },
};
