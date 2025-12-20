import { formatUrl } from 'src/lib/formatters'

interface AnalyticsProps {
  endpoint?: string

  websiteId?: string
  scriptUrl?: string
}

const Analytics = ({ endpoint, websiteId, scriptUrl }: AnalyticsProps) => {
  if (!endpoint) {
    return null
  }

  const formattedEndpoint = formatUrl(endpoint!)

  return (
    <script
      defer
      src={`${formattedEndpoint}${scriptUrl ?? '/script.js'}`}
      data-website-id={websiteId}
    />
  )
}

export default Analytics
