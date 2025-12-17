import { Link, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'

import ApiKeyCell from 'src/components/ApiKey/ApiKeyCell'

type ApiKeyPageProps = {
  id: string
}

const ApiKeyPage = ({ id }: ApiKeyPageProps) => {
  return (
    <>
      <Metadata title="API Key Details" />
      <Link to={routes.apiKeys()} className="btn btn-ghost mb-4">
        ← Back to API Keys
      </Link>
      <ApiKeyCell id={id} />
    </>
  )
}

export default ApiKeyPage
