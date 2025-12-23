import { Fragment, useMemo, useState } from 'react'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { RowSelectionState } from '@tanstack/react-table'
import type {
  DeleteDoseMutation,
  DeleteDoseMutationVariables,
  FindDosesBySlug,
} from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import { useMutation } from '@cedarjs/web'
import type { TypedDocumentNode } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import ConfirmModal from 'src/components/ConfirmModal/ConfirmModal'
import { QUERY } from 'src/components/Dose/DosesCell'
import { timeTag, truncate } from 'src/lib/formatters.js'

type DoseRow = NonNullable<FindDosesBySlug['substance']>['doses'][number]

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

type DeleteDosesBulkMutation = { deleteDoses: number }
type DeleteDosesBulkVariables = { ids: string[] }

const DELETE_DOSES_BULK_MUTATION: TypedDocumentNode<
  DeleteDosesBulkMutation,
  DeleteDosesBulkVariables
> = gql`
  mutation DeleteDosesBulkMutation($ids: [String!]!) {
    deleteDoses(ids: $ids)
  }
`

type DosesProps = {
  substance: NonNullable<FindDosesBySlug['substance']>
}
const columnHelper = createColumnHelper<DoseRow>()

const DosesList = ({ substance }: DosesProps) => {
  const { doses, slug } = substance

  const sortedDoses = useMemo(() => {
    return [...doses].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [doses])

  const canonicalUnit = substance.unit || sortedDoses[0]?.unit
  const [deleteDose, { loading: deletingSingle }] = useMutation(
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

  const [deleteDosesBulk, { loading: deletingBulk }] = useMutation(
    DELETE_DOSES_BULK_MUTATION,
    {
      onCompleted: ({ deleteDoses }) => {
        toast.success(
          `Deleted ${deleteDoses} dose${deleteDoses === 1 ? '' : 's'}`
        )
      },
      onError: (error) => {
        toast.error(error.message)
      },
      refetchQueries: [{ query: QUERY, variables: { slug } }],
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
            aria-label="Select all doses on page"
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
            aria-label={`Select dose ${row.original.id}`}
          />
        ),
        size: 48,
      }),
      columnHelper.accessor('id', {
        header: 'Id',
        cell: ({ getValue }) => (
          <code className="text-xs">{truncate(getValue())}</code>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created',
        cell: ({ getValue }) => (
          <span className="text-xs">{timeTag(getValue())}</span>
        ),
      }),
      columnHelper.accessor('updatedAt', {
        header: 'Updated',
        cell: ({ getValue }) => (
          <span className="text-xs">{timeTag(getValue())}</span>
        ),
      }),
      columnHelper.accessor('amount', {
        header: 'Amount',
        cell: ({ getValue }) => getValue(),
      }),
      columnHelper.accessor('unit', {
        header: 'Unit',
        cell: ({ getValue }) => (
          <span className="badge badge-outline">{getValue()}</span>
        ),
      }),
      columnHelper.accessor('substanceId', {
        header: 'Substance',
        cell: ({ getValue }) => (
          <code className="text-xs">{truncate(getValue())}</code>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Link
              to={routes.dose({ slug, id: row.original.id })}
              className="btn btn-ghost btn-xs"
              title={'View dose ' + row.original.id}
            >
              View
            </Link>
            <Link
              to={routes.editDose({ slug, id: row.original.id })}
              className="btn btn-primary btn-xs"
              title={'Edit dose ' + row.original.id}
            >
              Edit
            </Link>
            <button
              type="button"
              className="btn btn-error btn-xs"
              title={'Delete dose ' + row.original.id}
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
    [slug]
  )

  const table = useReactTable({
    data: sortedDoses,
    columns,
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  })

  const groupedRows = useMemo(() => {
    type TableRow = ReturnType<typeof table.getRowModel>['rows'][number]
    const groups: Array<{
      dayKey: string
      label: string
      total: number
      rows: TableRow[]
    }> = []

    const keyForLocalDay = (dateLike: string | Date) => {
      const d = new Date(dateLike)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }

    const labelForDayKey = (dayKey: string) => {
      const [y, m, d] = dayKey.split('-').map(Number)
      const dt = new Date(y, (m || 1) - 1, d || 1)
      return dt.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    for (const row of table.getRowModel().rows) {
      const dayKey = keyForLocalDay(row.original.createdAt)
      const last = groups[groups.length - 1]

      if (!last || last.dayKey !== dayKey) {
        groups.push({
          dayKey,
          label: labelForDayKey(dayKey),
          total: 0,
          rows: [row],
        })
      } else {
        last.rows.push(row)
      }

      // Total is per-substance and should be unit-consistent.
      // Use canonicalUnit when available; otherwise sum everything.
      if (!canonicalUnit || row.original.unit === canonicalUnit) {
        groups[groups.length - 1].total += row.original.amount
      }
    }

    return groups
  }, [table, canonicalUnit])

  const selectedIds = table
    .getSelectedRowModel()
    .flatRows.map((row) => row.original.id)
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
      await deleteDose({ variables: { id: pendingDeleteId } })
    } finally {
      closeConfirm()
    }
  }

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return
    try {
      await deleteDosesBulk({ variables: { ids: selectedIds } })
      setRowSelection({})
    } finally {
      closeBulkConfirm()
    }
  }

  const bulkBodyPreview = () => {
    if (!selectedIds.length) return null
    const preview = selectedIds.slice(0, 3).join(', ')
    const more = selectedIds.length > 3 ? '…' : ''
    return `Delete ${selectedIds.length} dose${selectedIds.length === 1 ? '' : 's'} (${preview}${more})? This cannot be undone.`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Doses</h2>
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
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {groupedRows.map((group) => (
              <Fragment key={group.dayKey}>
                <tr className="bg-base-200">
                  <td colSpan={table.getVisibleLeafColumns().length}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">{group.label}</span>
                      <span className="text-sm text-base-content/70">
                        Total:{' '}
                        {group.total.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{' '}
                        {canonicalUnit ?? ''}
                      </span>
                    </div>
                  </td>
                </tr>

                {group.rows.map((row) => (
                  <tr
                    key={row.id}
                    className={row.getIsSelected() ? 'active' : ''}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                <tr>
                  <td colSpan={table.getVisibleLeafColumns().length}>
                    <div className="divider my-0" />
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={isConfirmOpen}
        title="Delete dose?"
        body={`Delete dose ${pendingDeleteId}? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deletingSingle}
        onConfirm={handleDelete}
        onCancel={closeConfirm}
        tone="danger"
      />

      <ConfirmModal
        open={isBulkConfirmOpen}
        title="Delete selected doses?"
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

export default DosesList
