import { BotIcon, KeyIcon, PillBottleIcon, Users2Icon } from 'lucide-react'

import { Link, routes } from '@cedarjs/router'
import { Head } from '@cedarjs/web'
import { Toaster } from '@cedarjs/web/toast'

import { useAuth } from 'src/auth'
import Analytics from 'src/components/Analytics/Analytics'
import LogoutButton from 'src/components/LogoutButton/LogoutButton'
type MainLayoutProps = {
  children?: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { isAuthenticated, currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'Admin'
  return (
    <>
      {process.env.ANALYTICS_ENABLED === '1' && (
        <Head>
          <Analytics
            endpoint={process.env.ANALYTICS_ENDPOINT}
            websiteId={process.env.ANALYTICS_WEBSITE_ID}
            scriptUrl={process.env.ANALYTICS_SCRIPT_URL}
          />
        </Head>
      )}
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
              <li>
                {isAdmin ? (
                  <Link to={routes.users()}>
                    <Users2Icon className="size-3" />
                    Users
                  </Link>
                ) : (
                  <div
                    className="tooltip tooltip-bottom"
                    data-tip={
                      isAuthenticated ? 'Admin only' : 'Sign in to access'
                    }
                  >
                    <span
                      className="pointer-events-none flex items-center gap-2 opacity-50"
                      aria-disabled="true"
                    >
                      <Users2Icon className="size-3" />
                      Users
                    </span>
                  </div>
                )}
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
