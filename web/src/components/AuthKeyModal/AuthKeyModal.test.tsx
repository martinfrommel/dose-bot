import { render } from '@cedarjs/testing/web'

import AuthKeyModal from './AuthKeyModal'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('AuthKeyModal', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<AuthKeyModal />)
    }).not.toThrow()
  })
})
