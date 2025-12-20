import type { Unit } from 'types/graphql'

import { routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Doses from 'src/components/Dose/Doses'
import EmptyState from 'src/components/EmptyState/EmptyState'
import { useItemView } from 'src/contexts/ItemViewContext'

type DoseForSubstance = {
  id: string
  createdAt: string
  updatedAt: string
  amount: number
  unit: Unit
  substanceId: string
}

export type FindDosesBySlug = {
  substance?: {
    id: string
    createdAt: string
    updatedAt: string
    name: string
    description?: string | null
    slug: string
    doses: DoseForSubstance[]
  }
}

export type FindDosesBySlugVariables = {
  slug: string
}

export const QUERY: TypedDocumentNode<
  FindDosesBySlug,
  FindDosesBySlugVariables
> = gql`
  query FindDosesBySlug($slug: String!) {
    substance: substanceBySlug(slug: $slug) {
      id
      createdAt
      updatedAt
      name
      description
      slug
      doses {
        id
        createdAt
        updatedAt
        amount
        unit
        substanceId
      }
    }
  }
`

type DosesCellProps = {
  slug: string
}

export const Loading = () => <div>Loading...</div>

export const Empty = ({ slug }: DosesCellProps) => {
  return (
    <EmptyState
      title="No doses yet."
      createLink={routes.newDose({ slug })}
      createLabel="Create one"
    />
  )
}

export const Failure = ({ error }: CellFailureProps<FindDosesBySlug>) => (
  <div className="alert alert-error">
    <span>{error?.message}</span>
  </div>
)

export const Success = ({
  substance,
  slug,
}: CellSuccessProps<FindDosesBySlug, FindDosesBySlugVariables> &
  DosesCellProps) => {
  const { setSubstance, setCurrentPageTitle } = useItemView()

  // Set substance in context and clear page title when it loads
  React.useEffect(() => {
    setSubstance(substance || undefined)
    setCurrentPageTitle(undefined)
  }, [substance, setSubstance, setCurrentPageTitle])

  if (!substance) {
    return (
      <EmptyState
        title="Substance not found."
        createLink={routes.newSubstance()}
        createLabel="Create substance"
      />
    )
  }

  if (substance.doses.length === 0) {
    return (
      <EmptyState
        title="No doses yet."
        createLink={routes.newDose({ slug })}
        createLabel="Create one"
      />
    )
  }

  return <Doses substance={substance} />
}
