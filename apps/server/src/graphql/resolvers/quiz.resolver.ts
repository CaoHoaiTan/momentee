import * as quizService from '../../services/quiz.service.js';
import { requireAuth } from '../../utils/errors.js';
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
    ) => {
      // No auth required — guests can take quizzes
      return quizService.submitQuiz(args.quizId, args.input);
    },
  },

  Quiz: {
    coupleId: (parent: { couple_id: string }) => parent.couple_id,
    isActive: (parent: { is_active: boolean }) => parent.is_active,
    createdAt: (parent: { created_at: Date }) => parent.created_at,
    questions: async (parent: { id: string }) => {
      return quizService.getQuestions(parent.id);
    },
  },

  QuizQuestion: {
    quizId: (parent: { quiz_id: string }) => parent.quiz_id,
    options: (parent: { options: string }) => JSON.parse(parent.options),
    correctAnswer: (parent: { correct_answer: number }) => parent.correct_answer,
    sortOrder: (parent: { sort_order: number }) => parent.sort_order,
  },

  QuizResponse: {
    quizId: (parent: { quiz_id: string }) => parent.quiz_id,
    respondentName: (parent: { respondent_name: string }) => parent.respondent_name,
    totalQuestions: (parent: { total_questions: number }) => parent.total_questions,
    createdAt: (parent: { created_at: Date }) => parent.created_at,
  },
};
