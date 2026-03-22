import { gql } from '@apollo/client';

export const MARK_NOTIFICATIONS_READ = gql`
  mutation MarkNotificationsRead {
    markNotificationsRead
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id)
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`;
