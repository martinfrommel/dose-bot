import { Helmet } from '@cedarjs/web'

import { asssembleFullUrl, formatUrl } from 'src/lib/formatters'

interface AnalyticsScriptProps {
  endpoint?: string
  websiteId?: string
  scriptUrl?: string
}

const AnalyticsScript = ({
  endpoint,
  websiteId,
  scriptUrl,
}: AnalyticsScriptProps) => {
  const formattedEndpoint = endpoint ? formatUrl(endpoint) : undefined
  const resolvedScriptUrl = scriptUrl || '/script.js'

  const scriptSrc = formattedEndpoint
    ? asssembleFullUrl(formattedEndpoint, resolvedScriptUrl)
    : undefined

  if (!websiteId || !scriptSrc) return null

  console.debug('💉 Injecting analytics script:', { scriptSrc, websiteId })
  return (
    <Helmet>
      <script
        id="analytics-script"
        defer
        data-website-id={websiteId}
        src={scriptSrc}
      />
    </Helmet>
  )
}

export default AnalyticsScript
