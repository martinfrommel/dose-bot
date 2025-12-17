import type {
  DeleteApiKeyMutation,
  DeleteApiKeyMutationVariables,
  FindApiKeyById,
} from 'types/graphql'

import { Link, routes, navigate } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { timeTag } from 'src/lib/formatters.js'

const DELETE_API_KEY_MUTATION: TypedDocumentNode<
  DeleteApiKeyMutation,
  DeleteApiKeyMutationVariables
> = gql`
  mutation DeleteApiKeyMutation($id: String!) {
    deleteApiKey(id: $id) {
      id
    }
  }
`

interface Props {
  apiKey: NonNullable<FindApiKeyById['apiKey']>
}

const ApiKey = ({ apiKey }: Props) => {
  const [deleteApiKey] = useMutation(DELETE_API_KEY_MUTATION, {
    onCompleted: () => {
      toast.success('ApiKey deleted')
      navigate(routes.apiKeys())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id: DeleteApiKeyMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete apiKey ' + id + '?')) {
      deleteApiKey({ variables: { id } })
    }
  }

  return (
    <>
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">API Key Details</h2>
          <div className="divider"></div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-sm text-gray-500">ID</p>
              <code className="text-sm">{apiKey.id}</code>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p>{timeTag(apiKey.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Updated</p>
              <p>{timeTag(apiKey.updatedAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p>
                {apiKey.enabled ? (
                  <span className="badge badge-success">Enabled</span>
                ) : (
                  <span className="badge badge-neutral">Disabled</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Valid Until</p>
              <p>
                {apiKey.validUntil ? (
                  timeTag(apiKey.validUntil)
                ) : (
                  <span className="badge badge-success">Forever</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p>{apiKey.description || '-'}</p>
            </div>
          </div>
        </div>
        <div className="card-actions justify-end">
          <Link
            to={routes.editApiKey({ id: apiKey.id })}
            className="btn btn-primary"
          >
            Edit
          </Link>
          <button
            type="button"
            className="btn btn-error"
            onClick={() => onDeleteClick(apiKey.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </>
  )
}

export default ApiKey
