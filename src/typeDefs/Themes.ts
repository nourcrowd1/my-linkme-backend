import gql from "graphql-tag";

export default gql`
  type Theme {
    id: ID!
    title: String!
    template: String!
    preview: Image
    description: String
  }

  input ThemeCreateInput {
    title: String!
    template: String!
    preview: ImageInput
    description: String
  }

  input ThemeUpdateInput {
    title: String
    template: String
    preview: ImageInput
    description: String
  }

  type User {
    theme: Theme
  }

  input UserUpdateInput {
    theme: ID
  }

  type ThemesList {
    items: [Theme]!
    total: Int!
    nextOffset: Int
  }

  type ThemePreview {
    html: String!
  }

  type Query {
    theme(id: ID!): Theme @requiresSubscription
    themeForAdmin(id: ID!): Theme @requiresAdmin
    themes(input: ListParameters): ThemesList @requiresAuthorized
    preview(id: ID, params: JSON): String @requiresUser
    previewTheme(template: String!, params: JSON): String @requiresAdmin
  }

  type Mutation {
    createTheme(input: ThemeCreateInput!): Theme @requiresAdmin
    updateTheme(id: ID!, input: ThemeUpdateInput!): Theme @requiresAdmin
    deleteTheme(id: ID!): OperationResult @requiresAdmin
  }
`;
