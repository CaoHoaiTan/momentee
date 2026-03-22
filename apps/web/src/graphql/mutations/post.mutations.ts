import { gql } from '@apollo/client';

export const CREATE_POST = gql`
  mutation CreatePost($coupleId: ID!, $input: CreatePostInput!) {
    createPost(coupleId: $coupleId, input: $input) {
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

export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;
