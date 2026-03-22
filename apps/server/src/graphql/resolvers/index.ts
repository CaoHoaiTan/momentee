import { authResolvers } from './auth.resolver.js';
import { userResolvers } from './user.resolver.js';
import { coupleResolvers } from './couple.resolver.js';
import { milestoneResolvers } from './milestone.resolver.js';
import { postResolvers } from './post.resolver.js';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...coupleResolvers.Query,
    ...milestoneResolvers.Query,
    ...postResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...coupleResolvers.Mutation,
    ...milestoneResolvers.Mutation,
    ...postResolvers.Mutation,
  },
  DateTime: userResolvers.DateTime,
  Date: coupleResolvers.Date,
  User: userResolvers.User,
  Couple: coupleResolvers.Couple,
  Milestone: milestoneResolvers.Milestone,
  Post: postResolvers.Post,
  Media: postResolvers.Media,
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
