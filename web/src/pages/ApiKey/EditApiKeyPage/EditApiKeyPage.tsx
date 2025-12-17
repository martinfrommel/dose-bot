import { Link, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'
import EditApiKeyCell from 'src/components/ApiKey/EditApiKeyCell'

type ApiKeyPageProps = {
  id: string
}

const EditApiKeyPage = ({ id }: ApiKeyPageProps) => {
  return (
    <>
      <Metadata title="Edit API Key" />
      <Link to={routes.apiKeys()} className="btn btn-ghost mb-4">
        ← Back to API Keys
      </Link>
      <EditApiKeyCell id={id} />
    </>
  )
}

export default EditApiKeyPage
