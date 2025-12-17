import { XCircle } from 'lucide-react'
import type {
  EditApiKeyById,
  UpdateApiKeyInput,
  UpdateApiKeyMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'
import { useMutation } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import ApiKeyForm from 'src/components/ApiKey/ApiKeyForm'

export const QUERY: TypedDocumentNode<EditApiKeyById> = gql`
  query EditApiKeyById($id: String!) {
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

const UPDATE_API_KEY_MUTATION: TypedDocumentNode<
  EditApiKeyById,
  UpdateApiKeyMutationVariables
> = gql`
  mutation UpdateApiKeyMutation($id: String!, $input: UpdateApiKeyInput!) {
    updateApiKey(id: $id, input: $input) {
      id
      createdAt
      updatedAt
      enabled
      validUntil
      description
    }
  }
`

export const Loading = () => <div className="loading">Loading...</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div className="alert alert-error">
    <XCircle className="h-6 w-6 shrink-0" />
    <span>{error?.message}</span>
  </div>
)

export const Success = ({ apiKey }: CellSuccessProps<EditApiKeyById>) => {
  const [updateApiKey, { loading, error }] = useMutation(
    UPDATE_API_KEY_MUTATION,
    {
      onCompleted: () => {
        toast.success('ApiKey updated')
        navigate(routes.apiKeys())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (
    input: UpdateApiKeyInput,
    id: EditApiKeyById['apiKey']['id']
  ) => {
    updateApiKey({ variables: { id, input } })
  }

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h2 className="card-title">Edit API Key {apiKey?.id}</h2>
        <div className="divider"></div>
        <ApiKeyForm
          apiKey={apiKey}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
