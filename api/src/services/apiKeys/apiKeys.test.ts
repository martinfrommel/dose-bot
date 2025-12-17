import type { ApiKey } from '@prisma/client'

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
      input: { updatedAt: '2025-12-17T19:45:54.662Z', key: 'String9610005' },
    })

    expect(result.updatedAt).toEqual(new Date('2025-12-17T19:45:54.662Z'))
    expect(result.key).toEqual('String9610005')
  })

  scenario('updates a apiKey', async (scenario: StandardScenario) => {
    const original = (await apiKey({ id: scenario.apiKey.one.id })) as ApiKey
    const result = await updateApiKey({
      id: original.id,
      input: { updatedAt: '2025-12-18T19:45:54.666Z' },
    })

    expect(result.updatedAt).toEqual(new Date('2025-12-18T19:45:54.666Z'))
  })

  scenario('deletes a apiKey', async (scenario: StandardScenario) => {
    const original = (await deleteApiKey({
      id: scenario.apiKey.one.id,
    })) as ApiKey
    const result = await apiKey({ id: original.id })

    expect(result).toEqual(null)
  })
})
