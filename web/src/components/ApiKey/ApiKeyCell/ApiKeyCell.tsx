import type { FindApiKeyById, FindApiKeyByIdVariables } from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import ApiKey from 'src/components/ApiKey/ApiKey'

export const QUERY: TypedDocumentNode<FindApiKeyById, FindApiKeyByIdVariables> =
  gql`
    query FindApiKeyById($id: String!) {
      apiKey: apiKey(id: $id) {
        id
        createdAt
        updatedAt
        enabled
        validUntil
        description
      }
    }
  `

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>ApiKey not found</div>

export const Failure = ({
  error,
}: CellFailureProps<FindApiKeyByIdVariables>) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  apiKey,
}: CellSuccessProps<FindApiKeyById, FindApiKeyByIdVariables>) => {
  return <ApiKey apiKey={apiKey} />
}
