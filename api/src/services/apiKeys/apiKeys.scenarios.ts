import type { Prisma, ApiKey } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

export const standard = defineScenario<Prisma.ApiKeyCreateArgs>({
  apiKey: {
    one: {
      data: {
        updatedAt: '2025-12-17T19:58:25.745Z',
        hashedKey:
          '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm', // bcrypt hash of "test"
      },
    },
    two: {
      data: {
        updatedAt: '2025-12-17T19:58:25.745Z',
        hashedKey:
          '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm', // bcrypt hash of "test"
      },
    },
  },
})

export type StandardScenario = ScenarioData<ApiKey, 'apiKey'>
