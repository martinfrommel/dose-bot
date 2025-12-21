import { HelmetProvider } from '@dr.pogodin/react-helmet'

import { render, waitFor } from '@cedarjs/testing/web'

import AnalyticsScript from './Analytics'

describe('Analytics', () => {
  afterEach(() => {
    document.head.querySelector('#analytics-script')?.remove()
  })

  it('renders nothing and does not inject the script without an endpoint', () => {
    const { container } = render(
      <HelmetProvider>
        <AnalyticsScript websiteId="site-123" />
      </HelmetProvider>
    )

    expect(container).toBeEmptyDOMElement()
    expect(document.head.querySelector('#analytics-script')).toBeNull()
  })

  it('injects the analytics script when enabled with an endpoint', async () => {
    render(
      <HelmetProvider>
        <AnalyticsScript
          endpoint="example.com"
          websiteId="site-123"
          scriptUrl="/script.js"
        />
      </HelmetProvider>
    )

    await waitFor(() => {
      expect(document.head.querySelector('#analytics-script')).toBeTruthy()
    })

    const script = document.head.querySelector('#analytics-script')
    expect(script).toHaveAttribute('defer')
    expect(script).toHaveAttribute('src', 'https://example.com/script.js')
    expect(script).toHaveAttribute('data-website-id', 'site-123')
  })
})
