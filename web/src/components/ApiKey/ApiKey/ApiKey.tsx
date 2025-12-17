import type {
  DeleteApiKeyMutation,
  DeleteApiKeyMutationVariables,
  FindApiKeyById,
} from 'types/graphql'

import { Link, routes, navigate } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { checkboxInputTag, timeTag } from 'src/lib/formatters.js'

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
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            ApiKey {apiKey.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{apiKey.id}</td>
            </tr>
            <tr>
              <th>Created at</th>
              <td>{timeTag(apiKey.createdAt)}</td>
            </tr>
            <tr>
              <th>Updated at</th>
              <td>{timeTag(apiKey.updatedAt)}</td>
            </tr>
            <tr>
              <th>Key</th>
              <td>{apiKey.key}</td>
            </tr>
            <tr>
              <th>Enabled</th>
              <td>{checkboxInputTag(apiKey.enabled)}</td>
            </tr>
            <tr>
              <th>Valid until</th>
              <td>{timeTag(apiKey.validUntil)}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td>{apiKey.description}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editApiKey({ id: apiKey.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(apiKey.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default ApiKey
