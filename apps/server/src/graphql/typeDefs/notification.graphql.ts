import gql from 'graphql-tag';

export const notificationTypeDefs = gql`
  type Notification {
    id: ID!
    userId: ID!
    coupleId: ID
    type: String!
    title: String!
    message: String!
    data: String
    isRead: Boolean!
    createdAt: DateTime!
  }

  extend type Query {
    notifications(limit: Int, offset: Int, unreadOnly: Boolean): [Notification!]!
    unreadNotificationCount: Int!
  }

  extend type Mutation {
    markNotificationsRead: Boolean!
    markNotificationRead(id: ID!): Boolean!
    deleteNotification(id: ID!): Boolean!
  }
`;
