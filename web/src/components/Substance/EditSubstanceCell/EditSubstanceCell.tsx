import type {
  EditSubstanceBySlug,
  UpdateSubstanceInput,
  UpdateSubstanceMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'
import { useMutation } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import SubstanceForm from 'src/components/Substance/SubstanceForm'
import { useItemView } from 'src/contexts/ItemViewContext'

export const QUERY: TypedDocumentNode<EditSubstanceBySlug> = gql`
  query EditSubstanceBySlug($slug: String!) {
    substance: substanceBySlug(slug: $slug) {
      id
      createdAt
      updatedAt
      name
      description
      slug
    }
  }
`

const UPDATE_SUBSTANCE_MUTATION: TypedDocumentNode<
  EditSubstanceBySlug,
  UpdateSubstanceMutationVariables
> = gql`
  mutation UpdateSubstanceMutation(
    $id: String!
    $input: UpdateSubstanceInput!
  ) {
    updateSubstance(id: $id, input: $input) {
      id
      createdAt
      updatedAt
      name
      description
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div className="alert alert-error">
    <span>{error?.message}</span>
  </div>
)

export const Success = ({
  substance,
}: CellSuccessProps<EditSubstanceBySlug>) => {
  const { setSubstance } = useItemView()

  // Set substance in context when it loads
  React.useEffect(() => {
    setSubstance(substance)
  }, [substance, setSubstance])

  const [updateSubstance, { loading, error }] = useMutation(
    UPDATE_SUBSTANCE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Substance updated')
        navigate(routes.substance({ slug: substance?.slug || '' }))
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (
    input: UpdateSubstanceInput,
    id: EditSubstanceBySlug['substance']['id']
  ) => {
    updateSubstance({ variables: { id, input } })
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h2 className="card-title">Edit Substance {substance?.name}</h2>
        <SubstanceForm
          substance={substance}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
