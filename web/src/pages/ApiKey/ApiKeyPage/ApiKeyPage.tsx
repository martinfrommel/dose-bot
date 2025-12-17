import ApiKeyCell from 'src/components/ApiKey/ApiKeyCell'

type ApiKeyPageProps = {
  id: string
}

const ApiKeyPage = ({ id }: ApiKeyPageProps) => {
  return <ApiKeyCell id={id} />
}

export default ApiKeyPage
