import gql from "graphql-tag";

export default gql`
  type Link {
    id: ID!
    url: String!
    label: String!
    icon: String
    type:String
    source:String
    list_order: Int
    is_folder:Boolean
    parent_id:String
    group_id:String

  }
  type User {
    links: [Link]
  }
  input UserUpdateInput {
    links: [LinkInput]
  }
  
  input LinkInput {
    id: ID
    _id: String
    url: String
    label: String
    icon: String
    list_order: Int
    type:String
    is_folder:Boolean
    parent_id:String
    group_id:String
    subLinks:[LinkInput]

  }
  
  type Mutation {
    createLink(input: LinkInput): Link @requiresUser
    updateLink(id: ID!, input: LinkInput): Link @requiresUser
    deleteLink(id: [String!]): OperationResult @requiresUser
    createLinks(input: [LinkInput]): [Link] @requiresUser
  }

`;
