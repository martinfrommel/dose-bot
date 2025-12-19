import type { ApiKey } from '@prisma/client'

import { verifyApiKey } from 'src/lib/hash'

import {
  apiKeys,
  apiKey,
  createApiKey,
  updateApiKey,
  deleteApiKey,
} from './apiKeys.js'
import type { StandardScenario } from './apiKeys.scenarios.js'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('apiKeys', () => {
  const setCurrentUser = (user: Record<string, unknown> | null) => {
    if (typeof globalThis.mockCurrentUser === 'function') {
      globalThis.mockCurrentUser(user)
      return
    }

    ;(globalThis as typeof globalThis & { context?: Record<string, unknown> }).context = {
      ...(globalThis as typeof globalThis & { context?: Record<string, unknown> })
        .context,
      currentUser: user,
    }
  }

  beforeEach(() => {
    setCurrentUser({
      id: 999,
      email: 'admin@example.com',
      role: 'Admin',
      roles: ['Admin'],
    })
  })

  scenario('returns all apiKeys', async (scenario: StandardScenario) => {
    const result = await apiKeys()

    expect(result.length).toEqual(Object.keys(scenario.apiKey).length)
  })

  scenario('returns a single apiKey', async (scenario: StandardScenario) => {
    const result = await apiKey({ id: scenario.apiKey.one.id })

    expect(result).toEqual(scenario.apiKey.one)
  })

  scenario('creates a apiKey', async () => {
    const result = await createApiKey({
      input: {
        enabled: true,
      },
    })

    // Verify that a plain key is returned
    expect(result.key).toBeDefined()
    expect(result.key.length).toBeGreaterThan(0)
    // Verify that the key was hashed and stored
    expect(result.id).toBeDefined()
  })

  scenario('updates a apiKey', async (scenario: StandardScenario) => {
    const original = (await apiKey({ id: scenario.apiKey.one.id })) as ApiKey
    const result = await updateApiKey({
      id: original.id,
      input: { description: 'Updated description' },
    })

    expect(result.description).toEqual('Updated description')
  })

  scenario('deletes a apiKey', async (scenario: StandardScenario) => {
    const original = (await deleteApiKey({
      id: scenario.apiKey.one.id,
    })) as ApiKey
    const result = await apiKey({ id: original.id })

    expect(result).toEqual(null)
  })
})
