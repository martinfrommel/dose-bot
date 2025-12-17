import { XIcon } from 'lucide-react'
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
      enabled
      validUntil
      description
    }
  }
`

export const Loading = () => (
  <div className="loading loading-lg">Loading...</div>
)

export const Empty = () => {
  return (
    <div className="py-8 text-center">
      <p className="mb-4">No API Keys yet.</p>
      <Link to={routes.newApiKey()} className="btn btn-primary">
        Create one
      </Link>
    </div>
  )
}

export const Failure = ({ errorCode }: CellFailureProps<FindApiKeys>) => (
  <div className="alert alert-error">
    <XIcon className="mr-2 h-6 w-6 shrink-0" />
    <span>Could not load API keys due to an error {`CODE: ${errorCode}`}</span>
  </div>
)

export const Success = ({
  apiKeys,
}: CellSuccessProps<FindApiKeys, FindApiKeysVariables>) => {
  return <ApiKeys apiKeys={apiKeys} />
}
