import { gql } from '@apollo/client';

export const CREATE_WISH = gql`
  mutation CreateWish($coupleId: ID!, $input: CreateWishInput!) {
    createWish(coupleId: $coupleId, input: $input) {
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

export const DELETE_WISH = gql`
  mutation DeleteWish($id: ID!) {
    deleteWish(id: $id)
  }
`;

export const APPROVE_WISH = gql`
  mutation ApproveWish($id: ID!, $approved: Boolean!) {
    approveWish(id: $id, approved: $approved) {
      id
      isApproved
    }
  }
`;
