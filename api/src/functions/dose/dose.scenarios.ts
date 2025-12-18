import type { Prisma, Dose } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

// Note: Test setup will create API keys and substances manually
// because defineScenario doesn't support multiple model types well

export const standard = defineScenario<Prisma.DoseCreateArgs>({
  dose: {
    caffeineLight: {
      data: {
        amount: 50,
        unit: 'MG',
        updatedAt: '2025-12-18T00:00:00.000Z',
        substance: {
          create: {
            name: 'Caffeine Test Substance',
            slug: 'caffeine-test-substance-1',
            updatedAt: '2025-12-18T00:00:00.000Z',
          },
        },
      },
    },
    caffeineModerate: {
      data: {
        amount: 100,
        unit: 'MG',
        updatedAt: '2025-12-18T00:00:00.000Z',
        substance: {
          create: {
            name: 'Caffeine Test Substance 2',
            slug: 'caffeine-test-substance-2',
            updatedAt: '2025-12-18T00:00:00.000Z',
          },
        },
      },
    },
  },
})

export type StandardScenario = ScenarioData<Dose, 'dose'>
