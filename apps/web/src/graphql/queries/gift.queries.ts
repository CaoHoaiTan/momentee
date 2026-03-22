import { gql } from '@apollo/client';

export const GET_GIFT_ACCOUNTS = gql`
  query GiftAccounts($coupleId: ID!) {
    giftAccounts(coupleId: $coupleId) {
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

export const GET_GIFT_ACCOUNT = gql`
  query GiftAccount($id: ID!) {
    giftAccount(id: $id) {
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
