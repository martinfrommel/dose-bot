import type { Prisma, ApiKey } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

export const standard = defineScenario<Prisma.ApiKeyCreateArgs>({
  apiKey: {
    one: {
      data: { updatedAt: '2025-12-17T19:45:54.691Z', key: 'String7217889' },
    },
    two: {
      data: { updatedAt: '2025-12-17T19:45:54.691Z', key: 'String9050757' },
    },
  },
})

export type StandardScenario = ScenarioData<ApiKey, 'apiKey'>
