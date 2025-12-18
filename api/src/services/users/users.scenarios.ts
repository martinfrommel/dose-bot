import type { Prisma, User } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

export const standard = defineScenario<Prisma.UserCreateArgs>({
  user: {
    one: {
      data: {
        email: 'String6671887',
        hashedPassword: 'String',
        salt: 'String',
        updatedAt: '2025-12-18T22:22:31.960Z',
      },
    },
    two: {
      data: {
        email: 'String8592503',
        hashedPassword: 'String',
        salt: 'String',
        updatedAt: '2025-12-18T22:22:31.960Z',
      },
    },
  },
})

export type StandardScenario = ScenarioData<User, 'user'>
