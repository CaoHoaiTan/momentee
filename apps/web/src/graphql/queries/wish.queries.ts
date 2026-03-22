import { gql } from '@apollo/client';

export const GET_WISHES = gql`
  query Wishes($coupleId: ID!, $limit: Int, $offset: Int) {
    wishes(coupleId: $coupleId, limit: $limit, offset: $offset) {
      id
      coupleId
      authorName
      authorAvatar
      message
      emoji
      isAnonymous
      isApproved
      createdAt
    }
  }
`;

export const GET_WISH = gql`
  query Wish($id: ID!) {
    wish(id: $id) {
      id
      coupleId
      authorName
      authorAvatar
      message
      emoji
      isAnonymous
      isApproved
      createdAt
    }
  }
`;
