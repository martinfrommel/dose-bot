import type {
  DeleteSubstanceMutation,
  DeleteSubstanceMutationVariables,
  FindSubstanceById,
} from 'types/graphql'

import { Link, routes, navigate } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { timeTag } from 'src/lib/formatters.js'

const DELETE_SUBSTANCE_MUTATION: TypedDocumentNode<
  DeleteSubstanceMutation,
  DeleteSubstanceMutationVariables
> = gql`
  mutation DeleteSubstanceMutation($id: String!) {
    deleteSubstance(id: $id) {
      id
    }
  }
`

interface Props {
  substance: NonNullable<FindSubstanceById['substance']>
}

const Substance = ({ substance }: Props) => {
  const [deleteSubstance] = useMutation(DELETE_SUBSTANCE_MUTATION, {
    onCompleted: () => {
      toast.success('Substance deleted')
      navigate(routes.substances())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id: DeleteSubstanceMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete substance ' + id + '?')) {
      deleteSubstance({ variables: { id } })
    }
  }

  return (
    <>
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Substance Details</h2>
          <div className="divider"></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">ID</p>
              <code className="text-sm">{substance.id}</code>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p>{timeTag(substance.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Updated</p>
              <p>{timeTag(substance.updatedAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p>{substance.name}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Description</p>
              <p>{substance.description || '-'}</p>
            </div>
          </div>
        </div>
        <div className="card-actions justify-end p-4">
          <Link
            to={routes.editSubstance({ id: substance.id })}
            className="btn btn-primary"
          >
            Edit
          </Link>
          <button
            type="button"
            className="btn btn-error"
            onClick={() => onDeleteClick(substance.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </>
  )
}

export default Substance
