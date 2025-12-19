import type { User } from '@prisma/client'

import { users, user, createUser, updateUser, deleteUser } from './users.js'
import type { StandardScenario } from './users.scenarios.js'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('users', () => {
  const setCurrentUser = (user: Record<string, unknown> | null) => {
    if (typeof globalThis.mockCurrentUser === 'function') {
      globalThis.mockCurrentUser(user)
      return
    }

    // Fallback in case mockCurrentUser is not available
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

  scenario('returns all users', async (scenario: StandardScenario) => {
    const result = await users()

    expect(result.length).toEqual(Object.keys(scenario.user).length)
  })

  scenario('returns a single user', async (scenario: StandardScenario) => {
    const result = await user({ id: scenario.user.one.id })

    expect(result).toEqual(scenario.user.one)
  })

  scenario('creates a user', async () => {
    const result = await createUser({
      email: 'NewUser@Example.com',
      plainPassword: 'P@ssw0rd!',
    })

    expect(result.email).toEqual('newuser@example.com')
    expect(result.hashedPassword).toBeDefined()
    expect(result.salt).toBeDefined()
    expect(result.avatarUrl).toBeDefined()
  })

  scenario('updates a user', async (scenario: StandardScenario) => {
    const original = (await user({ id: scenario.user.one.id })) as User
    const result = await updateUser({
      id: original.id,
      email: 'UpdatedEmail@Example.com',
    })

    expect(result.email).toEqual('updatedemail@example.com')
  })

  scenario('deletes a user', async (scenario: StandardScenario) => {
    const original = (await deleteUser({ id: scenario.user.one.id })) as User
    const result = await user({ id: original.id })

    expect(result).toEqual(null)
  })
})
