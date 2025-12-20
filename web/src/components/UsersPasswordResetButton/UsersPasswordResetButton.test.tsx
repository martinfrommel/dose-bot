import { render } from '@cedarjs/testing/web'

import UsersPasswordResetButton from './UsersPasswordResetButton'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('UsersPasswordResetButton', () => {
  it('renders successfully', () => {
    expect(() => {
      render(
        <UsersPasswordResetButton
          userId={1}
          userEmail="admin@example.com"
          userRole="User"
        />
      )
    }).not.toThrow()
  })
})
