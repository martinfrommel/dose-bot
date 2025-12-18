import { render } from '@cedarjs/testing/web'

import ListActions from './ListActions'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('ListActions', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<ListActions />)
    }).not.toThrow()
  })
})
