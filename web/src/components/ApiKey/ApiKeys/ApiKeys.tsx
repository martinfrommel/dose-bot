import type {
  DeleteApiKeyMutation,
  DeleteApiKeyMutationVariables,
  FindApiKeys,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { QUERY } from 'src/components/ApiKey/ApiKeysCell'
import { checkboxInputTag, timeTag, truncate } from 'src/lib/formatters.js'

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
  const [deleteApiKey] = useMutation(DELETE_API_KEY_MUTATION, {
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
  })

  const onDeleteClick = (id: DeleteApiKeyMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete apiKey ' + id + '?')) {
      deleteApiKey({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Created at</th>
            <th>Updated at</th>
            <th>Key</th>
            <th>Enabled</th>
            <th>Valid until</th>
            <th>Description</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {apiKeys.map((apiKey) => (
            <tr key={apiKey.id}>
              <td>{truncate(apiKey.id)}</td>
              <td>{timeTag(apiKey.createdAt)}</td>
              <td>{timeTag(apiKey.updatedAt)}</td>
              <td>{truncate(apiKey.key)}</td>
              <td>{checkboxInputTag(apiKey.enabled)}</td>
              <td>{timeTag(apiKey.validUntil)}</td>
              <td>{truncate(apiKey.description)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.apiKey({ id: apiKey.id })}
                    title={'Show apiKey ' + apiKey.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editApiKey({ id: apiKey.id })}
                    title={'Edit apiKey ' + apiKey.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete apiKey ' + apiKey.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(apiKey.id)}
                  >
                    Delete
                  </button>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ApiKeysList
