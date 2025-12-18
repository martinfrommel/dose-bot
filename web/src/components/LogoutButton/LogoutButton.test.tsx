import { render } from '@cedarjs/testing/web'

import LogoutButton from './LogoutButton'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('LogoutButton', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<LogoutButton />)
    }).not.toThrow()
  })
})
