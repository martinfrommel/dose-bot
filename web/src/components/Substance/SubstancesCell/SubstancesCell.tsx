import type { FindSubstances, FindSubstancesVariables } from 'types/graphql'

import { routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import EmptyState from 'src/components/EmptyState/EmptyState'
import Substances from 'src/components/Substance/Substances'

export const QUERY: TypedDocumentNode<FindSubstances, FindSubstancesVariables> =
  gql`
    query FindSubstances {
      substances {
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

export const Empty = () => {
  return (
    <EmptyState
      title="No substances yet."
      createLink={routes.newSubstance()}
      createLabel="Create one"
    />
  )
}

export const Failure = ({ error }: CellFailureProps<FindSubstances>) => (
  <section className="alert alert-error">
    <span>{error?.message}</span>
  </section>
)

export const Success = ({
  substances,
}: CellSuccessProps<FindSubstances, FindSubstancesVariables>) => {
  return <Substances substances={substances} />
}
