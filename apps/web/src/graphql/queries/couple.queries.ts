import { gql } from '@apollo/client';

export const GET_MY_COUPLE = gql`
  query MyCouple {
    myCouple {
      id
      slug
      displayName
      inviteCode
      coverPhoto
      bio
      anniversary
      weddingDate
      theme
      isPublic
      viewCount
      plan
      daysTogether
      totalWishes
      totalPhotos
      createdAt
      partner1 {
        id
        name
        email
        avatar
      }
      partner2 {
        id
        name
        email
        avatar
      }
    }
  }
`;

export const GET_COUPLE_BY_SLUG = gql`
  query CoupleBySlug($slug: String!) {
    couple(slug: $slug) {
      id
      slug
      displayName
      coverPhoto
      bio
      anniversary
      weddingDate
      theme
      isPublic
      viewCount
      daysTogether
      totalWishes
      totalPhotos
      createdAt
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

export const GET_COUPLE_BY_ID = gql`
  query CoupleById($id: ID!) {
    coupleById(id: $id) {
      id
      slug
      displayName
      inviteCode
      coverPhoto
      bio
      anniversary
      weddingDate
      theme
      isPublic
      viewCount
      plan
      daysTogether
      totalWishes
      totalPhotos
      createdAt
      partner1 {
        id
        name
        email
        avatar
      }
      partner2 {
        id
        name
        email
        avatar
      }
    }
  }
`;
