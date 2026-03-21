import { registerSchema, loginSchema } from '@momentee/shared';
import * as authService from '../../services/auth.service.js';
import type { GQLContext } from '../context.js';

export const authResolvers = {
  Mutation: {
    register: async (
      _parent: unknown,
      args: { input: { email: string; password: string; name: string } },
      _context: GQLContext,
    ) => {
      const validated = registerSchema.parse(args.input);
      return authService.register(validated);
    },

    login: async (
      _parent: unknown,
      args: { input: { email: string; password: string } },
      _context: GQLContext,
    ) => {
      const validated = loginSchema.parse(args.input);
      return authService.login(validated);
    },

    refreshToken: async (_parent: unknown, args: { token: string }, _context: GQLContext) => {
      return authService.refreshToken(args.token);
    },

    logout: async (_parent: unknown, _args: unknown, _context: GQLContext) => {
      return true;
    },
  },
};
