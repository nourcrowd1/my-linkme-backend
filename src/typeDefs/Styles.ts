import gql from "graphql-tag";

export default gql`
  type Style {
    id: ID!
    content: String!
  }

  input StyleInput {
    content: String
  }

  type StylesList {
    items: [Style]!
    total: Int!
    nextOffset: Int
  }

  type Query {
    style(id: ID!): Style @requiresAdmin
    styles(input: ListParameters): StylesList @requiresAdmin
  }

  type Mutation {
    createStyle(input: StyleInput!): Style @requiresAdmin
    updateStyle(id: ID!, input: StyleInput!): Style @requiresAdmin
    deleteStyle(id: ID!): OperationResult @requiresAdmin
  }
`;
