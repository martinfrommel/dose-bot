import { useState } from 'react'

import type {
  DeleteApiKeyMutation,
  DeleteApiKeyMutationVariables,
  FindApiKeyById,
} from 'types/graphql'

import { Link, routes, navigate } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import ConfirmModal from 'src/components/ConfirmModal/ConfirmModal'
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
  const [deleteApiKey, { loading: deleting }] = useMutation(
    DELETE_API_KEY_MUTATION,
    {
      onCompleted: () => {
        toast.success('ApiKey deleted')
        navigate(routes.apiKeys())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const openConfirm = () => setIsConfirmOpen(true)
  const closeConfirm = () => setIsConfirmOpen(false)

  const handleDelete = async (id: DeleteApiKeyMutationVariables['id']) => {
    try {
      await deleteApiKey({ variables: { id } })
    } finally {
      closeConfirm()
    }
  }

  const onDeleteClick = () => {
    openConfirm()
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
        <div className="card-actions justify-end p-4">
          <Link
            to={routes.editApiKey({ id: apiKey.id })}
            className="btn btn-primary"
          >
            Edit
          </Link>
          <button
            type="button"
            className="btn btn-error"
            onClick={onDeleteClick}
          >
            Delete
          </button>
        </div>
      </div>

      <ConfirmModal
        open={isConfirmOpen}
        title="Delete API key?"
        body={`Delete API key ${apiKey.id}? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleting}
        onConfirm={() => handleDelete(apiKey.id)}
        onCancel={closeConfirm}
        tone="danger"
      />
    </>
  )
}

export default ApiKey
