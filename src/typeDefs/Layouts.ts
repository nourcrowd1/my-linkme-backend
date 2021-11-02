import gql from "graphql-tag";

export default gql`
  type Layout {
    id: ID!
    template: String!
    style: Style
  }

  input LayoutInput {
    template: String
    style: String
  }

  type LayoutsList {
    items: [Layout]!
    total: Int!
    nextOffset: Int
  }

  type Query {
    layout(id: ID!): Layout @requiresAdmin
    layouts(input: ListParameters): LayoutsList @requiresAdmin
  }

  type Mutation {
    createLayout(input: LayoutInput!): Layout @requiresAdmin
    updateLayout(id: ID!, input: LayoutInput!): Layout @requiresAdmin
    deleteLayout(id: ID!): OperationResult @requiresAdmin
  }
`;
