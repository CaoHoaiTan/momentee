import { gql } from '@apollo/client';

export const ADMIN_DELETE_USER = gql`
  mutation AdminDeleteUser($id: ID!) {
    adminDeleteUser(id: $id)
  }
`;

export const ADMIN_DELETE_COUPLE = gql`
  mutation AdminDeleteCouple($id: ID!) {
    adminDeleteCouple(id: $id)
  }
`;

export const ADMIN_UPDATE_USER_ROLE = gql`
  mutation AdminUpdateUserRole($id: ID!, $role: UserRole!) {
    adminUpdateUserRole(id: $id, role: $role) {
      id
      role
    }
  }
`;
