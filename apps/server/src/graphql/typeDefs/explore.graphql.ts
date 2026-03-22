import gql from 'graphql-tag';

export const exploreTypeDefs = gql`
  type ExploreCoupleResult {
    id: ID!
    slug: String!
    displayName: String!
    coverPhoto: String
    bio: String
    viewCount: Int!
    totalWishes: Int!
    totalPhotos: Int!
    partner1: User!
    partner2: User
  }

  extend type Query {
    exploreCouples(limit: Int, offset: Int, search: String): [ExploreCoupleResult!]!
    trendingCouples(limit: Int): [ExploreCoupleResult!]!
  }
`;
