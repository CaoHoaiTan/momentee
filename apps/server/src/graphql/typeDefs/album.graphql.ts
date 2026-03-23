import gql from 'graphql-tag';

export const albumTypeDefs = gql`
  type Album {
    id: ID!
    coupleId: ID!
    title: String!
    description: String
    coverPhoto: String
    photos: [AlbumPhoto!]!
    photoCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AlbumPhoto {
    id: ID!
    albumId: ID!
    mediaUrl: String!
    caption: String
    sortOrder: Int!
    createdAt: DateTime!
  }

  input CreateAlbumInput {
    title: String!
    description: String
    coverPhoto: String
  }

  input UpdateAlbumInput {
    title: String
    description: String
    coverPhoto: String
  }

  input AddAlbumPhotoInput {
    file: String!
    caption: String
    sortOrder: Int
  }

  extend type Query {
    albums(coupleId: ID!): [Album!]!
    album(id: ID!): Album
  }

  extend type Mutation {
    createAlbum(coupleId: ID!, input: CreateAlbumInput!): Album!
    updateAlbum(id: ID!, input: UpdateAlbumInput!): Album!
    deleteAlbum(id: ID!): Boolean!
    addAlbumPhoto(albumId: ID!, input: AddAlbumPhotoInput!): AlbumPhoto!
    removeAlbumPhoto(id: ID!): Boolean!
    reorderAlbumPhotos(albumId: ID!, photoIds: [ID!]!): Boolean!
  }
`;
