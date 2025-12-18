import type { Prisma, Substance } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

export const standard = defineScenario<Prisma.SubstanceCreateArgs>({
  substance: {
    one: { data: { updatedAt: '2025-12-18T02:47:21.857Z', name: 'String' } },
    two: { data: { updatedAt: '2025-12-18T02:47:21.857Z', name: 'String' } },
  },
})

export type StandardScenario = ScenarioData<Substance, 'substance'>
