import type { Prisma, Dose } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

export const standard = defineScenario<Prisma.DoseCreateArgs>({
  dose: {
    one: {
      data: {
        updatedAt: '2025-12-18T02:47:35.619Z',
        amount: 4529457.43050556,
        substance: {
          create: { updatedAt: '2025-12-18T02:47:35.623Z', name: 'String' },
        },
      },
    },
    two: {
      data: {
        updatedAt: '2025-12-18T02:47:35.623Z',
        amount: 6076834.933297018,
        substance: {
          create: { updatedAt: '2025-12-18T02:47:35.627Z', name: 'String' },
        },
      },
    },
  },
})

export type StandardScenario = ScenarioData<Dose, 'dose'>
