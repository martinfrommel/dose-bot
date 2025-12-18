import { Toaster } from '@cedarjs/web/toast'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  footer?: React.ReactNode
}

const AuthLayout = ({ children, title, footer }: AuthLayoutProps) => {
  return (
    <main className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <Toaster
        toastOptions={{
          className: 'alert',
          duration: 6000,
          success: {
            className: 'alert alert-success',
          },
          error: {
            className: 'alert alert-error',
          },
        }}
      />
      <div className="w-full max-w-md">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold justify-center mb-4">
              {title}
            </h2>
            {children}
          </div>
        </div>
        {footer && <div className="text-center mt-4">{footer}</div>}
      </div>
    </main>
  )
}

export default AuthLayout
