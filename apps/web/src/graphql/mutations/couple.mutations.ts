import { gql } from '@apollo/client';

export const CREATE_COUPLE = gql`
  mutation CreateCouple($input: CreateCoupleInput!) {
    createCouple(input: $input) {
      id
      slug
      displayName
      inviteCode
      bio
      anniversary
      theme
      isPublic
      createdAt
      partner1 {
        id
        name
        avatar
      }
    }
  }
`;

export const UPDATE_COUPLE = gql`
  mutation UpdateCouple($id: ID!, $input: UpdateCoupleInput!) {
    updateCouple(id: $id, input: $input) {
      id
      slug
      displayName
      bio
      anniversary
      weddingDate
      theme
      layoutConfig
      backgroundMusic
      coverPhoto
      isPublic
      inviteCode
      viewCount
      partner1 {
        id
        name
        avatar
      }
      partner2 {
        id
        name
        avatar
      }
    }
  }
`;

export const DELETE_COUPLE = gql`
  mutation DeleteCouple($id: ID!) {
    deleteCouple(id: $id)
  }
`;

export const ACCEPT_INVITE = gql`
  mutation AcceptInvite($inviteCode: String!) {
    acceptInvite(inviteCode: $inviteCode) {
      id
      slug
      displayName
      partner1 {
        id
        name
      }
      partner2 {
        id
        name
      }
    }
  }
`;

export const INCREMENT_VIEW_COUNT = gql`
  mutation IncrementViewCount($slug: String!) {
    incrementViewCount(slug: $slug)
  }
`;
