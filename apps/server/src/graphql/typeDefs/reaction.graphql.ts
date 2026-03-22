import gql from 'graphql-tag';

export const reactionTypeDefs = gql`
  type Reaction {
    id: ID!
    postId: ID!
    userId: ID
    guestName: String
    emoji: String!
    createdAt: DateTime!
  }

  type ReactionGroup {
    emoji: String!
    count: Int!
    hasReacted: Boolean!
  }

  type Comment {
    id: ID!
    postId: ID!
    userId: ID
    guestName: String
    content: String!
    createdAt: DateTime!
  }

  input CreateCommentInput {
    postId: ID!
    content: String!
    guestName: String
  }

  extend type Query {
    reactions(postId: ID!): [Reaction!]!
    reactionGroups(postId: ID!): [ReactionGroup!]!
    comments(postId: ID!, limit: Int, offset: Int): [Comment!]!
  }

  extend type Mutation {
    toggleReaction(postId: ID!, emoji: String!): Reaction
    createComment(input: CreateCommentInput!): Comment!
    deleteComment(id: ID!): Boolean!
  }
`;
