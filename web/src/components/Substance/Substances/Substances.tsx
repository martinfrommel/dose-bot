import type {
  DeleteSubstanceMutation,
  DeleteSubstanceMutationVariables,
  FindSubstances,
} from 'types/graphql'

import { useMemo, useState } from 'react'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { RowSelectionState } from '@tanstack/react-table'

import ConfirmModal from 'src/components/ConfirmModal/ConfirmModal'
import { QUERY } from 'src/components/Substance/SubstancesCell'
import { timeTag, truncate } from 'src/lib/formatters.js'

type SubstanceRow = FindSubstances['substances'][number]

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

type DeleteSubstancesBulkMutation = { deleteSubstances: number }
type DeleteSubstancesBulkVariables = { ids: string[] }

const DELETE_SUBSTANCES_BULK_MUTATION: TypedDocumentNode<
  DeleteSubstancesBulkMutation,
  DeleteSubstancesBulkVariables
> = gql`
  mutation DeleteSubstancesBulkMutation($ids: [String!]!) {
    deleteSubstances(ids: $ids)
  }
`

const columnHelper = createColumnHelper<SubstanceRow>()

const SubstancesList = ({ substances }: FindSubstances) => {
  const [deleteSubstance, { loading: deletingSingle }] = useMutation(
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

  const [deleteSubstancesBulk, { loading: deletingBulk }] = useMutation(
    DELETE_SUBSTANCES_BULK_MUTATION,
    {
      onCompleted: ({ deleteSubstances }) => {
        toast.success(
          `Deleted ${deleteSubstances} substance${deleteSubstances === 1 ? '' : 's'}`
        )
      },
      onError: (error) => {
        toast.error(error.message)
      },
      refetchQueries: [{ query: QUERY }],
      awaitRefetchQueries: true,
    }
  )

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Select all substances on page"
            ref={(input) => {
              if (input) {
                input.indeterminate =
                  table.getIsSomePageRowsSelected() &&
                  !table.getIsAllPageRowsSelected()
              }
            }}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            aria-label={`Select substance ${row.original.name}`}
          />
        ),
        size: 48,
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row, getValue }) => (
          <Link
            to={routes.substance({ slug: row.original.slug })}
            className="font-semibold"
          >
            {getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: ({ getValue }) => (
          <span className="max-w-xs truncate" title={getValue() ?? ''}>
            {getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('id', {
        header: 'ID',
        cell: ({ getValue }) => (
          <code className="text-xs">{truncate(getValue())}</code>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created',
        cell: ({ getValue }) => <span className="text-xs">{timeTag(getValue())}</span>,
      }),
      columnHelper.accessor('updatedAt', {
        header: 'Updated',
        cell: ({ getValue }) => <span className="text-xs">{timeTag(getValue())}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Link
              to={routes.substance({ slug: row.original.slug })}
              className="btn btn-ghost btn-xs"
              title={'View substance ' + row.original.name}
            >
              View
            </Link>
            <Link
              to={routes.editSubstance({ slug: row.original.slug })}
              className="btn btn-primary btn-xs"
              title={'Edit substance ' + row.original.name}
            >
              Edit
            </Link>
            <button
              type="button"
              className="btn btn-error btn-xs"
              title={'Delete substance ' + row.original.name}
              onClick={() => {
                setPendingDeleteId(row.original.id)
                setIsConfirmOpen(true)
              }}
            >
              Delete
            </button>
          </div>
        ),
      }),
    ],
    []
  )

  const table = useReactTable({
    data: substances,
    columns,
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  })

  const selectedIds = table.getSelectedRowModel().flatRows.map((row) => row.original.id)
  const selectedCount = selectedIds.length

  const closeConfirm = () => {
    setIsConfirmOpen(false)
    setPendingDeleteId(null)
  }

  const closeBulkConfirm = () => {
    setIsBulkConfirmOpen(false)
  }

  const handleDelete = async () => {
    if (!pendingDeleteId) return
    try {
      await deleteSubstance({ variables: { id: pendingDeleteId } })
    } finally {
      closeConfirm()
    }
  }

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return
    try {
      await deleteSubstancesBulk({ variables: { ids: selectedIds } })
      setRowSelection({})
    } finally {
      closeBulkConfirm()
    }
  }

  const bulkBodyPreview = () => {
    if (!selectedIds.length) return null
    const preview = selectedIds.slice(0, 3).join(', ')
    const more = selectedIds.length > 3 ? '…' : ''
    return `Delete ${selectedIds.length} substance${
      selectedIds.length === 1 ? '' : 's'
    } (${preview}${more})? This cannot be undone.`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Substances</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-base-content/70">
            {selectedCount} selected
          </span>
          <button
            type="button"
            className="btn btn-error btn-sm"
            disabled={!selectedCount || deletingBulk}
            onClick={() => setIsBulkConfirmOpen(true)}
          >
            Delete selected
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className={row.getIsSelected() ? 'active' : ''}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={isConfirmOpen}
        title="Delete substance?"
        body={`Delete substance ${pendingDeleteId}? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deletingSingle}
        onConfirm={handleDelete}
        onCancel={closeConfirm}
        tone="danger"
      />

      <ConfirmModal
        open={isBulkConfirmOpen}
        title="Delete selected substances?"
        body={bulkBodyPreview()}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deletingBulk}
        onConfirm={handleBulkDelete}
        onCancel={closeBulkConfirm}
        tone="danger"
      />
    </div>
  )
}

export default SubstancesList
