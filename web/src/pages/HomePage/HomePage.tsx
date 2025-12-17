import { BotIcon } from 'lucide-react'

import { Link, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'

const HomePage = () => {
  return (
    <>
      <Metadata
        title="Welcome to DoseBot"
        description="Manage your substances and doses"
      />
      <div className="mx-auto my-auto max-w-2xl space-y-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4 text-3xl">
              <BotIcon />
              Welcome to DoseBot
            </h2>
            <p className="mb-4">
              A simple and secure tool to log your doses with API accessibility.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="card bg-primary text-primary-content">
            <div className="card-body">
              <h3 className="card-title text-lg">API Keys</h3>
              <p className="mb-4">
                Create and manage API keys for programmatic access to DoseBot.
              </p>
              <div className="card-actions">
                <Link to={routes.apiKeys()} className="btn btn-secondary">
                  Manage API Keys
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default HomePage
