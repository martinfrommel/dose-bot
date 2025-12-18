import { render } from '@cedarjs/testing/web'

import ItemViewLayout from './ItemViewLayout'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('ItemViewLayout', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<ItemViewLayout />)
    }).not.toThrow()
  })
})
