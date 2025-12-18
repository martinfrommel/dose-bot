import { BotIcon } from 'lucide-react'

import { Link, routes } from '@cedarjs/router'
import { Toaster } from '@cedarjs/web/toast'
type MainLayoutProps = {
  children?: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {

  return (
    <>
      <div className="flex min-h-screen flex-col bg-base-200">
        <div className="navbar bg-base-100 shadow-md">
          <div className="flex-1">
            <Link
              to={routes.home()}
              className="btn btn-ghost text-xl normal-case"
            >
              <BotIcon />
              DoseBot
            </Link>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal px-1">
              <li>
                <Link to={routes.apiKeys()}>API Keys</Link>
              </li>
              <li>
                <Link to={routes.substances()}>Substances</Link>
              </li>
              <li>
                <Link to={routes.doses()}>Doses</Link>
              </li>

            </ul>
          </div>
        </div>
        <main className="container mx-auto h-full w-full flex-1 p-4">
          {children}
        </main>
      </div>
      <Toaster />
    </>
  )
}

export default MainLayout
