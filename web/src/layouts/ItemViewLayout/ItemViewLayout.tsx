import type { FindSubstanceBySlug, FindDoseById } from 'types/graphql'

import Breadcrumbs from 'src/components/Breadcrumbs/Breadcrumbs'
import { ItemViewProvider } from 'src/contexts/ItemViewContext'

type ItemViewLayoutProps = {
  children?: React.ReactNode
  substance?: NonNullable<FindSubstanceBySlug['substance']>
  dose?: NonNullable<FindDoseById['dose']>
  currentPageTitle?: string
}

const ItemViewLayout = ({ children, substance, dose, currentPageTitle }: ItemViewLayoutProps) => {
  return (
    <ItemViewProvider substance={substance} dose={dose}>
      <Breadcrumbs currentPageTitle={currentPageTitle} />
      {children}
    </ItemViewProvider>
  )
}

export default ItemViewLayout
