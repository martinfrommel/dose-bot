import type { FindDoseById, FindSubstanceBySlug } from 'types/graphql'

import { Link, routes } from '@cedarjs/router'

import { useItemView } from 'src/contexts/ItemViewContext'
import { formatDoseDate } from 'src/lib/formatters'

interface BreadcrumbsProps {
  substance?: NonNullable<FindSubstanceBySlug['substance']>
  dose?: NonNullable<FindDoseById['dose']>
  currentPageTitle?: string
}

const Breadcrumbs = ({
  substance: propSubstance,
  dose: propDose,
  currentPageTitle: propCurrentPageTitle,
}: BreadcrumbsProps = {}) => {
  // Use context only if it's available
  let contextSubstance: typeof propSubstance | undefined
  let contextDose: typeof propDose | undefined
  let contextCurrentPageTitle: string | undefined

  try {
    const context = useItemView()
    contextSubstance = context.substance
    contextDose = context.dose
    contextCurrentPageTitle = context.currentPageTitle
  } catch {
    // Context not available, will use props
  }

  // Use context values if available, fall back to props
  const substance = contextSubstance || propSubstance
  const dose = contextDose || propDose
  const currentPageTitle = contextCurrentPageTitle || propCurrentPageTitle

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
          <li>
            <Link
              to={routes.dose({ slug: substance.slug, id: dose.id })}
              className="link-hover link"
            >
              {formatDoseDate(dose.createdAt)}
            </Link>
          </li>
        )}
        {currentPageTitle && <li className="opacity-75">{currentPageTitle}</li>}
      </ul>
    </div>
  )
}

export default Breadcrumbs
