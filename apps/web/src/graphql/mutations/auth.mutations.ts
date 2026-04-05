import { gql } from '@apollo/client';

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        name
        avatar
        role
        plan
        emailVerified
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        name
        avatar
        role
        plan
        emailVerified
      }
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($token: String!) {
    refreshToken(token: $token) {
      accessToken
      refreshToken
      user {
        id
        email
        name
        avatar
        role
        plan
        emailVerified
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($token: String!, $password: String!) {
    resetPassword(token: $token, password: $password)
  }
`;

export const GOOGLE_LOGIN_MUTATION = gql`
  mutation GoogleLogin($idToken: String!) {
    googleLogin(idToken: $idToken) {
      accessToken
      refreshToken
      user {
        id
        email
        name
        avatar
        role
        plan
        emailVerified
      }
    }
  }
`;

export const REQUEST_EMAIL_VERIFICATION_MUTATION = gql`
  mutation RequestEmailVerification {
    requestEmailVerification
  }
`;

export const VERIFY_EMAIL_MUTATION = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      accessToken
      refreshToken
      user {
        id
        email
        name
        avatar
        role
        plan
        emailVerified
      }
    }
  }
`;
