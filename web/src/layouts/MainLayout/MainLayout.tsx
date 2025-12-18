import { BotIcon, KeyIcon, PillBottleIcon } from 'lucide-react'

import { Link, routes } from '@cedarjs/router'
import { Toaster } from '@cedarjs/web/toast'

import { useAuth } from 'src/auth'
import LogoutButton from 'src/components/LogoutButton/LogoutButton'
type MainLayoutProps = {
  children?: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { isAuthenticated } = useAuth()
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
                <Link to={routes.apiKeys()}>
                  <KeyIcon className="size-3" />
                  API Keys
                </Link>
              </li>
              <li>
                <Link to={routes.substances()}>
                  <PillBottleIcon className="size-3" />
                  Substances
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <main className="container mx-auto h-full w-full flex-1 p-4">
          {children}
        </main>
      </div>
      {isAuthenticated && (
        <div className="fixed bottom-4 right-4">
          <LogoutButton />
        </div>
      )}
      <Toaster />
    </>
  )
}

export default MainLayout
