import type {
  EditDoseById,
  UpdateDoseInput,
  UpdateDoseMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'
import { useMutation } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import DoseForm from 'src/components/Dose/DoseForm'
import { useItemView } from 'src/contexts/ItemViewContext'

export const QUERY: TypedDocumentNode<EditDoseById> = gql`
  query EditDoseById($id: String!) {
    dose: dose(id: $id) {
      id
      createdAt
      updatedAt
      amount
      unit
      substanceId
    }
  }
`

const UPDATE_DOSE_MUTATION: TypedDocumentNode<
  EditDoseById,
  UpdateDoseMutationVariables
> = gql`
  mutation UpdateDoseMutation($id: String!, $input: UpdateDoseInput!) {
    updateDose(id: $id, input: $input) {
      id
      createdAt
      updatedAt
      amount
      unit
      substanceId
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div className="alert alert-error">
    <span>{error?.message}</span>
  </div>
)

export const Success = ({ dose }: CellSuccessProps<EditDoseById>) => {
  const { setDose, setCurrentPageTitle } = useItemView()

  // Set dose and page title in context when it loads
  React.useEffect(() => {
    setDose(dose)
    setCurrentPageTitle('Edit')
  }, [dose, setDose, setCurrentPageTitle])

  const [updateDose, { loading, error }] = useMutation(UPDATE_DOSE_MUTATION, {
    onCompleted: () => {
      toast.success('Dose updated')
      navigate(routes.doses())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSave = (input: UpdateDoseInput, id: EditDoseById['dose']['id']) => {
    updateDose({ variables: { id, input } })
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h2 className="card-title">Edit Dose {dose?.id}</h2>
        <DoseForm dose={dose} onSave={onSave} error={error} loading={loading} />
      </div>
    </div>
  )
}
