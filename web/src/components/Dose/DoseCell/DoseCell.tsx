import type { FindDoseById, FindDoseByIdVariables } from 'types/graphql'

import type {
  CellSuccessProps,
  CellFailureProps,
  TypedDocumentNode,
} from '@cedarjs/web'

import Dose from 'src/components/Dose/Dose'
import { useItemView } from 'src/contexts/ItemViewContext'

export const QUERY: TypedDocumentNode<FindDoseById, FindDoseByIdVariables> =
  gql`
    query FindDoseById($id: String!) {
      dose: dose(id: $id) {
        id
        createdAt
        updatedAt
        amount
        unit
        substanceId
      }
    }
  `

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Dose not found</div>

export const Failure = ({ error }: CellFailureProps<FindDoseByIdVariables>) => (
  <div className="alert alert-error">
    <span>{error?.message}</span>
  </div>
)

export const Success = ({
  dose,
}: CellSuccessProps<FindDoseById, FindDoseByIdVariables>) => {
  const { setDose, setCurrentPageTitle } = useItemView()

  // Set dose in context and clear page title when it loads
  React.useEffect(() => {
    setDose(dose)
    setCurrentPageTitle(undefined)
  }, [dose, setDose, setCurrentPageTitle])

  return <Dose dose={dose} />
}
