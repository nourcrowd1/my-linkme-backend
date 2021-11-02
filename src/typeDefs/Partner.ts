import gql from "graphql-tag";

export default gql`
  type Partner {
    id: ID!
    name: String!
    type: String!
    note: String
    icon: String
    links: [PartnerLink]
  }
  
  input PartnerInput {
    name: String
    note: String
    icon: String
    type: String
    links: [PartnerLinkInput]
  }
  
  type Query {
    partner(id: ID!): Partner @requiresAdmin
    partners(input: ListParameters): PartnersList @requiresAdmin
  }
  
  type PartnersList {
    items: [Partner]!
    total: Int!
    nextOffset: Int
  }
  
  type Mutation {
    createPartner(input: PartnerInput): Partner @requiresAdmin
    updatePartner(id: ID!, input: PartnerInput): Partner @requiresAdmin
    deletePartner(id: ID!): OperationResult @requiresAdmin
  }
`;
