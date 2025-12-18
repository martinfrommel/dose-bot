import type {
  CreateSubstanceMutation,
  CreateSubstanceInput,
  CreateSubstanceMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import SubstanceForm from 'src/components/Substance/SubstanceForm'

const CREATE_SUBSTANCE_MUTATION: TypedDocumentNode<
  CreateSubstanceMutation,
  CreateSubstanceMutationVariables
> = gql`
  mutation CreateSubstanceMutation($input: CreateSubstanceInput!) {
    createSubstance(input: $input) {
      id
    }
  }
`

const NewSubstance = () => {
  const [createSubstance, { loading, error }] = useMutation(
    CREATE_SUBSTANCE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Substance created')
        navigate(routes.substances())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input: CreateSubstanceInput) => {
    createSubstance({ variables: { input } })
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h2 className="card-title">New Substance</h2>
        <SubstanceForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewSubstance
