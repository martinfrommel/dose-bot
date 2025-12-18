import { useState } from 'react'

import { AlertTriangle } from 'lucide-react'
import type {
  CreateApiKeyMutation,
  CreateApiKeyInput,
  CreateApiKeyMutationVariables,
  ApiKeyWithSecret,
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
      name
      key
      createdAt
      enabled
      validUntil
      description
    }
  }
`

const NewApiKey = () => {
  const [createdKey, setCreatedKey] = useState<ApiKeyWithSecret | null>(null)
  const [createApiKey, { loading, error }] = useMutation(
    CREATE_API_KEY_MUTATION,
    {
      onCompleted: (data) => {
        setCreatedKey(data.createApiKey)
        toast.success('ApiKey created')
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input: CreateApiKeyInput) => {
    createApiKey({ variables: { input } })
  }

  if (createdKey) {
    return (
      <div className="card border-2 border-success bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">API Key Created Successfully</h2>
          <div className="alert alert-warning my-4">
            <AlertTriangle className="h-6 w-6 shrink-0" />
            <span>
              {"Save your API key now. You won't be able to see it again!"}
            </span>
          </div>

          <div className="form-control w-full">
            <span className="label-text font-bold">Your API Key</span>

            <div className="relative">
              <input
                type="text"
                readOnly
                value={createdKey.key}
                className="input input-bordered w-full pr-12 font-mono text-sm"
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => {
                  navigator.clipboard.writeText(createdKey.key)
                  toast.success('Copied to clipboard')
                }}
              >
                Copy
              </button>
            </div>
          </div>

          <div className="divider"></div>

          <div className="grid grid-cols-1 gap-4 text-sm">
            <div>
              <p className="text-gray-500">ID</p>
              <code className="text-xs">{createdKey.id}</code>
            </div>
            <div>
              <p className="text-gray-500">Enabled</p>
              <p>
                {createdKey.enabled ? (
                  <span className="badge badge-success">Yes</span>
                ) : (
                  <span className="badge badge-neutral">No</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Valid Until</p>
              <p>
                {createdKey.validUntil ? (
                  new Date(createdKey.validUntil).toLocaleString()
                ) : (
                  <span className="badge badge-success">Forever</span>
                )}
              </p>
            </div>
            {createdKey.description && (
              <div>
                <p className="text-gray-500">Description</p>
                <p>{createdKey.description}</p>
              </div>
            )}
          </div>

          <div className="card-actions mt-6 justify-end">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(routes.apiKeys())}
            >
              Continue to API Keys
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h2 className="card-title">Create New API Key</h2>
        <div className="divider"></div>
        <ApiKeyForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewApiKey
