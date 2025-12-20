import { render } from '@cedarjs/testing/web'

import { formatUrl } from 'src/lib/formatters'
import { logger } from 'src/lib/logger'

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
  const mockedLogger = logger as jest.Mocked<typeof logger>
  const mockedFormatUrl = formatUrl as jest.MockedFunction<typeof formatUrl>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when analytics is disabled', () => {
    const { container } = render(
      <Analytics enabled={false} endpoint="example.com" websiteId="site-123" />
    )

    expect(container).toBeEmptyDOMElement()
    expect(mockedLogger.debug).not.toHaveBeenCalled()
    expect(mockedFormatUrl).not.toHaveBeenCalled()
  })

  it('logs and renders nothing when enabled without an endpoint', () => {
    const { container } = render(<Analytics enabled websiteId="site-123" />)

    expect(container).toBeEmptyDOMElement()
    expect(mockedLogger.debug).toHaveBeenCalledWith(
      'Analytics is enabled but no endpoint is provided. Analytics will not be loaded.'
    )
    expect(mockedFormatUrl).not.toHaveBeenCalled()
  })

  it('renders the analytics script when enabled with an endpoint', () => {
    const { container } = render(
      <Analytics enabled endpoint="example.com" websiteId="site-123" />
    )

    expect(mockedFormatUrl).toHaveBeenCalledWith('example.com')
    expect(mockedLogger.debug).toHaveBeenCalledWith(
      'Analytics is enabled. Loading analytics script from endpoint: https://example.com'
    )

    const script = container.querySelector('script')
    expect(script).toBeInTheDocument()
    expect(script).toHaveAttribute('defer')
    expect(script).toHaveAttribute('src', 'https://example.com/script.js')
    expect(script).toHaveAttribute('data-website-id', 'site-123')
  })
})
