import { render } from '@cedarjs/testing/web'

import { formatUrl } from 'src/lib/formatters'

import Analytics from './Analytics'

jest.mock(
  'src/lib/logger',
  () => ({
    logger: { debug: jest.fn() },
  }),
  { virtual: true }
)

jest.mock('src/lib/formatters', () => ({
  formatUrl: jest.fn((url: string) => `https://${url}`),
}))

describe('Analytics', () => {
  const mockedFormatUrl = formatUrl as jest.MockedFunction<typeof formatUrl>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('logs and renders nothing when  without an endpoint', () => {
    const { container } = render(<Analytics websiteId="site-123" />)

    expect(container).toBeEmptyDOMElement()

    expect(mockedFormatUrl).not.toHaveBeenCalled()
  })

  it('renders the analytics script when enabled with an endpoint', () => {
    const { container } = render(
      <Analytics endpoint="example.com" websiteId="site-123" />
    )

    expect(mockedFormatUrl).toHaveBeenCalledWith('example.com')

    const script = container.querySelector('script')
    expect(script).toBeInTheDocument()
    expect(script).toHaveAttribute('defer')
    expect(script).toHaveAttribute('src', 'https://example.com/script.js')
    expect(script).toHaveAttribute('data-website-id', 'site-123')
  })
})
