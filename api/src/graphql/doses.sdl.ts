export const schema = gql`
  type Dose {
    id: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    amount: Float!
    unit: Unit!
    substance: Substance!
    substanceId: String!
  }

  enum Unit {
    MG
    ML
    G
    IU
  }

  type Query {
    doses: [Dose!]! @requireAuth
    dose(id: String!): Dose @requireAuth
  }

  input CreateDoseInput {
    amount: Float!
    unit: Unit
    substanceId: String!
  }

  input UpdateDoseInput {
    amount: Float
    unit: Unit
    substanceId: String
  }

  type Mutation {
    createDose(input: CreateDoseInput!): Dose! @requireAuth
    updateDose(id: String!, input: UpdateDoseInput!): Dose! @requireAuth
    deleteDose(id: String!): Dose! @requireAuth
    deleteDoses(ids: [String!]!): Int! @requireAuth
  }
`
