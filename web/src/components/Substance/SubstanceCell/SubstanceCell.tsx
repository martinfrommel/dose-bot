import type {
  FindSubstanceBySlug,
  FindSubstanceBySlugVariables,
} from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import BackButton from 'src/components/BackButton/BackButton'
import Substance from 'src/components/Substance/Substance'
import { useItemView } from 'src/contexts/ItemViewContext'

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

export const Empty = () => (
  <section>
    <h3>Substance not found</h3>
    <BackButton />
  </section>
)

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
  const { setSubstance } = useItemView()

  // Set substance in context when it loads
  React.useEffect(() => {
    setSubstance(substance)
  }, [substance, setSubstance])

  return <Substance substance={substance} />
}
