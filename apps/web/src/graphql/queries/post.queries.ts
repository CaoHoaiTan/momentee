import { gql } from '@apollo/client';

export const GET_POSTS = gql`
  query Posts($coupleId: ID!, $limit: Int, $offset: Int) {
    posts(coupleId: $coupleId, limit: $limit, offset: $offset) {
      id
      coupleId
      caption
      type
      visibility
      isPinned
      media {
        id
        postId
        url
        thumbnail
        blurHash
        type
        width
        height
        sortOrder
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_POST = gql`
  query Post($id: ID!) {
    post(id: $id) {
      id
      coupleId
      caption
      type
      visibility
      isPinned
      media {
        id
        postId
        url
        thumbnail
        blurHash
        type
        width
        height
        sortOrder
      }
      createdAt
      updatedAt
    }
  }
`;
