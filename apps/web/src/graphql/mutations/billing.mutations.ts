import { gql } from '@apollo/client';

export const CREATE_CHECKOUT_SESSION = gql`
  mutation CreateCheckoutSession($coupleId: ID!, $plan: String!) {
    createCheckoutSession(coupleId: $coupleId, plan: $plan)
  }
`;

export const CREATE_BILLING_PORTAL = gql`
  mutation CreateBillingPortal($coupleId: ID!) {
    createBillingPortal(coupleId: $coupleId)
  }
`;
