import { render, screen } from '@cedarjs/testing/web'

import ConfirmModal from './ConfirmModal'

describe('ConfirmModal', () => {
  it('renders successfully', () => {
    expect(() => {
      render(
        <ConfirmModal
          open
          title="Delete item"
          body="This action cannot be undone."
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      )
    }).not.toThrow()
  })

  it('shows provided content', () => {
    render(
      <ConfirmModal
        open
        title="Delete item"
        body="This action cannot be undone."
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    )

    expect(screen.getByText('Delete item')).toBeInTheDocument()
    expect(
      screen.getByText('This action cannot be undone.')
    ).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('focuses confirm button on open', () => {
    render(
      <ConfirmModal
        open
        title="Delete item"
        body="This action cannot be undone."
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    )

    expect(screen.getByText('Confirm')).toHaveFocus()
  })
})
