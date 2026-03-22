import { gql } from '@apollo/client';

export const GET_MILESTONES = gql`
  query Milestones($coupleId: ID!) {
    milestones(coupleId: $coupleId) {
      id
      coupleId
      title
      description
      date
      icon
      photo
      sortOrder
      createdAt
    }
  }
`;

export const GET_MILESTONE = gql`
  query Milestone($id: ID!) {
    milestone(id: $id) {
      id
      coupleId
      title
      description
      date
      icon
      photo
      sortOrder
      createdAt
    }
  }
`;
