import { formatUrl } from 'src/lib/formatters'
import { logger } from 'src/lib/logger'

interface AnalyticsProps {
  endpoint?: string

  websiteId?: string
  scriptUrl?: string
}

const Analytics = ({ endpoint, websiteId, scriptUrl }: AnalyticsProps) => {
  if (!endpoint) {
    logger.debug(
      'Analytics is enabled but no endpoint is provided. Analytics will not be loaded.'
    )
    return null
  }

  const formattedEndpoint = formatUrl(endpoint!)

  logger.debug(
    `Analytics is enabled. Loading analytics script from endpoint: ${formattedEndpoint}`
  )

  return (
    <script
      defer
      src={`${formattedEndpoint}${scriptUrl ?? '/script.js'}`}
      data-website-id={websiteId}
    />
  )
}

export default Analytics
