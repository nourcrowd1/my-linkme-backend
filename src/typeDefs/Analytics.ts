import gql from "graphql-tag";

/**
 * Everything related to user accounts
 */
export default gql`
  input SumByDateInput {
    event: String
    dateFrom: String!
    dateTo: String!
    target: String
  }
  
  type SumByDate {
    count: Int!
  }
  
  type sumByDateGroupedCountry {
    country: String!
    count: Int!
  }
  
  type topLocations {
    country: String!
    pageView: Int!
    linkClick:Int!
  }
  
  type Query {
    sumByDate(input: SumByDateInput): SumByDate @requiresUser
    sumByDateGroupedCountry(input: SumByDateInput): [sumByDateGroupedCountry]! @requiresUser
    topLocations(input: SumByDateInput): [topLocations]! @requiresUser
  }
`;
