export const schema = gql`
  type ApiKey {
    id: String!
    name: String
    createdAt: DateTime!
    updatedAt: DateTime!
    enabled: Boolean!
    validUntil: DateTime
    description: String
  }

  type ApiKeyWithSecret {
    id: String!
    name: String
    createdAt: DateTime
    updatedAt: DateTime
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
    enabled: Boolean
    name: String
    validUntil: DateTime
    description: String
  }

  input UpdateApiKeyInput {
    enabled: Boolean
    name: String
    validUntil: DateTime
    description: String
  }

  type Mutation {
    createApiKey(input: CreateApiKeyInput!): ApiKeyWithSecret! @requireAuth
    updateApiKey(id: String!, input: UpdateApiKeyInput!): ApiKey! @requireAuth
    deleteApiKey(id: String!): ApiKey! @requireAuth
    deleteApiKeys(ids: [String!]!): Int! @requireAuth
  }
`
