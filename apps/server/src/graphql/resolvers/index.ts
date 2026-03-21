import { authResolvers } from './auth.resolver.js';
import { userResolvers } from './user.resolver.js';
import { coupleResolvers } from './couple.resolver.js';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...coupleResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...coupleResolvers.Mutation,
  },
  DateTime: userResolvers.DateTime,
  Date: coupleResolvers.Date,
  User: userResolvers.User,
  Couple: coupleResolvers.Couple,
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
