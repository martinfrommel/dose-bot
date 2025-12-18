import { XIcon } from 'lucide-react'
import type { FindApiKeys, FindApiKeysVariables } from 'types/graphql'

import { routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import ApiKeys from 'src/components/ApiKey/ApiKeys'
import EmptyState from 'src/components/EmptyState/EmptyState'

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
    <EmptyState
      title="No API Keys yet."
      createLink={routes.newApiKey()}
      createLabel="Create one"
    />
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
