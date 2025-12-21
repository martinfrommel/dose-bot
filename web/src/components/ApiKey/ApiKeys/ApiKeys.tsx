import type {
  DeleteApiKeyMutation,
  DeleteApiKeyMutationVariables,
  FindApiKeys,
} from 'types/graphql'

import { useState } from 'react'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { QUERY } from 'src/components/ApiKey/ApiKeysCell'
import ConfirmModal from 'src/components/ConfirmModal/ConfirmModal'
import { timeTag, truncate } from 'src/lib/formatters.js'

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

const ApiKeysList = ({ apiKeys }: FindApiKeys) => {
  const [deleteApiKey, { loading: deleting }] = useMutation(
    DELETE_API_KEY_MUTATION,
    {
      onCompleted: () => {
        toast.success('ApiKey deleted')
      },
      onError: (error) => {
        toast.error(error.message)
      },
      // This refetches the query on the list page. Read more about other ways to
      // update the cache over here:
      // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
      refetchQueries: [{ query: QUERY }],
      awaitRefetchQueries: true,
    }
  )
  const [pendingDeleteId, setPendingDeleteId] = useState<
    DeleteApiKeyMutationVariables['id'] | null
  >(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const openConfirm = (id: DeleteApiKeyMutationVariables['id']) => {
    setPendingDeleteId(id)
    setIsConfirmOpen(true)
  }

  const closeConfirm = () => {
    setIsConfirmOpen(false)
    setPendingDeleteId(null)
  }

  const handleDelete = async () => {
    if (!pendingDeleteId) return
    try {
      await deleteApiKey({ variables: { id: pendingDeleteId } })
    } finally {
      closeConfirm()
    }
  }

  const onDeleteClick = (id: DeleteApiKeyMutationVariables['id']) => {
    openConfirm(id)
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>Id</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Enabled</th>
            <th>Valid Until</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {apiKeys.map((apiKey) => (
            <tr key={apiKey.id}>
              <td>
                <code className="text-xs">{truncate(apiKey.id)}</code>
              </td>
              <td className="text-xs">{timeTag(apiKey.createdAt)}</td>
              <td className="text-xs">{timeTag(apiKey.updatedAt)}</td>
              <td>
                {apiKey.enabled ? (
                  <span className="badge badge-success">Enabled</span>
                ) : (
                  <span className="badge badge-neutral">Disabled</span>
                )}
              </td>
              <td className="text-xs">
                {apiKey.validUntil ? (
                  timeTag(apiKey.validUntil)
                ) : (
                  <span className="badge badge-success badge-sm">Forever</span>
                )}
              </td>
              <td className="max-w-xs truncate">{apiKey.description}</td>
              <td>
                <div className="flex gap-2">
                  <Link
                    to={routes.apiKey({ id: apiKey.id })}
                    className="btn btn-xs btn-ghost"
                    title={'View apiKey ' + apiKey.id}
                  >
                    View
                  </Link>
                  <Link
                    to={routes.editApiKey({ id: apiKey.id })}
                    className="btn btn-xs btn-primary"
                    title={'Edit apiKey ' + apiKey.id}
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="btn btn-xs btn-error"
                    title={'Delete apiKey ' + apiKey.id}
                    onClick={() => onDeleteClick(apiKey.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmModal
        open={isConfirmOpen}
        title="Delete API key?"
        body={`Delete API key ${pendingDeleteId}? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={closeConfirm}
        tone="danger"
      />
    </div>
  )
}

export default ApiKeysList
