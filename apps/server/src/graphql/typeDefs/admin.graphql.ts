import gql from 'graphql-tag';

export const adminTypeDefs = gql`
  type AdminStats {
    totalUsers: Int!
    totalCouples: Int!
    totalPosts: Int!
    totalWishes: Int!
  }

  type AdminCouple {
    id: ID!
    slug: String!
    displayName: String!
    plan: PlanType!
    isPublic: Boolean!
    viewCount: Int!
    partner1Name: String!
    partner1Email: String!
    createdAt: DateTime!
  }

  extend type Query {
    adminStats: AdminStats!
    adminUsers(limit: Int, offset: Int, search: String): [User!]!
    adminCouples(limit: Int, offset: Int, search: String): [AdminCouple!]!
  }

  extend type Mutation {
    adminDeleteUser(id: ID!): Boolean!
    adminDeleteCouple(id: ID!): Boolean!
    adminUpdateUserRole(id: ID!, role: UserRole!): User!
  }
`;
