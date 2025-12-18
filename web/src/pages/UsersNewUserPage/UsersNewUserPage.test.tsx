import { render } from '@cedarjs/testing/web'

import UsersNewUserPage from './UsersNewUserPage'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('UsersNewUserPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<UsersNewUserPage />)
    }).not.toThrow()
  })
})
