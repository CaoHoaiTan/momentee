import * as quizService from '../../services/quiz.service.js';
import { requireAuth } from '../../utils/errors.js';
import { checkRateLimit } from '../../utils/rate-limiter.js';
import type { GQLContext } from '../context.js';

export const quizResolvers = {
  Query: {
    quizzes: async (_parent: unknown, args: { coupleId: string }) => {
      return quizService.listQuizzesByCoupleId(args.coupleId);
    },

    quiz: async (_parent: unknown, args: { id: string }) => {
      return quizService.getQuizById(args.id);
    },

    quizLeaderboard: async (_parent: unknown, args: { quizId: string }) => {
      return quizService.getLeaderboard(args.quizId);
    },
  },

  Mutation: {
    createQuiz: async (
      _parent: unknown,
      args: { coupleId: string; input: { title: string; description?: string; questions: Array<{ question: string; options: string[]; correctAnswer: number }> } },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return quizService.createQuiz(args.coupleId, context.user.userId, args.input);
    },

    deleteQuiz: async (
      _parent: unknown,
      args: { id: string },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return quizService.removeQuiz(args.id, context.user.userId);
    },

    submitQuiz: async (
      _parent: unknown,
      args: { quizId: string; input: { respondentName: string; answers: number[] } },
      context: GQLContext,
    ) => {
      // No auth required — guests can take quizzes
      const ip = context.req.ip ?? context.req.socket.remoteAddress ?? 'unknown';
      checkRateLimit(`${ip}:${args.quizId}`, 'submitQuiz', 5, 60 * 60 * 1000); // 5 per hour per IP per quiz
      return quizService.submitQuiz(args.quizId, args.input);
    },

    reorderQuizzes: async (
      _parent: unknown,
      args: { coupleId: string; quizIds: string[] },
      context: GQLContext,
    ) => {
      requireAuth(context);
      return quizService.reorderQuizzes(args.coupleId, context.user.userId, args.quizIds);
    },
  },

  Quiz: {
    coupleId: (parent: { couple_id: string }) => parent.couple_id,
    isActive: (parent: { is_active: boolean }) => parent.is_active,
    sortOrder: (parent: { sort_order: number }) => parent.sort_order,
    createdAt: (parent: { created_at: Date }) => parent.created_at,
    questions: async (parent: { id: string }) => {
      return quizService.getQuestions(parent.id);
    },
  },

  QuizQuestion: {
    quizId: (parent: { quiz_id: string }) => parent.quiz_id,
    options: (parent: { options: string }) => JSON.parse(parent.options),
    correctAnswer: async (
      parent: { correct_answer: number; quiz_id: string },
      _args: unknown,
      context: GQLContext,
    ) => {
      // Hide correct answers from guests — only couple owners can see them
      if (!context.user) return null;
      const quiz = await quizService.getQuizById(parent.quiz_id);
      const couple = await context.db
        .selectFrom('couples')
        .select(['partner1_id', 'partner2_id'])
        .where('id', '=', quiz.couple_id)
        .executeTakeFirst();
      if (couple && (couple.partner1_id === context.user.userId || couple.partner2_id === context.user.userId)) {
        return parent.correct_answer;
      }
      return null;
    },
    sortOrder: (parent: { sort_order: number }) => parent.sort_order,
  },

  QuizResponse: {
    quizId: (parent: { quiz_id: string }) => parent.quiz_id,
    respondentName: (parent: { respondent_name: string }) => parent.respondent_name,
    totalQuestions: (parent: { total_questions: number }) => parent.total_questions,
    createdAt: (parent: { created_at: Date }) => parent.created_at,
  },
};
