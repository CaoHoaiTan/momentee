import { gql } from '@apollo/client';

export const TOGGLE_REACTION = gql`
  mutation ToggleReaction($postId: ID!, $emoji: String!) {
    toggleReaction(postId: $postId, emoji: $emoji) {
      id
      postId
      emoji
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      postId
      userId
      guestName
      content
      createdAt
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id)
  }
`;
