import type {
  DeleteDoseMutation,
  DeleteDoseMutationVariables,
} from 'types/graphql'

import { routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { QUERY, FindDosesBySlug } from 'src/components/Dose/DosesCell'
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
  const [deleteDose] = useMutation(DELETE_DOSE_MUTATION, {
    onCompleted: () => {
      toast.success('Dose deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY, variables: { slug } }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (id: DeleteDoseMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete dose ' + id + '?')) {
      deleteDose({ variables: { id } })
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
                  onDelete={() => onDeleteClick(dose.id)}
                  viewTitle={'View dose ' + dose.id}
                  editTitle={'Edit dose ' + dose.id}
                  deleteTitle={'Delete dose ' + dose.id}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DosesList
