import { Link, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'

import NewApiKey from 'src/components/ApiKey/NewApiKey'

const NewApiKeyPage = () => {
  return (
    <>
      <Metadata title="Create New API Key" />
      <Link to={routes.apiKeys()} className="btn btn-ghost mb-4">
        ← Back to API Keys
      </Link>
      <NewApiKey />
    </>
  )
}

export default NewApiKeyPage
