import type { Prisma, ApiKey } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

export const standard = defineScenario<Prisma.ApiKeyCreateArgs>({
  apiKey: {
    one: {
      data: { updatedAt: '2025-12-17T19:58:25.745Z', key: 'String8563059' },
    },
    two: {
      data: { updatedAt: '2025-12-17T19:58:25.745Z', key: 'String6737806' },
    },
  },
})

export type StandardScenario = ScenarioData<ApiKey, 'apiKey'>
