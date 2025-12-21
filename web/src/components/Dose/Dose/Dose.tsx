import { useState } from 'react'

import type {
  DeleteDoseMutation,
  DeleteDoseMutationVariables,
  FindDoseById,
} from 'types/graphql'

import { Link, routes, navigate } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import ConfirmModal from 'src/components/ConfirmModal/ConfirmModal'
import { formatEnum, timeTag } from 'src/lib/formatters.js'

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

interface Props {
  dose: NonNullable<FindDoseById['dose']>
  slug: string
}

const Dose = ({ dose, slug }: Props) => {
  const [deleteDose, { loading: deleting }] = useMutation(
    DELETE_DOSE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Dose deleted')
        navigate(routes.doses({ slug }))
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const openConfirm = () => setIsConfirmOpen(true)
  const closeConfirm = () => setIsConfirmOpen(false)

  const handleDelete = async (id: DeleteDoseMutationVariables['id']) => {
    try {
      await deleteDose({ variables: { id } })
    } finally {
      closeConfirm()
    }
  }

  return (
    <>
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Dose Details</h2>
          <div className="divider"></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">ID</p>
              <code className="text-sm">{dose.id}</code>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p>{timeTag(dose.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Updated</p>
              <p>{timeTag(dose.updatedAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p>{dose.amount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Unit</p>
              <p>
                <span className="badge badge-outline">
                  {formatEnum(dose.unit)}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Substance ID</p>
              <code className="text-sm">{dose.substanceId}</code>
            </div>
          </div>
        </div>
        <div className="card-actions justify-end p-4">
          <Link
            to={routes.editDose({ slug, id: dose.id })}
            className="btn btn-primary"
          >
            Edit
          </Link>
          <button
            type="button"
            className="btn btn-error"
            onClick={openConfirm}
          >
            Delete
          </button>
        </div>
      </div>

      <ConfirmModal
        open={isConfirmOpen}
        title="Delete dose?"
        body={`Delete dose ${dose.id}? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleting}
        onConfirm={() => handleDelete(dose.id)}
        onCancel={closeConfirm}
        tone="danger"
      />
    </>
  )
}

export default Dose
