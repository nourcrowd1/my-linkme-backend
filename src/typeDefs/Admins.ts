import gql from "graphql-tag";

export default gql`
  type Admin {
    id: ID!
    email: String!
    name: String
    created: Int
    updated: Int
  }

  input AdminCreateInput {
    email: String!
    password: String!
    name: String
  }

  input AdminUpdateInput {
    email: String!
    password: String!
    name: String
  }

  type AdminsList {
    items: [Admin]!
    nextOffset: Int
  }

  type AuthorizedAdmin {
    admin: Admin
    token: String
  }

  type Query {
    currentAdmin: Admin @requiresAdmin
    admin(id: ID!): Admin @requiresAdmin
    admins(input: ListParameters): AdminsList @requiresAdmin
  }

  type Mutation {
    loginAdmin(email: String!, password: String!): AuthorizedAdmin
    createAdmin(input: AdminCreateInput!): Admin @requiresAdmin
    updateAdmin(id: ID!, input: AdminUpdateInput!): Admin @requiresAdmin
    deleteAdmin(id: ID!): OperationResult @requiresAdmin
  }
`;
