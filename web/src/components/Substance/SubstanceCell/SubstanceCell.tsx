import type {
  FindSubstanceBySlug,
  FindSubstanceBySlugVariables,
} from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Substance from 'src/components/Substance/Substance'

export const QUERY: TypedDocumentNode<
  FindSubstanceBySlug,
  FindSubstanceBySlugVariables
> = gql`
  query FindSubstanceBySlug($slug: String!) {
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

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Substance not found</div>

export const Failure = ({
  error,
}: CellFailureProps<FindSubstanceBySlugVariables>) => (
  <div className="alert alert-error">
    <span>{error?.message}</span>
  </div>
)

export const Success = ({
  substance,
}: CellSuccessProps<FindSubstanceBySlug, FindSubstanceBySlugVariables>) => {
  return <Substance substance={substance} />
}
