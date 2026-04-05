import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '@momentee/shared';
import * as authService from '../../services/auth.service.js';
import { requireAuth } from '../../utils/errors.js';
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

    logout: async (_parent: unknown, _args: unknown, context: GQLContext) => {
      if (context.user) {
        await authService.logout(context.user.userId);
      }
      return true;
    },

    forgotPassword: async (_parent: unknown, args: { email: string }) => {
      const { email } = forgotPasswordSchema.parse({ email: args.email });
      return authService.requestPasswordReset(email);
    },

    resetPassword: async (_parent: unknown, args: { token: string; password: string }) => {
      const validated = resetPasswordSchema.parse(args);
      return authService.resetPassword(validated.token, validated.password);
    },

    googleLogin: async (_parent: unknown, args: { idToken: string }) => {
      return authService.googleLogin(args.idToken);
    },

    requestEmailVerification: async (_parent: unknown, _args: unknown, context: GQLContext) => {
      requireAuth(context);
      return authService.requestEmailVerification(context.user.userId);
    },

    verifyEmail: async (_parent: unknown, args: { token: string }) => {
      return authService.verifyEmail(args.token);
    },
  },
};
