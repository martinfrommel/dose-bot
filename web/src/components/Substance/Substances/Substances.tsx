import type {
  DeleteSubstanceMutation,
  DeleteSubstanceMutationVariables,
  FindSubstances,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

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
  const [deleteSubstance] = useMutation(DELETE_SUBSTANCE_MUTATION, {
    onCompleted: () => {
      toast.success('Substance deleted')
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

  const onDeleteClick = (id: DeleteSubstanceMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete substance ' + id + '?')) {
      deleteSubstance({ variables: { id } })
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
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {substances.map((substance) => (
            <tr key={substance.id}>
              <td>
                <code className="text-xs">{truncate(substance.id)}</code>
              </td>
              <td className="text-xs">{timeTag(substance.createdAt)}</td>
              <td className="text-xs">{timeTag(substance.updatedAt)}</td>
              <td className="max-w-xs truncate">{substance.name}</td>
              <td className="max-w-xs truncate">{substance.description}</td>
              <td>
                <ListActions
                  viewTo={routes.substance({ id: substance.id })}
                  editTo={routes.editSubstance({ id: substance.id })}
                  onDelete={() => onDeleteClick(substance.id)}
                  viewTitle={'View substance ' + substance.id}
                  editTitle={'Edit substance ' + substance.id}
                  deleteTitle={'Delete substance ' + substance.id}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default SubstancesList
