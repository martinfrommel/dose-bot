import type { Prisma, Dose } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

export const standard = defineScenario<Prisma.DoseCreateArgs>({
  dose: {
    one: {
      data: {
        updatedAt: '2025-12-18T02:47:35.619Z',
        amount: 4529457.43050556,
        unit: 'MG',
        substance: {
          create: {
            updatedAt: '2025-12-18T02:47:35.623Z',
            name: 'Substance One',
            slug: 'string-slug-1',
            unit: 'MG',
          },
        },
      },
    },
    two: {
      data: {
        updatedAt: '2025-12-18T02:47:35.623Z',
        amount: 6076834.933297018,
        unit: 'MG',
        substance: {
          create: {
            updatedAt: '2025-12-18T02:47:35.627Z',
            name: 'Substance Two',
            slug: 'string-slug-2',
            unit: 'MG',
          },
        },
      },
    },
  },
})

export type StandardScenario = ScenarioData<Dose, 'dose'>
