import { gql } from '@apollo/client';

export const CREATE_MILESTONE = gql`
  mutation CreateMilestone($coupleId: ID!, $input: MilestoneInput!) {
    createMilestone(coupleId: $coupleId, input: $input) {
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

export const UPDATE_MILESTONE = gql`
  mutation UpdateMilestone($id: ID!, $input: UpdateMilestoneInput!) {
    updateMilestone(id: $id, input: $input) {
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

export const DELETE_MILESTONE = gql`
  mutation DeleteMilestone($id: ID!) {
    deleteMilestone(id: $id)
  }
`;

export const REORDER_MILESTONES = gql`
  mutation ReorderMilestones($coupleId: ID!, $orderedIds: [ID!]!) {
    reorderMilestones(coupleId: $coupleId, orderedIds: $orderedIds) {
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
