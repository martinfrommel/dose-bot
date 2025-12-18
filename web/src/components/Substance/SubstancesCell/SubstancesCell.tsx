import type { FindSubstances, FindSubstancesVariables } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

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
    <section className="block min-h-24 space-y-3 text-center">
      <h3>No substances yet.</h3>
      <Link to={routes.newSubstance()} className="btn btn-primary btn-sm">
        Create one
      </Link>
    </section>
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
