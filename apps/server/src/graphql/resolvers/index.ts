import { authResolvers } from './auth.resolver.js';
import { userResolvers } from './user.resolver.js';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
  },
  DateTime: userResolvers.DateTime,
  User: userResolvers.User,
  UserRole: {
    USER: 'user',
    ADMIN: 'admin',
  },
  PlanType: {
    FREE: 'free',
    PREMIUM: 'premium',
    PREMIUM_PLUS: 'premium_plus',
  },
};
