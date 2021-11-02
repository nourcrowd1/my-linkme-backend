import gql from "graphql-tag";

export default gql`
  type Mutation {
    signInWithGoogle(token: String!): AuthorizedUser
    signInWithCrowd1(token: String!): AuthorizedUser
  }
`;
