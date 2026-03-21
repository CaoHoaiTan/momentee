import gql from 'graphql-tag';

export const userTypeDefs = gql`
  scalar DateTime

  type User {
    id: ID!
    email: String!
    name: String!
    avatar: String
    role: UserRole!
    plan: PlanType!
    createdAt: DateTime!
  }

  enum UserRole {
    USER
    ADMIN
  }

  enum PlanType {
    FREE
    PREMIUM
    PREMIUM_PLUS
  }

  type Query {
    me: User
  }
`;
