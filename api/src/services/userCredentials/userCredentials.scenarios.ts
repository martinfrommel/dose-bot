import type { Prisma, UserCredential } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

export const standard = defineScenario<Prisma.UserCredentialCreateArgs>({
  userCredential: {
    one: {
      data: {
        id: 'String',
        publicKey: new Uint8Array([14, 274, 2]),
        counter: 7654382,
        user: {
          create: {
            email: 'String4345668',
            hashedPassword: 'String',
            salt: 'String',
            updatedAt: '2025-12-18T22:23:36.490Z',
          },
        },
      },
    },
    two: {
      data: {
        id: 'String',
        publicKey: new Uint8Array([97, 180, 287]),
        counter: 3130448,
        user: {
          create: {
            email: 'String4162415',
            hashedPassword: 'String',
            salt: 'String',
            updatedAt: '2025-12-18T22:23:36.496Z',
          },
        },
      },
    },
  },
})

export type StandardScenario = ScenarioData<UserCredential, 'userCredential'>
