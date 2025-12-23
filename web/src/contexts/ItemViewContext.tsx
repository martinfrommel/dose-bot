import { createContext, useContext, ReactNode, useState } from 'react'

import type { FindSubstanceBySlug, FindDoseById } from 'types/graphql'

interface ItemViewContextType {
  substance?: NonNullable<FindSubstanceBySlug['substance']>
  dose?: NonNullable<FindDoseById['dose']>
  currentPageTitle?: string
  setSubstance: (
    substance?: NonNullable<FindSubstanceBySlug['substance']>
  ) => void
  setDose: (dose?: NonNullable<FindDoseById['dose']>) => void
  setCurrentPageTitle: (title?: string) => void
}

const ItemViewContext = createContext<ItemViewContextType | undefined>(
  undefined
)

interface ItemViewProviderProps {
  children: ReactNode
  substance?: NonNullable<FindSubstanceBySlug['substance']>
  dose?: NonNullable<FindDoseById['dose']>
}

export const ItemViewProvider = ({
  children,
  substance: initialSubstance,
  dose: initialDose,
}: ItemViewProviderProps) => {
  const [substance, setSubstance] = useState(initialSubstance)
  const [dose, setDose] = useState(initialDose)
  const [currentPageTitle, setCurrentPageTitle] = useState<string | undefined>()

  const setSubstanceAndClearDose: ItemViewContextType['setSubstance'] = (
    nextSubstance
  ) => {
    setSubstance(nextSubstance)
    setDose(undefined)
  }

  return (
    <ItemViewContext.Provider
      value={{
        substance,
        dose,
        currentPageTitle,
        setSubstance: setSubstanceAndClearDose,
        setDose,
        setCurrentPageTitle,
      }}
    >
      {children}
    </ItemViewContext.Provider>
  )
}

export const useItemView = () => {
  const context = useContext(ItemViewContext)
  if (context === undefined) {
    throw new Error('useItemView must be used within ItemViewProvider')
  }
  return context
}
