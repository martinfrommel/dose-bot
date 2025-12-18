import type {
  FindSubstanceById,
  FindSubstanceByIdVariables,
} from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Substance from 'src/components/Substance/Substance'

export const QUERY: TypedDocumentNode<
  FindSubstanceById,
  FindSubstanceByIdVariables
> = gql`
  query FindSubstanceById($id: String!) {
    substance: substance(id: $id) {
      id
      createdAt
      updatedAt
      name
      description
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Substance not found</div>

export const Failure = ({
  error,
}: CellFailureProps<FindSubstanceByIdVariables>) => (
  <div className="alert alert-error">
    <span>{error?.message}</span>
  </div>
)

export const Success = ({
  substance,
}: CellSuccessProps<FindSubstanceById, FindSubstanceByIdVariables>) => {
  return <Substance substance={substance} />
}
