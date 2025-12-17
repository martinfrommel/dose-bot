import { mockRedwoodDirective, getDirectiveName } from '@cedarjs/testing/api'

import overrideAuth from './overrideAuth'

describe('overrideAuth directive', () => {
  it('declares the directive sdl as schema, with the correct name', () => {
    expect(overrideAuth.schema).toBeTruthy()
    expect(getDirectiveName(overrideAuth.schema)).toBe('overrideAuth')
  })

  it('has a overrideAuth throws an error if validation does not pass', () => {
    const mockExecution = mockRedwoodDirective(overrideAuth, {})

    expect(mockExecution).toThrowError(
      'Implementation missing for overrideAuth'
    )
  })
})
