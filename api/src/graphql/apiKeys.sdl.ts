export const schema = gql`
  type ApiKey {
    id: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    key: String!
    enabled: Boolean!
    validUntil: DateTime
    description: String
  }

  type Query {
    apiKeys: [ApiKey!]! @overrideAuth @requireAuth
    apiKey(id: String!): ApiKey @overrideAuth @requireAuth
  }

  input CreateApiKeyInput {
    key: String!
    enabled: Boolean!
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
    createApiKey(input: CreateApiKeyInput!): ApiKey! @overrideAuth @requireAuth
    updateApiKey(id: String!, input: UpdateApiKeyInput!): ApiKey!
      @overrideAuth
      @requireAuth
    deleteApiKey(id: String!): ApiKey! @overrideAuth @requireAuth
  }
`
