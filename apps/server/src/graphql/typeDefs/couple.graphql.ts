import gql from 'graphql-tag';

export const coupleTypeDefs = gql`
  scalar Date

  type Couple {
    id: ID!
    slug: String!
    displayName: String!
    partner1: User!
    partner2: User
    inviteCode: String
    coverPhoto: String
    bio: String
    anniversary: Date
    weddingDate: Date
    theme: String!
    customDomain: String
    isPublic: Boolean!
    viewCount: Int!
    plan: PlanType!
    daysTogether: Int!
    totalWishes: Int!
    totalPhotos: Int!
    createdAt: DateTime!
  }

  input CreateCoupleInput {
    displayName: String!
    anniversary: String
    bio: String
  }

  input UpdateCoupleInput {
    displayName: String
    bio: String
    anniversary: String
    weddingDate: String
    theme: String
    coverPhoto: String
    isPublic: Boolean
  }

  extend type Query {
    couple(slug: String!): Couple
    coupleById(id: ID!): Couple
    myCouple: Couple
  }

  extend type Mutation {
    createCouple(input: CreateCoupleInput!): Couple!
    updateCouple(id: ID!, input: UpdateCoupleInput!): Couple!
    deleteCouple(id: ID!): Boolean!
    acceptInvite(inviteCode: String!): Couple!
    incrementViewCount(slug: String!): Boolean!
  }
`;
