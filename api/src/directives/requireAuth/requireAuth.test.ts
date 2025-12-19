import { mockRedwoodDirective, getDirectiveName } from '@cedarjs/testing/api'

import requireAuth from './requireAuth.js'

describe('requireAuth directive', () => {
  it('declares the directive sdl as schema, with the correct name', () => {
    expect(requireAuth.schema).toBeTruthy()
    expect(getDirectiveName(requireAuth.schema)).toBe('requireAuth')
  })

  it('does not throw when a current user is provided', () => {
    const mockExecution = mockRedwoodDirective(requireAuth, {
      context: {
        currentUser: {
          id: 1,
          email: 'test@example.com',
          role: 'User',
          roles: ['User'],
        },
      },
    })

    expect(mockExecution).not.toThrowError()
  })
})
