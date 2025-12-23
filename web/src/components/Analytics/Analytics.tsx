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

  // Defensive: env vars can accidentally include newlines/extra content.
  // Only use the first whitespace-separated token to avoid leaking secrets
  // (e.g. if multiple env blocks are concatenated).
  const safeEndpoint = formattedEndpoint?.split(/\s+/)[0]
  const safeScriptUrl = resolvedScriptUrl.split(/\s+/)[0]

  const scriptSrc = safeEndpoint
    ? asssembleFullUrl(safeEndpoint, safeScriptUrl)
    : undefined

  if (!websiteId || !scriptSrc) return null
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
