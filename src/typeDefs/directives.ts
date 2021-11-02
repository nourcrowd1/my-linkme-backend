import gql from "graphql-tag";

export default gql`
  directive @requiresUser on FIELD_DEFINITION
  directive @requiresAdmin on FIELD_DEFINITION
  directive @requiresSubscription on FIELD_DEFINITION
  directive @requiresAuthorized on FIELD_DEFINITION
`;
