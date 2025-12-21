import { useState } from 'react'

import type {
  DeleteSubstanceMutation,
  DeleteSubstanceMutationVariables,
  FindSubstances,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import ListActions from 'src/components/ListActions/ListActions'
import ConfirmModal from 'src/components/ConfirmModal/ConfirmModal'
import { QUERY } from 'src/components/Substance/SubstancesCell'
import { timeTag, truncate } from 'src/lib/formatters.js'

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

const SubstancesList = ({ substances }: FindSubstances) => {
  const [deleteSubstance, { loading: deleting }] = useMutation(
    DELETE_SUBSTANCE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Substance deleted')
      },
      onError: (error) => {
        toast.error(error.message)
      },
      refetchQueries: [{ query: QUERY }],
      awaitRefetchQueries: true,
    }
  )
  const [pendingDeleteId, setPendingDeleteId] = useState<
    DeleteSubstanceMutationVariables['id'] | null
  >(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const openConfirm = (id: DeleteSubstanceMutationVariables['id']) => {
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
      await deleteSubstance({ variables: { id: pendingDeleteId } })
    } finally {
      closeConfirm()
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>ID</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {substances.map((substance) => (
            <tr key={substance.id}>
              <td className="max-w-xs truncate text-lg font-bold">
                <Link to={routes.substance({ slug: substance.slug })}>
                  {substance.name}
                </Link>
              </td>
              <td className="max-w-xs truncate">{substance.description}</td>
              <td>
                <code className="text-xs">{truncate(substance.id)}</code>
              </td>
              <td className="text-xs">{timeTag(substance.createdAt)}</td>
              <td className="text-xs">{timeTag(substance.updatedAt)}</td>
              <td>
                <ListActions
                  viewTo={routes.substance({ slug: substance.slug })}
                  editTo={routes.editSubstance({ slug: substance.slug })}
                  onDelete={() => openConfirm(substance.id)}
                  viewTitle={'View substance ' + substance.name}
                  editTitle={'Edit substance ' + substance.name}
                  deleteTitle={'Delete substance ' + substance.name}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmModal
        open={isConfirmOpen}
        title="Delete substance?"
        body={`Delete substance ${pendingDeleteId}? This cannot be undone.`}
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

export default SubstancesList
