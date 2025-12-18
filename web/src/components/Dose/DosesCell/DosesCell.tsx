import type { FindDoses, FindDosesVariables } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Doses from 'src/components/Dose/Doses'
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
    <section className="block min-h-24 space-y-3 text-center">
      <h3>No doses yet.</h3>
      <Link to={routes.newDose({ slug })} className="btn btn-primary btn-sm">
        Create one
      </Link>
    </section>
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
