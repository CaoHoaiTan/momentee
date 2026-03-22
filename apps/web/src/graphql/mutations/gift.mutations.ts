import { gql } from '@apollo/client';

export const CREATE_GIFT_ACCOUNT = gql`
  mutation CreateGiftAccount($coupleId: ID!, $input: CreateGiftAccountInput!) {
    createGiftAccount(coupleId: $coupleId, input: $input) {
      id
      coupleId
      bankName
      accountNumber
      accountHolder
      qrCode
      note
      isActive
      createdAt
    }
  }
`;

export const UPDATE_GIFT_ACCOUNT = gql`
  mutation UpdateGiftAccount($id: ID!, $input: UpdateGiftAccountInput!) {
    updateGiftAccount(id: $id, input: $input) {
      id
      coupleId
      bankName
      accountNumber
      accountHolder
      qrCode
      note
      isActive
      createdAt
    }
  }
`;

export const DELETE_GIFT_ACCOUNT = gql`
  mutation DeleteGiftAccount($id: ID!) {
    deleteGiftAccount(id: $id)
  }
`;
