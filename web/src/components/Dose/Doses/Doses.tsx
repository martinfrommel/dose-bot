import { useState } from 'react'

import type {
  DeleteDoseMutation,
  DeleteDoseMutationVariables,
} from 'types/graphql'

import { routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { QUERY, FindDosesBySlug } from 'src/components/Dose/DosesCell'
import ConfirmModal from 'src/components/ConfirmModal/ConfirmModal'
import ListActions from 'src/components/ListActions/ListActions'
import { timeTag, truncate } from 'src/lib/formatters.js'

const DELETE_DOSE_MUTATION: TypedDocumentNode<
  DeleteDoseMutation,
  DeleteDoseMutationVariables
> = gql`
  mutation DeleteDoseMutation($id: String!) {
    deleteDose(id: $id) {
      id
    }
  }
`

type DosesProps = {
  substance: NonNullable<FindDosesBySlug['substance']>
}
const DosesList = ({ substance }: DosesProps) => {
  const { doses, slug } = substance
  const [deleteDose, { loading: deleting }] = useMutation(
    DELETE_DOSE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Dose deleted')
      },
      onError: (error) => {
        toast.error(error.message)
      },
      refetchQueries: [{ query: QUERY, variables: { slug } }],
      awaitRefetchQueries: true,
    }
  )
  const [pendingDeleteId, setPendingDeleteId] = useState<
    DeleteDoseMutationVariables['id'] | null
  >(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const openConfirm = (id: DeleteDoseMutationVariables['id']) => {
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
      await deleteDose({ variables: { id: pendingDeleteId } })
    } finally {
      closeConfirm()
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>Id</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Amount</th>
            <th>Unit</th>
            <th>Substance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {doses.map((dose) => (
            <tr key={dose.id}>
              <td>
                <code className="text-xs">{truncate(dose.id)}</code>
              </td>
              <td className="text-xs">{timeTag(dose.createdAt)}</td>
              <td className="text-xs">{timeTag(dose.updatedAt)}</td>
              <td>{dose.amount}</td>
              <td>
                <span className="badge badge-outline">{dose.unit}</span>
              </td>
              <td>
                <code className="text-xs">{truncate(dose.substanceId)}</code>
              </td>
              <td>
                <ListActions
                  viewTo={routes.dose({
                    slug,
                    id: dose.id,
                  })}
                  editTo={routes.editDose({
                    slug,
                    id: dose.id,
                  })}
                  onDelete={() => openConfirm(dose.id)}
                  viewTitle={'View dose ' + dose.id}
                  editTitle={'Edit dose ' + dose.id}
                  deleteTitle={'Delete dose ' + dose.id}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmModal
        open={isConfirmOpen}
        title="Delete dose?"
        body={`Delete dose ${pendingDeleteId}? This cannot be undone.`}
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

export default DosesList
