import { gql } from '@apollo/client';

export const EXPLORE_COUPLES = gql`
  query ExploreCouples($limit: Int, $offset: Int, $search: String) {
    exploreCouples(limit: $limit, offset: $offset, search: $search) {
      id
      slug
      displayName
      coverPhoto
      bio
      viewCount
      totalWishes
      totalPhotos
      partner1 {
        id
        name
        avatar
      }
      partner2 {
        id
        name
        avatar
      }
    }
  }
`;

export const TRENDING_COUPLES = gql`
  query TrendingCouples($limit: Int) {
    trendingCouples(limit: $limit) {
      id
      slug
      displayName
      coverPhoto
      bio
      viewCount
      partner1 {
        id
        name
        avatar
      }
      partner2 {
        id
        name
        avatar
      }
    }
  }
`;
