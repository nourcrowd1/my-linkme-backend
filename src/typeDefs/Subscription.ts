import gql from "graphql-tag";

export default gql`
  enum SubscriptionStatus {
    approval_pending
    approved
    active
    suspended
    cancelled
    expired
  }
  
  enum SubscriptionOrigin {
    paypal
    partner
  }
  
  type SubscriptionInfo {
    id: ID!
    ext_id: String
    origin: String
    status: SubscriptionStatus
    plan_id: String
    start_time: Date!
    end_time: Date
    partner: Partner
    payments: [Payment]
  }
  enum SubscriptionInterval {
    month
    year
  }

  type SubscriptionPlan {
    id: ID!
    product_id: String!
    name: String!
    description: String!
    interval: SubscriptionInterval!
    trial: Int
  }
   
  type PaypalPlan {
      id:  ID!
      status: String
      name: String
      description: String
      interval: String
      amount: String
      currency: String
  }
  
  type ChangePayPalSubscriptionPlan {
    href: String
    method: String
  }
  
   input ActivateSubscriptionInput {
    id: ID!
    plan_id: ID!
    origin: SubscriptionOrigin!
  }

  type Mutation {
    activateSubscription(input: ActivateSubscriptionInput!): SubscriptionInfo @requiresUser
    cancelSubscription(id: ID!): Boolean @requiresUser
    changePayPalSubscriptionPlan(id: String!, plan_id: String!): ChangePayPalSubscriptionPlan @requiresUser
  }
  type Query {
    plans: [SubscriptionPlan]
    currentSubscription: SubscriptionInfo @requiresUser
    paypalPlans: [PaypalPlan]
  }
`;
