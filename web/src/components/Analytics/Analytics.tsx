import { Head } from '@cedarjs/web'

import { asssembleFullUrl, formatUrl } from 'src/lib/formatters'

interface AnalyticsProps {
  endpoint?: string

  websiteId?: string
  scriptUrl?: string
}

const Analytics = ({ endpoint, websiteId, scriptUrl }: AnalyticsProps) => {
  if (!endpoint) {
    return null
  }

  const formattedEndpoint = formatUrl(endpoint)

  return (
    <Head>
      <script
        defer
        src={asssembleFullUrl(formattedEndpoint, scriptUrl || '/script.js')}
        data-website-id={websiteId}
      />
    </Head>
  )
}

export default Analytics
