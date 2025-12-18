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
    <div className="text-center">
      No substances yet.{' '}
      <Link to={routes.newSubstance()} className="btn btn-primary btn-sm">
        Create one
      </Link>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps<FindSubstances>) => (
  <div className="alert alert-error">
    <span>{error?.message}</span>
  </div>
)

export const Success = ({
  substances,
}: CellSuccessProps<FindSubstances, FindSubstancesVariables>) => {
  return <Substances substances={substances} />
}
