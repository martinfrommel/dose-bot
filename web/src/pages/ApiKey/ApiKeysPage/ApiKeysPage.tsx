import { PlusIcon } from 'lucide-react'

import { Link, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'

import ApiKeysCell from 'src/components/ApiKey/ApiKeysCell'

const ApiKeysPage = () => {
  return (
    <>
      <Metadata title="API Keys" description="Manage your API keys" />
      <div className="mb-6 flex items-center justify-between">
        <div></div>
        <Link to={routes.newApiKey()} className="btn btn-primary">
          <PlusIcon className="size-4" /> Create New API Key
        </Link>
      </div>
      <div className="rounded-lg bg-base-100 p-4 shadow-md">
        <ApiKeysCell />
      </div>
    </>
  )
}

export default ApiKeysPage
