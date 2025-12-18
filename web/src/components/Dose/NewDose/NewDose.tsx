import type {
  CreateDoseMutation,
  CreateDoseInput,
  CreateDoseMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import DoseForm from 'src/components/Dose/DoseForm'

const CREATE_DOSE_MUTATION: TypedDocumentNode<
  CreateDoseMutation,
  CreateDoseMutationVariables
> = gql`
  mutation CreateDoseMutation($input: CreateDoseInput!) {
    createDose(input: $input) {
      id
    }
  }
`

const NewDose = () => {
  const [createDose, { loading, error }] = useMutation(CREATE_DOSE_MUTATION, {
    onCompleted: () => {
      toast.success('Dose created')
      navigate(routes.doses())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSave = (input: CreateDoseInput) => {
    createDose({ variables: { input } })
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h2 className="card-title">New Dose</h2>
        <DoseForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewDose
