import { gql } from '@apollo/client';

export const GET_REACTION_GROUPS = gql`
  query ReactionGroups($postId: ID!) {
    reactionGroups(postId: $postId) {
      emoji
      count
      hasReacted
    }
  }
`;

export const GET_COMMENTS = gql`
  query Comments($postId: ID!, $limit: Int, $offset: Int) {
    comments(postId: $postId, limit: $limit, offset: $offset) {
      id
      postId
      userId
      guestName
      content
      createdAt
    }
  }
`;
