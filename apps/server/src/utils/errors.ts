import { GraphQLError } from 'graphql';
import type { GQLContext } from '../graphql/context.js';

export function AuthenticationError(message = 'You must be logged in'): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'UNAUTHENTICATED' },
  });
}

export function ForbiddenError(
  message = 'You are not authorized to perform this action',
): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'FORBIDDEN' },
  });
}

export function NotFoundError(resource = 'Resource'): GraphQLError {
  return new GraphQLError(`${resource} not found`, {
    extensions: { code: 'NOT_FOUND' },
  });
}

export function ValidationError(message: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'BAD_USER_INPUT' },
  });
}

export function requireAuth(
  context: GQLContext,
): asserts context is GQLContext & { user: { userId: string } } {
  if (!context.user) {
    throw AuthenticationError();
  }
}
