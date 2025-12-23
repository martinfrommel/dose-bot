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
        <section className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4 text-3xl">
              <BotIcon />
              Welcome to DoseBot
            </h2>
            <p className="mb-4">
              A simple and secure tool to track you vices with API
              accessibility.
            </p>
          </div>
        </section>
        <div className="flex flex-col gap-4 md:flex-row">
          <section className="card w-full bg-neutral text-neutral-content">
            <div className="card-body">
              <h3 className="card-title text-lg">API Keys</h3>
              <p className="mb-4">
                Create and manage API keys for programmatic access to DoseBot.
              </p>
              <div className="card-actions">
                <Link to={routes.apiKeys()} className="btn btn-primary">
                  Manage API Keys
                </Link>
              </div>
            </div>
          </section>
          <section className="card w-full bg-primary text-primary-content">
            <div className="card-body">
              <h3 className="card-title text-lg">Substances</h3>
              <p className="mb-4">
                Add and manage substances you are tracking doses for. This could
                be anything, we are leaving the possibilities vague by design.
                😏
              </p>
              <div className="card-actions">
                <Link to={routes.substances()} className="btn btn-secondary">
                  Manage Substances
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

export default HomePage
