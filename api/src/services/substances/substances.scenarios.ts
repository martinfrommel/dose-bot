import type { Prisma, Substance } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

export const standard = defineScenario<Prisma.SubstanceCreateArgs>({
  substance: {
    one: { data: { name: 'Vitamin C', slug: 'vitamin-c', unit: 'MG' } },
    two: { data: { name: 'Vitamin D', slug: 'vitamin-d', unit: 'MG' } },
  },
})

export type StandardScenario = ScenarioData<Substance, 'substance'>
