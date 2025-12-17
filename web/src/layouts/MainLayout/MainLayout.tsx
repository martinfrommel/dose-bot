import { useState } from 'react'

import { BotIcon, Key, KeyRound } from 'lucide-react'

import { Link, routes } from '@cedarjs/router'
import { Toaster, toast } from '@cedarjs/web/toast'

import AuthKeyModal from 'src/components/AuthKeyModal/AuthKeyModal'
import { useAuthKey } from 'src/lib/useAuthKey'

type MainLayoutProps = {
  children?: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const authKey = useAuthKey()
  const hasAuthKey = !!authKey

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
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="relative"
                >
                  {hasAuthKey ? (
                    <KeyRound className="h-4 w-4 text-success" />
                  ) : (
                    <Key className="h-4 w-4" />
                  )}
                  Auth Key
                  {hasAuthKey && (
                    <span className="badge badge-success badge-xs absolute right-0 top-0"></span>
                  )}
                </button>
              </li>
            </ul>
          </div>
        </div>
        <main className="container mx-auto h-full w-full flex-1 p-4">
          {children}
        </main>
      </div>
      <Toaster />
      <AuthKeyModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSave={() => {
          toast.success('Auth key saved successfully')
        }}
      />
    </>
  )
}

export default MainLayout
