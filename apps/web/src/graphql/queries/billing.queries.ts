import { gql } from '@apollo/client';

export const GET_SUBSCRIPTION = gql`
  query Subscription($coupleId: ID!) {
    subscription(coupleId: $coupleId) {
      id
      coupleId
      plan
      status
      currentPeriodStart
      currentPeriodEnd
      createdAt
    }
  }
`;

export const CHECK_PLAN_LIMIT = gql`
  query CheckPlanLimit($coupleId: ID!, $feature: String!) {
    checkPlanLimit(coupleId: $coupleId, feature: $feature) {
      allowed
      current
      limit
    }
  }
`;
