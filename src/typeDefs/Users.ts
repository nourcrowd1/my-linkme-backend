import gql from "graphql-tag";

/**
 * Everything related to user accounts
 */
export default gql`
  input UserRegistrationInput {
    username: String!
    email: String!
    password: String!
    isFreeze: Boolean
  }
  
  input sendRestorePasswordEmailInput {
    email: String
  }

  type UserRegistrationValidationResult {
    username: String
    email: String
  }
  
  type UserRestorePasswordResult {
    accepted: [String!]!
  }

  input UserUpdateInput {
    username: String
    email: String
    password: String
    avatar: ImageInput
    intro: String
    name: String
    enable_partner_links: Boolean
    ext_provider: String
    isFreeze: Boolean
  }
  
  input UserUpdateWithoutSubscriptionInput {
    username: String
    email: String
  }
  
  input UserPasswordChangeInput {
    currentPassword: String
    password: String
  }
  
  input UserPasswordChangeByTokenInput {
    token: String
    email: String
    password: String
  }
  
  input Test {
    limit: Int
  }

  enum UserOrder {
    email
    username
    id
    created
    updated
  }

  type User {
    id: ID!
    created: Date!
    username: String!
    email: String!
    avatar: Image
    intro: String
    name: String
    isFreeze: Boolean
    ext_provider: String
    enable_partner_links: Boolean
    payments:[Payment]
    subscription: SubscriptionInfo
  }

  type AuthorizedUser {
    user: User
    token: String
    crowdToken: String
  }

  type UsersList {
    items: [User]!
    total: Int!
    nextOffset: Int
  }

  type Query {
    # for customers
    me: User @requiresUser
    # for admins
    user(id: ID!): User @requiresAdmin
    users(input: ListParameters): UsersList @requiresAdmin
  }

  type Mutation {
    # for customers
    login(email: String!, password: String!): AuthorizedUser
    validateAccount(
      email: String
      username: String
    ): UserRegistrationValidationResult
    createAccount(input: UserRegistrationInput!): AuthorizedUser
    updateAccount(id: ID!, input: UserUpdateInput!): User @requiresSubscription
    updateAccountWithoutSubscription(id: ID!, input: UserUpdateWithoutSubscriptionInput!): User @requiresUser
    deleteAccount: OperationResult @requiresUser
    
    changePassword(input: UserPasswordChangeInput!): User @requiresUser
    changePasswordByToken(input: UserPasswordChangeByTokenInput!): User
    sendRestorePasswordEmail(input: sendRestorePasswordEmailInput!): UserRestorePasswordResult
    
    # for admins
    createUser(input: UserUpdateInput!): User @requiresAdmin
    updateUser(id: ID!, input: UserUpdateInput!): User @requiresAdmin
    deleteUser(id: ID!): OperationResult @requiresAdmin
    deleteUserSubscription(userId: ID!): OperationResult @requiresAdmin
   
  }
`;
