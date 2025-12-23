import { useMemo, useState } from 'react'

import { EditIcon, ListIcon, PlusIcon, TrashIcon } from 'lucide-react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
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
import { getDaisyUiColor } from 'src/lib/chartColors'
import { timeTag } from 'src/lib/formatters.js'
import { useDaisyUiTheme } from 'src/lib/useDaisyUiTheme'

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
  const theme = useDaisyUiTheme()

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

  const canonicalUnit = substance.unit || substance.doses?.[0]?.unit

  const trend = useMemo(() => {
    const startOfLocalDay = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate())

    const today = startOfLocalDay(new Date())
    const dayKeys: string[] = []
    const labelsByKey: Record<string, string> = {}

    for (let offset = 4; offset >= 0; offset--) {
      const dt = new Date(today)
      dt.setDate(dt.getDate() - offset)
      const y = dt.getFullYear()
      const m = String(dt.getMonth() + 1).padStart(2, '0')
      const day = String(dt.getDate()).padStart(2, '0')
      const key = `${y}-${m}-${day}`
      dayKeys.push(key)
      labelsByKey[key] = dt.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    }

    const keyForLocalDay = (dateLike: string | Date) => {
      const dt = new Date(dateLike)
      const y = dt.getFullYear()
      const m = String(dt.getMonth() + 1).padStart(2, '0')
      const day = String(dt.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }

    const totalsByKey = Object.fromEntries(
      dayKeys.map((k) => [k, 0])
    ) as Record<string, number>

    for (const d of substance.doses ?? []) {
      const key = keyForLocalDay(d.createdAt)
      if (!(key in totalsByKey)) continue

      if (canonicalUnit) {
        if (d.unit === canonicalUnit) totalsByKey[key] += d.amount
      } else {
        totalsByKey[key] += 1
      }
    }

    const data = dayKeys.map((key) => ({
      day: labelsByKey[key],
      value: totalsByKey[key],
    }))

    const yLabel = canonicalUnit ? `Total (${canonicalUnit})` : 'Doses'
    return { data, yLabel }
  }, [substance.doses, canonicalUnit])

  const openConfirm = () => setIsConfirmOpen(true)
  const closeConfirm = () => setIsConfirmOpen(false)

  const barFill = useMemo(() => {
    const _theme = theme
    return getDaisyUiColor('--p') ?? 'currentColor'
  }, [theme])

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
          <button type="button" className="btn btn-error" onClick={openConfirm}>
            <TrashIcon className="size-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="card my-4 bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-base">Last 5 days</h3>
          <div className="divider my-2" />
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend.data} margin={{ left: 8, right: 8 }}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    const raw = payload[0]?.value
                    const value = typeof raw === 'number' ? raw : 0
                    const formatted = canonicalUnit
                      ? value.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
                      : value.toLocaleString()

                    return (
                      <div className="rounded-box border border-base-300 bg-base-100 p-2 text-sm shadow">
                        <div className="font-semibold">{label}</div>
                        <div className="text-base-content/70">
                          {trend.yLabel}: {formatted}
                        </div>
                      </div>
                    )
                  }}
                />
                <Bar
                  dataKey="value"
                  fill={barFill}
                  isAnimationActive={false}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
