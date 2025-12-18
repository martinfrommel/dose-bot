export const schema = gql`
  enum Role {
    Admin
    User
  }

  type User {
    id: Int!
    email: String!
    role: Role!
    webAuthnChallenge: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    users: [User!]! @requireAuth
    user(id: Int!): User @requireAuth
  }

  type Mutation {
    createUser(email: String!, plainPassword: String!, role: Role): User! @requireAuth
    resetUserPassword(userId: Int!): String! @requireAuth
    updateUser(id: Int!, email: String, role: Role): User! @requireAuth
    deleteUser(id: Int!): User! @requireAuth
  }
`
