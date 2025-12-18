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
    apiKeys: [ApiKey!]! @skipAuth
    apiKey(id: String!): ApiKey @skipAuth
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
    createApiKey(input: CreateApiKeyInput!): ApiKeyWithSecret! @skipAuth
    updateApiKey(id: String!, input: UpdateApiKeyInput!): ApiKey! @skipAuth
    deleteApiKey(id: String!): ApiKey! @skipAuth
  }
`
