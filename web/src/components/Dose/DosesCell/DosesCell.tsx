import type { FindDoses, FindDosesVariables } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Doses from 'src/components/Dose/Doses'

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
    <div className="text-center">
      No doses yet.{' '}
      <Link to={routes.newDose({ slug })} className="btn btn-primary btn-sm">
        Create one
      </Link>
    </div>
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
  return <Doses doses={doses} slug={slug} />
}
