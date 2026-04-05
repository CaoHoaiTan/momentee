import gql from 'graphql-tag';

export const authTypeDefs = gql`
  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    user: User!
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    refreshToken(token: String!): AuthPayload!
    logout: Boolean!
    forgotPassword(email: String!): Boolean!
    resetPassword(token: String!, password: String!): Boolean!
    googleLogin(idToken: String!): AuthPayload!
    requestEmailVerification: Boolean!
    verifyEmail(token: String!): AuthPayload!
  }
`;
