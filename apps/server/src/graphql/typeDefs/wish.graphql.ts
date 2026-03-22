import gql from 'graphql-tag';

export const wishTypeDefs = gql`
  type Wish {
    id: ID!
    coupleId: ID!
    authorName: String!
    authorAvatar: String
    message: String!
    emoji: String
    isAnonymous: Boolean!
    isApproved: Boolean!
    createdAt: DateTime!
  }

  input CreateWishInput {
    authorName: String!
    message: String!
    emoji: String
    isAnonymous: Boolean
  }

  extend type Query {
    wishes(coupleId: ID!, limit: Int, offset: Int): [Wish!]!
    wish(id: ID!): Wish
  }

  extend type Mutation {
    createWish(coupleId: ID!, input: CreateWishInput!): Wish!
    deleteWish(id: ID!): Boolean!
    approveWish(id: ID!, approved: Boolean!): Wish!
  }
`;
