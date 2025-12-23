export const schema = gql`
  type Substance {
    id: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    name: String!
    description: String
    unit: Unit
    slug: String!
    doses: [Dose]!
  }

  type Query {
    substances: [Substance!]! @requireAuth
    substance(id: String!): Substance @requireAuth
    substanceBySlug(slug: String!): Substance @requireAuth
  }

  input CreateSubstanceInput {
    name: String!
    description: String
    unit: Unit!
  }

  input UpdateSubstanceInput {
    name: String
    description: String
    unit: Unit
  }

  type Mutation {
    createSubstance(input: CreateSubstanceInput!): Substance! @requireAuth
    updateSubstance(id: String!, input: UpdateSubstanceInput!): Substance!
      @requireAuth
    deleteSubstance(id: String!): Substance! @requireAuth
    deleteSubstances(ids: [String!]!): Int! @requireAuth
  }
`
