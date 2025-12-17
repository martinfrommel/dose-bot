import type {
  CreateApiKeyMutation,
  CreateApiKeyInput,
  CreateApiKeyMutationVariables,
} from 'types/graphql'

import { navigate, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import ApiKeyForm from 'src/components/ApiKey/ApiKeyForm'

const CREATE_API_KEY_MUTATION: TypedDocumentNode<
  CreateApiKeyMutation,
  CreateApiKeyMutationVariables
> = gql`
  mutation CreateApiKeyMutation($input: CreateApiKeyInput!) {
    createApiKey(input: $input) {
      id
    }
  }
`

const NewApiKey = () => {
  const [createApiKey, { loading, error }] = useMutation(
    CREATE_API_KEY_MUTATION,
    {
      onCompleted: () => {
        toast.success('ApiKey created')
        navigate(routes.apiKeys())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input: CreateApiKeyInput) => {
    createApiKey({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New ApiKey</h2>
      </header>
      <div className="rw-segment-main">
        <ApiKeyForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewApiKey
