import { authResolvers } from './auth.resolver.js';
import { userResolvers } from './user.resolver.js';
import { coupleResolvers } from './couple.resolver.js';
import { milestoneResolvers } from './milestone.resolver.js';
import { postResolvers } from './post.resolver.js';
import { wishResolvers } from './wish.resolver.js';
import { reactionResolvers } from './reaction.resolver.js';
import { eventResolvers } from './event.resolver.js';
import { quizResolvers } from './quiz.resolver.js';
import { giftResolvers } from './gift.resolver.js';
import { notificationResolvers } from './notification.resolver.js';
import { billingResolvers } from './billing.resolver.js';
import { exploreResolvers } from './explore.resolver.js';
import { adminResolvers } from './admin.resolver.js';
import { albumResolvers } from './album.resolver.js';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...coupleResolvers.Query,
    ...milestoneResolvers.Query,
    ...postResolvers.Query,
    ...wishResolvers.Query,
    ...reactionResolvers.Query,
    ...eventResolvers.Query,
    ...quizResolvers.Query,
    ...giftResolvers.Query,
    ...notificationResolvers.Query,
    ...billingResolvers.Query,
    ...exploreResolvers.Query,
    ...adminResolvers.Query,
    ...albumResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...coupleResolvers.Mutation,
    ...milestoneResolvers.Mutation,
    ...postResolvers.Mutation,
    ...wishResolvers.Mutation,
    ...reactionResolvers.Mutation,
    ...eventResolvers.Mutation,
    ...quizResolvers.Mutation,
    ...giftResolvers.Mutation,
    ...notificationResolvers.Mutation,
    ...billingResolvers.Mutation,
    ...adminResolvers.Mutation,
    ...albumResolvers.Mutation,
  },
  DateTime: userResolvers.DateTime,
  Date: coupleResolvers.Date,
  User: userResolvers.User,
  Couple: coupleResolvers.Couple,
  Milestone: milestoneResolvers.Milestone,
  Post: postResolvers.Post,
  Media: postResolvers.Media,
  Wish: wishResolvers.Wish,
  Reaction: reactionResolvers.Reaction,
  Comment: reactionResolvers.Comment,
  Event: eventResolvers.Event,
  Rsvp: eventResolvers.Rsvp,
  RsvpStatus: eventResolvers.RsvpStatus,
  Quiz: quizResolvers.Quiz,
  QuizQuestion: quizResolvers.QuizQuestion,
  QuizResponse: quizResolvers.QuizResponse,
  GiftAccount: giftResolvers.GiftAccount,
  Album: albumResolvers.Album,
  AlbumPhoto: albumResolvers.AlbumPhoto,
  Notification: notificationResolvers.Notification,
  Subscription: billingResolvers.Subscription,
  SubscriptionStatus: billingResolvers.SubscriptionStatus,
  AdminCouple: adminResolvers.AdminCouple,
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
