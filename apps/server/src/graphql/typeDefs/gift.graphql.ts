import gql from 'graphql-tag';

export const giftTypeDefs = gql`
  type GiftAccount {
    id: ID!
    coupleId: ID!
    bankName: String
    accountNumber: String
    accountHolder: String
    qrCode: String
    note: String
    isActive: Boolean!
    createdAt: DateTime!
  }

  input CreateGiftAccountInput {
    bankName: String
    accountNumber: String
    accountHolder: String
    qrCode: String
    note: String
  }

  input UpdateGiftAccountInput {
    bankName: String
    accountNumber: String
    accountHolder: String
    qrCode: String
    note: String
    isActive: Boolean
  }

  extend type Query {
    giftAccounts(coupleId: ID!): [GiftAccount!]!
    giftAccount(id: ID!): GiftAccount
  }

  extend type Mutation {
    createGiftAccount(coupleId: ID!, input: CreateGiftAccountInput!): GiftAccount!
    updateGiftAccount(id: ID!, input: UpdateGiftAccountInput!): GiftAccount!
    deleteGiftAccount(id: ID!): Boolean!
  }
`;
