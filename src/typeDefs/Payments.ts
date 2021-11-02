import gql from "graphql-tag";


/**
 * Everything related to user accounts
 */
export default gql`
 type Payment {
    id: ID!
    invoice_id: String
    status: String!
    create_time: String
    total_amount: Int!
    currency:String
 }   
 type User {
    payments: [Payment]
  }
  
  type Query {
    payments: [Payment] @requiresUser
  }
`;
