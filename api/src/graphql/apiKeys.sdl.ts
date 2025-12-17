export const schema = gql`
  type ApiKey {
    id: String
    createdAt: DateTime!
    updatedAt: DateTime!
    key: String!
    enabled: Boolean!
    validUntil: DateTime
    description: String
  }

  type Query {
    apiKeys: [ApiKey!]! @requireAuth
    apiKey(id: String!): ApiKey @requireAuth
  }

  input CreateApiKeyInput {
    key: String!
    enabled: Boolean
    validUntil: DateTime
    description: String
  }

  input UpdateApiKeyInput {
    key: String
    enabled: Boolean
    validUntil: DateTime
    description: String
  }

  type Mutation {
    createApiKey(input: CreateApiKeyInput!): ApiKey! @requireAuth
    updateApiKey(id: String!, input: UpdateApiKeyInput!): ApiKey! @requireAuth
    deleteApiKey(id: String!): ApiKey! @requireAuth
  }
`
