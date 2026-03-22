import gql from 'graphql-tag';

export const postTypeDefs = gql`
  enum PostType {
    photo
    video
    story
    letter
    milestone
  }

  enum Visibility {
    public
    friends_only
    private
  }

  enum MediaType {
    image
    video
    gif
  }

  type Media {
    id: ID!
    postId: ID!
    url: String!
    thumbnail: String
    blurHash: String
    type: MediaType!
    width: Int
    height: Int
    sortOrder: Int!
  }

  type Post {
    id: ID!
    coupleId: ID!
    caption: String
    type: PostType!
    visibility: Visibility!
    isPinned: Boolean!
    media: [Media!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type UploadResult {
    url: String!
    publicId: String!
    width: Int!
    height: Int!
  }

  input MediaInput {
    file: String!
    type: MediaType!
  }

  input CreatePostInput {
    caption: String
    type: PostType!
    visibility: Visibility
    media: [MediaInput!]!
  }

  extend type Query {
    posts(coupleId: ID!, limit: Int, offset: Int): [Post!]!
    post(id: ID!): Post
  }

  extend type Mutation {
    createPost(coupleId: ID!, input: CreatePostInput!): Post!
    deletePost(id: ID!): Boolean!
    uploadImage(file: String!, folder: String!): UploadResult!
  }
`;
