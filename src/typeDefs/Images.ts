import gql from "graphql-tag";

export default gql`
  input ImageInput {
    url: String!
    width: Int!
    height: Int!
  }

  type Image {
    url: String!
    width: Int!
    height: Int!
  }
`;
