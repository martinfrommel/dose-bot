import { useState } from 'react'

import { EditIcon, ListIcon, PlusIcon, TrashIcon } from 'lucide-react'
import type {
  DeleteSubstanceMutation,
  DeleteSubstanceMutationVariables,
  FindSubstanceBySlug,
} from 'types/graphql'

import { Link, routes, navigate } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import ConfirmModal from 'src/components/ConfirmModal/ConfirmModal'
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
  substance: NonNullable<FindSubstanceBySlug['substance']>
}

const Substance = ({ substance }: Props) => {
  const [deleteSubstance, { loading: deleting }] = useMutation(
    DELETE_SUBSTANCE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Substance deleted')
        navigate(routes.substances())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const openConfirm = () => setIsConfirmOpen(true)
  const closeConfirm = () => setIsConfirmOpen(false)

  const handleDelete = async (id: DeleteSubstanceMutationVariables['id']) => {
    try {
      await deleteSubstance({ variables: { id } })
    } finally {
      closeConfirm()
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
            to={routes.doses({ slug: substance.slug })}
            className="btn btn-outline"
          >
            <ListIcon className="size-4" />
            View Doses
          </Link>
          <Link
            to={routes.newDose({ slug: substance.slug })}
            className="btn btn-outline"
          >
            <PlusIcon className="size-4" />
            Add Dose
          </Link>
          <Link
            to={routes.editSubstance({ slug: substance.slug })}
            className="btn btn-primary"
          >
            <EditIcon className="size-4" />
            Edit
          </Link>
          <button
            type="button"
            className="btn btn-error"
            onClick={openConfirm}
          >
            <TrashIcon className="size-4" />
            Delete
          </button>
        </div>
      </div>

      <ConfirmModal
        open={isConfirmOpen}
        title="Delete substance?"
        body={`Delete substance ${substance.id}? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleting}
        onConfirm={() => handleDelete(substance.id)}
        onCancel={closeConfirm}
        tone="danger"
      />
    </>
  )
}

export default Substance
