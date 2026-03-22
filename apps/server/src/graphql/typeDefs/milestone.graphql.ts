import gql from 'graphql-tag';

export const milestoneTypeDefs = gql`
  type Milestone {
    id: ID!
    coupleId: ID!
    title: String!
    description: String
    date: Date!
    icon: String
    photo: String
    sortOrder: Int!
    createdAt: DateTime!
  }

  input MilestoneInput {
    title: String!
    description: String
    date: String!
    icon: String
  }

  input UpdateMilestoneInput {
    title: String
    description: String
    date: String
    icon: String
  }

  extend type Query {
    milestones(coupleId: ID!): [Milestone!]!
    milestone(id: ID!): Milestone
  }

  extend type Mutation {
    createMilestone(coupleId: ID!, input: MilestoneInput!): Milestone!
    updateMilestone(id: ID!, input: UpdateMilestoneInput!): Milestone!
    deleteMilestone(id: ID!): Boolean!
    reorderMilestones(coupleId: ID!, orderedIds: [ID!]!): [Milestone!]!
  }
`;
