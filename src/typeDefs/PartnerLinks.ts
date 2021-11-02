import gql from "graphql-tag";

export default gql`
  type PartnerLink {
    _id: String
    url: String!
    label: String!
    icon: String
    partner: Partner
    list_order:Int
    type:String
  }
  type Partner {
    links: [PartnerLink]
  }
  
  type PartnerLinkList {
    items: [PartnerLink]!
    total: Int!
    nextOffset: Int
  }
  
  input PartnerLinkInput {
    _id: String
    url: String!
    label: String!
    icon: String
    type: String
    partner_id: String
    list_order: Int

  }
`;