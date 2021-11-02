import gql from "graphql-tag";

export default gql`
  scalar JSON
  scalar Date

  type OperationResult {
    affected: Int
    error: String
    status: Boolean
  }

  type Query {
    health: Boolean
  }
  
  input Search {
    field: String!
    value: String!
  }
  
  input Order {
    field: String!
    direction: String!
  }

  input ListParameters {
    limit: Int
    offset: Int
    search: Search
    order: Order
  }
`;
