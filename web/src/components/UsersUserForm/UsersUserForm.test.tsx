import { render } from '@cedarjs/testing/web'

import UsersUserForm from './UsersUserForm'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('UsersUserForm', () => {
  it('renders successfully', () => {
    expect(() => {
      render(
        <UsersUserForm
          onSubmit={() => {
            // noop
          }}
        />
      )
    }).not.toThrow()
  })
})
