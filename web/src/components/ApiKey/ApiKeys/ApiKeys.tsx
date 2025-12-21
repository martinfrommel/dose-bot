import type {
  DeleteApiKeyMutation,
  DeleteApiKeyMutationVariables,
  FindApiKeys,
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

import { QUERY } from 'src/components/ApiKey/ApiKeysCell'
import ConfirmModal from 'src/components/ConfirmModal/ConfirmModal'
import { timeTag, truncate } from 'src/lib/formatters.js'

type ApiKeyRow = FindApiKeys['apiKeys'][number]

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

type DeleteApiKeysBulkMutation = { deleteApiKeys: number }
type DeleteApiKeysBulkVariables = { ids: string[] }

const DELETE_API_KEYS_BULK_MUTATION: TypedDocumentNode<
  DeleteApiKeysBulkMutation,
  DeleteApiKeysBulkVariables
> = gql`
  mutation DeleteApiKeysBulkMutation($ids: [String!]!) {
    deleteApiKeys(ids: $ids)
  }
`

const columnHelper = createColumnHelper<ApiKeyRow>()

const ApiKeysList = ({ apiKeys }: FindApiKeys) => {
  const [deleteApiKey, { loading: deletingSingle }] = useMutation(
    DELETE_API_KEY_MUTATION,
    {
      onCompleted: () => {
        toast.success('ApiKey deleted')
      },
      onError: (error) => {
        toast.error(error.message)
      },
      refetchQueries: [{ query: QUERY }],
      awaitRefetchQueries: true,
    }
  )

  const [deleteApiKeysBulk, { loading: deletingBulk }] = useMutation(
    DELETE_API_KEYS_BULK_MUTATION,
    {
      onCompleted: ({ deleteApiKeys }) => {
        toast.success(`Deleted ${deleteApiKeys} API key${deleteApiKeys === 1 ? '' : 's'}`)
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
            aria-label="Select all API keys on page"
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
            aria-label={`Select API key ${row.original.id}`}
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
        cell: ({ getValue }) => <span className="text-xs">{timeTag(getValue())}</span>,
      }),
      columnHelper.accessor('updatedAt', {
        header: 'Updated',
        cell: ({ getValue }) => <span className="text-xs">{timeTag(getValue())}</span>,
      }),
      columnHelper.accessor('enabled', {
        header: 'Enabled',
        cell: ({ getValue }) =>
          getValue() ? (
            <span className="badge badge-success">Enabled</span>
          ) : (
            <span className="badge badge-neutral">Disabled</span>
          ),
      }),
      columnHelper.accessor('validUntil', {
        header: 'Valid Until',
        cell: ({ getValue }) => {
          const value = getValue()
          return value ? (
            <span className="text-xs">{timeTag(value)}</span>
          ) : (
            <span className="badge badge-success badge-sm">Forever</span>
          )
        },
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: ({ getValue }) => (
          <span className="max-w-xs truncate" title={getValue() ?? ''}>
            {getValue()}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Link
              to={routes.apiKey({ id: row.original.id })}
              className="btn btn-ghost btn-xs"
              title={'View apiKey ' + row.original.id}
            >
              View
            </Link>
            <Link
              to={routes.editApiKey({ id: row.original.id })}
              className="btn btn-primary btn-xs"
              title={'Edit apiKey ' + row.original.id}
            >
              Edit
            </Link>
            <button
              type="button"
              className="btn btn-error btn-xs"
              title={'Delete apiKey ' + row.original.id}
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
    data: apiKeys,
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
      await deleteApiKey({ variables: { id: pendingDeleteId } })
    } finally {
      closeConfirm()
    }
  }

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return
    try {
      await deleteApiKeysBulk({ variables: { ids: selectedIds } })
      setRowSelection({})
    } finally {
      closeBulkConfirm()
    }
  }

  const bulkBodyPreview = () => {
    if (!selectedIds.length) return null
    const preview = selectedIds.slice(0, 3).join(', ')
    const more = selectedIds.length > 3 ? '…' : ''
    return `Delete ${selectedIds.length} API key${
      selectedIds.length === 1 ? '' : 's'
    } (${preview}${more})? This cannot be undone.`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">API Keys</h2>
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
        title="Delete API key?"
        body={`Delete API key ${pendingDeleteId}? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deletingSingle}
        onConfirm={handleDelete}
        onCancel={closeConfirm}
        tone="danger"
      />

      <ConfirmModal
        open={isBulkConfirmOpen}
        title="Delete selected API keys?"
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

export default ApiKeysList
