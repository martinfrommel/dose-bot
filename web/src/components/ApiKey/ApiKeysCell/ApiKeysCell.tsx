import type { FindApiKeys, FindApiKeysVariables } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import ApiKeys from 'src/components/ApiKey/ApiKeys'

export const QUERY: TypedDocumentNode<FindApiKeys, FindApiKeysVariables> = gql`
  query FindApiKeys {
    apiKeys {
      id
      createdAt
      updatedAt
      key
      enabled
      validUntil
      description
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      No apiKeys yet.{' '}
      <Link to={routes.newApiKey()} className="rw-link">
        Create one?
      </Link>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps<FindApiKeys>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  apiKeys,
}: CellSuccessProps<FindApiKeys, FindApiKeysVariables>) => {
  return <ApiKeys apiKeys={apiKeys} />
}
