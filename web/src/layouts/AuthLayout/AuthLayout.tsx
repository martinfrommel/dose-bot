import { BotIcon } from 'lucide-react'

import { Toaster } from '@cedarjs/web/toast'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  footer?: React.ReactNode
}

const AuthLayout = ({ children, title, footer }: AuthLayoutProps) => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-base-200 p-4">
      <Toaster />
      <div className="w-full max-w-md">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <BotIcon className="mx-auto size-12" />
            <h2 className="card-title mb-4 justify-center text-2xl font-bold">
              {title}
            </h2>
            {children}
          </div>
        </div>
        {footer && <div className="mt-4 text-center">{footer}</div>}
      </div>
    </main>
  )
}

export default AuthLayout
