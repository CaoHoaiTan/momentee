import { gql } from '@apollo/client';

export const CREATE_ALBUM = gql`
  mutation CreateAlbum($coupleId: ID!, $input: CreateAlbumInput!) {
    createAlbum(coupleId: $coupleId, input: $input) {
      id
      coupleId
      title
      description
      coverPhoto
      photoCount
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_ALBUM = gql`
  mutation UpdateAlbum($id: ID!, $input: UpdateAlbumInput!) {
    updateAlbum(id: $id, input: $input) {
      id
      coupleId
      title
      description
      coverPhoto
      photoCount
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_ALBUM = gql`
  mutation DeleteAlbum($id: ID!) {
    deleteAlbum(id: $id)
  }
`;

export const ADD_ALBUM_PHOTO = gql`
  mutation AddAlbumPhoto($albumId: ID!, $input: AddAlbumPhotoInput!) {
    addAlbumPhoto(albumId: $albumId, input: $input) {
      id
      albumId
      mediaUrl
      caption
      sortOrder
      createdAt
    }
  }
`;

export const REMOVE_ALBUM_PHOTO = gql`
  mutation RemoveAlbumPhoto($id: ID!) {
    removeAlbumPhoto(id: $id)
  }
`;

export const REORDER_ALBUM_PHOTOS = gql`
  mutation ReorderAlbumPhotos($albumId: ID!, $photoIds: [ID!]!) {
    reorderAlbumPhotos(albumId: $albumId, photoIds: $photoIds)
  }
`;
