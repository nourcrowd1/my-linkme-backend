import gql from "graphql-tag";

export default gql`
  enum Language {
    sv
    en
    ar
    ru
  }

  type Page {
    id: ID!
    path: String!
    content: String!
    created: Date
    updated: Date
    deletable: Boolean
  }

  input PageCreateInput {
    path: String!
    content: String!
  }

  input PageUpdateInput {
    path: String
    content: String
  }

  type PagesList {
    items: [Page]!
    total: Int!
    nextOffset: Int
  }

  type Query {
    page(id: ID!): Page @requiresAdmin
    pages(input: ListParameters): PagesList @requiresAdmin
    previewPage(template: String!, params: JSON): String @requiresAdmin
  }

  type Mutation {
    createPage(input: PageCreateInput!): Page @requiresAdmin
    updatePage(id: ID!, input: PageUpdateInput!): Page @requiresAdmin
    deletePage(id: ID!): OperationResult @requiresAdmin
  }
`;
