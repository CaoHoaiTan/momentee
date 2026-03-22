import gql from 'graphql-tag';

export const billingTypeDefs = gql`
  type Subscription {
    id: ID!
    coupleId: ID!
    plan: PlanType!
    status: SubscriptionStatus!
    stripeCustomerId: String
    stripeSubscriptionId: String
    currentPeriodStart: DateTime
    currentPeriodEnd: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type PlanLimitCheck {
    allowed: Boolean!
    current: Int!
    limit: Int!
  }

  enum SubscriptionStatus {
    ACTIVE
    CANCELED
    PAST_DUE
    TRIALING
  }

  extend type Query {
    subscription(coupleId: ID!): Subscription
    checkPlanLimit(coupleId: ID!, feature: String!): PlanLimitCheck!
  }

  extend type Mutation {
    createCheckoutSession(coupleId: ID!, plan: String!): String!
    createBillingPortal(coupleId: ID!): String!
  }
`;
