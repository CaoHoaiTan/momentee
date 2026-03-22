import { gql } from '@apollo/client';

export const GET_NOTIFICATIONS = gql`
  query Notifications($limit: Int, $offset: Int, $unreadOnly: Boolean) {
    notifications(limit: $limit, offset: $offset, unreadOnly: $unreadOnly) {
      id
      userId
      coupleId
      type
      title
      message
      data
      isRead
      createdAt
    }
  }
`;

export const GET_UNREAD_COUNT = gql`
  query UnreadNotificationCount {
    unreadNotificationCount
  }
`;
