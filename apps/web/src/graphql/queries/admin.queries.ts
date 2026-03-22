import { gql } from '@apollo/client';

export const GET_ADMIN_STATS = gql`
  query AdminStats {
    adminStats {
      totalUsers
      totalCouples
      totalPosts
      totalWishes
    }
  }
`;

export const GET_ADMIN_USERS = gql`
  query AdminUsers($limit: Int, $offset: Int, $search: String) {
    adminUsers(limit: $limit, offset: $offset, search: $search) {
      id
      email
      name
      avatar
      role
      plan
      createdAt
    }
  }
`;

export const GET_ADMIN_COUPLES = gql`
  query AdminCouples($limit: Int, $offset: Int, $search: String) {
    adminCouples(limit: $limit, offset: $offset, search: $search) {
      id
      slug
      displayName
      plan
      isPublic
      viewCount
      partner1Name
      partner1Email
      createdAt
    }
  }
`;
