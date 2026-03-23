import { gql } from '@apollo/client';

export const GET_ALBUMS = gql`
  query Albums($coupleId: ID!) {
    albums(coupleId: $coupleId) {
      id
      coupleId
      title
      description
      coverPhoto
      photoCount
      createdAt
      updatedAt
      photos {
        id
        albumId
        mediaUrl
        caption
        sortOrder
        createdAt
      }
    }
  }
`;

export const GET_ALBUM = gql`
  query Album($id: ID!) {
    album(id: $id) {
      id
      coupleId
      title
      description
      coverPhoto
      photoCount
      createdAt
      updatedAt
      photos {
        id
        albumId
        mediaUrl
        caption
        sortOrder
        createdAt
      }
    }
  }
`;
