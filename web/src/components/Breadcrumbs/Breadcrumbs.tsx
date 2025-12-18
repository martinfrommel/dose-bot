import type { FindDoseById, FindSubstanceBySlug } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'

import { useItemView } from 'src/contexts/ItemViewContext'
import { formatDoseDate } from 'src/lib/formatters'

interface BreadcrumbsProps {
  substance?: NonNullable<FindSubstanceBySlug['substance']>
  dose?: NonNullable<FindDoseById['dose']>
}

const Breadcrumbs = ({ substance: propSubstance, dose: propDose }: BreadcrumbsProps = {}) => {
  const { substance: contextSubstance, dose: contextDose } = useItemView()
  
  // Use context values if available, fall back to props
  const substance = contextSubstance || propSubstance
  const dose = contextDose || propDose

  return (
    <div className="breadcrumbs mb-4 text-sm">
      <ul>
        <li>
          <Link to={routes.substances()} className="link-hover link">
            Substances
          </Link>
        </li>
        {substance && (
          <li>
            <Link
              to={routes.substance({ slug: substance.slug })}
              className="link-hover link"
            >
              {substance.name}
            </Link>
          </li>
        )}
        {dose && substance && (
          <li className="opacity-75">{formatDoseDate(dose.createdAt)}</li>
        )}
      </ul>
    </div>
  )
}

export default Breadcrumbs
