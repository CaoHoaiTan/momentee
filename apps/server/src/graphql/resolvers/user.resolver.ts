import { GraphQLScalarType, Kind } from 'graphql';
import * as authService from '../../services/auth.service.js';
import type { GQLContext } from '../context.js';

export const userResolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: GQLContext) => {
      if (!context.user) return null;
      return authService.me(context.user.userId);
    },
  },

  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'A date-time string in ISO 8601 format',
    serialize(value: unknown): string {
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (typeof value === 'string') {
        return new Date(value).toISOString();
      }
      throw new Error('DateTime cannot represent an invalid date-time value');
    },
    parseValue(value: unknown): Date {
      if (typeof value === 'string') {
        return new Date(value);
      }
      throw new Error('DateTime cannot represent non-string type');
    },
    parseLiteral(ast): Date {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value);
      }
      throw new Error('DateTime cannot represent non-string type');
    },
  }),

  User: {
    createdAt: (parent: { created_at: Date }) => parent.created_at,
  },
};
