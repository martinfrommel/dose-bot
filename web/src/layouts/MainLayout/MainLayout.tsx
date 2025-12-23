import { useState } from 'react'

import {
  BotIcon,
  DoorOpenIcon,
  HouseIcon,
  KeyIcon,
  PillBottleIcon,
  Users2Icon,
} from 'lucide-react'

import { Link, routes } from '@cedarjs/router'
import { Toaster } from '@cedarjs/web/toast'

import { useAuth } from 'src/auth'
import ConfirmModal from 'src/components/ConfirmModal/ConfirmModal'
import LogoutButton from 'src/components/LogoutButton/LogoutButton'
import { setDaisyUiTheme, useDaisyUiTheme } from 'src/lib/useDaisyUiTheme'
type MainLayoutProps = {
  children?: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { isAuthenticated, currentUser, logOut } = useAuth()
  const isAdmin = currentUser?.role === 'Admin'

  const [logoutModalOpen, setLogoutModalOpen] = useState(false)

  const rawTheme = useDaisyUiTheme()
  const theme =
    rawTheme === 'dark' || rawTheme === 'light' || rawTheme === 'synthwave'
      ? rawTheme
      : 'dark'

  return (
    <>
      <div className="flex min-h-screen flex-col bg-base-200">
        <div className="navbar bg-base-100 shadow-md">
          <div className="navbar-start">
            <Link
              to={routes.home()}
              className="btn btn-ghost gap-2 text-xl normal-case"
            >
              <BotIcon />
              DoseBot
            </Link>
          </div>
          <div className="navbar-center flex-1 px-2 sm:flex-none">
            <select
              className="select select-bordered select-sm w-full max-w-44 sm:w-32 sm:max-w-none md:w-40"
              value={theme}
              onChange={(e) => setDaisyUiTheme(e.target.value)}
              aria-label="Theme"
              title="Theme"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="synthwave">Synthwave</option>
            </select>
          </div>
          <div className="navbar-end hidden sm:flex">
            <ul className="menu menu-horizontal menu-sm flex-nowrap gap-2 border px-1">
              <li className="my-auto h-full">
                <Link
                  to={routes.apiKeys()}
                  aria-label="API Keys"
                  title="API Keys"
                  className="flex items-center justify-center gap-2 px-3 py-2 lg:justify-start lg:px-2 lg:py-1"
                >
                  <KeyIcon className="size-5 lg:size-3" />
                  <span className="hidden lg:inline">API Keys</span>
                </Link>
              </li>
              <li className="my-auto h-full">
                <Link
                  to={routes.substances()}
                  aria-label="Substances"
                  title="Substances"
                  className="flex items-center justify-center gap-2 px-3 py-2  lg:justify-start lg:px-2 lg:py-1"
                >
                  <PillBottleIcon className="size-5 lg:size-3" />
                  <span className="hidden lg:inline">Substances</span>
                </Link>
              </li>
              <li className="my-auto h-full">
                {isAdmin ? (
                  <Link
                    to={routes.users()}
                    aria-label="Users"
                    title="Users"
                    className="flex items-center justify-center gap-2 px-3 py-2 lg:justify-start lg:px-2 lg:py-1"
                  >
                    <Users2Icon className="size-5 lg:size-3" />
                    <span className="hidden lg:inline">Users</span>
                  </Link>
                ) : (
                  <div
                    className="tooltip tooltip-bottom"
                    data-tip={
                      isAuthenticated ? 'Admin only' : 'Sign in to access'
                    }
                  >
                    <span
                      className="pointer-events-none flex items-center justify-center gap-2 px-3 py-2 opacity-50 lg:justify-start lg:px-2 lg:py-1"
                      aria-disabled="true"
                    >
                      <Users2Icon className="size-5 lg:size-3" />
                      <span className="hidden lg:inline">Users</span>
                    </span>
                  </div>
                )}
              </li>
              {isAuthenticated && (
                <li>
                  <button
                    type="button"
                    className="btn btn-square btn-secondary btn-md tooltip tooltip-bottom lg:hidden"
                    data-tip="Logout"
                    aria-label="Logout"
                    title="Logout"
                    onClick={() => logOut()}
                  >
                    <DoorOpenIcon className="size-5" />
                  </button>
                  <LogoutButton className="btn btn-secondary btn-sm hidden lg:inline-flex" />
                </li>
              )}
            </ul>
          </div>
        </div>
        <main className="container mx-auto h-full w-full flex-1 p-3 pb-24 sm:p-4 sm:pb-4">
          {children}
        </main>

        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 sm:hidden">
          <ul className="menu menu-horizontal menu-xs z-50 grid w-[calc(100vw-1.5rem)] auto-cols-fr grid-flow-col place-items-center rounded-box border  border-base-300 bg-base-100 px-4 py-1 shadow">
            <li>
              <Link
                to={routes.home()}
                className="btn btn-square btn-ghost btn-xs tooltip tooltip-top"
                data-tip="Home"
                aria-label="Home"
              >
                <HouseIcon className="size-4" />
              </Link>
            </li>
            <li>
              <Link
                to={routes.apiKeys()}
                className="btn btn-square btn-ghost btn-xs tooltip tooltip-top"
                data-tip="API Keys"
                aria-label="API Keys"
              >
                <KeyIcon className="size-4" />
              </Link>
            </li>
            <li>
              <Link
                to={routes.substances()}
                className="btn btn-square btn-ghost btn-xs tooltip tooltip-top"
                data-tip="Substances"
                aria-label="Substances"
              >
                <PillBottleIcon className="size-4" />
              </Link>
            </li>
            <li>
              {isAdmin ? (
                <Link
                  to={routes.users()}
                  className="btn btn-square btn-ghost btn-xs tooltip tooltip-top"
                  data-tip="Users"
                  aria-label="Users"
                >
                  <Users2Icon className="size-4" />
                </Link>
              ) : (
                <div
                  className="tooltip tooltip-top"
                  data-tip={
                    isAuthenticated ? 'Admin only' : 'Sign in to access'
                  }
                >
                  <span
                    className="btn btn-square btn-ghost btn-xs pointer-events-none flex items-center opacity-50"
                    aria-disabled="true"
                  >
                    <Users2Icon className="size-4" />
                  </span>
                </div>
              )}
            </li>
            {isAuthenticated && (
              <li>
                <button
                  type="button"
                  className="btn btn-square btn-ghost btn-xs tooltip tooltip-top"
                  data-tip="Logout"
                  aria-label="Logout"
                  onClick={() => setLogoutModalOpen(true)}
                >
                  <DoorOpenIcon className="size-4" />
                </button>
              </li>
            )}
          </ul>
        </div>

        <ConfirmModal
          open={logoutModalOpen}
          title="Log out?"
          body="You’ll need to sign in again to continue."
          confirmLabel="Log out"
          cancelLabel="Cancel"
          tone="danger"
          onCancel={() => setLogoutModalOpen(false)}
          onConfirm={() => {
            setLogoutModalOpen(false)
            logOut()
          }}
        />
      </div>
      <Toaster />
    </>
  )
}

export default MainLayout
