import type { FindDoses, FindDosesVariables } from 'types/graphql'

import { routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Doses from 'src/components/Dose/Doses'
import EmptyState from 'src/components/EmptyState/EmptyState'
import { useItemView } from 'src/contexts/ItemViewContext'

export const QUERY: TypedDocumentNode<FindDoses, FindDosesVariables> = gql`
  query FindDoses {
    doses {
      id
      createdAt
      updatedAt
      amount
      unit
      substanceId
      substance {
        id
        createdAt
        updatedAt
        name
        description
        slug
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

export const Failure = ({ error }: CellFailureProps<FindDoses>) => (
  <div className="alert alert-error">
    <span>{error?.message}</span>
  </div>
)

export const Success = ({
  doses,
  slug,
}: CellSuccessProps<FindDoses, FindDosesVariables> & DosesCellProps) => {
  const { setSubstance, setCurrentPageTitle } = useItemView()

  // Set dose in context and clear page title when it loads
  React.useEffect(() => {
    setSubstance(doses[0]?.substance)
    setCurrentPageTitle(undefined)
  }, [doses, setSubstance, setCurrentPageTitle])

  return <Doses doses={doses} slug={slug} />
}
