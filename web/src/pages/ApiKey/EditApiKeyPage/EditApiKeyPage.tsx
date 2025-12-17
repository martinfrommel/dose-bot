import EditApiKeyCell from 'src/components/ApiKey/EditApiKeyCell'

type ApiKeyPageProps = {
  id: string
}

const EditApiKeyPage = ({ id }: ApiKeyPageProps) => {
  return <EditApiKeyCell id={id} />
}

export default EditApiKeyPage
