import type { ReactNode } from 'react'

import { FatalErrorBoundary, RedwoodProvider } from '@cedarjs/web'
import { RedwoodApolloProvider } from '@cedarjs/web/apollo'

import FatalErrorPage from 'src/pages/FatalErrorPage'

import { AuthProvider, useAuth } from './auth.js'
import './index.css'
import './scaffold.css'
import AnalyticsScript from './components/Analytics/Analytics'

interface AppProps {
  children?: ReactNode
}

const DemoBanner = () => {
  const isDemoMode = process.env.DEMO_MODE === '1'

  if (!isDemoMode) return null

  return (
    <div className="alert alert-warning fixed bottom-4 left-4 z-50 flex w-80  flex-col gap-1  opacity-70 shadow-lg">
      <div className="font-semibold">Demo mode</div>
      <div className="text-sm leading-snug">
        This sandbox resets its data every midnight. Try things out
        freely—changes will not persist.
      </div>
      <ul className="flex w-full flex-col gap-1 pt-2 text-sm">
        <li>
          <strong>Username:</strong>&nbsp; <span>demo@dosebot.local</span>
        </li>
        <li>
          <strong>Password:</strong>&nbsp; <span>demo</span>
        </li>
      </ul>
    </div>
  )
}

const App = ({ children }: AppProps) => (
  <FatalErrorBoundary page={FatalErrorPage}>
    <RedwoodProvider titleTemplate="%PageTitle | %AppTitle">
      <AnalyticsScript
        endpoint={process.env.ANALYTICS_ENDPOINT}
        websiteId={process.env.ANALYTICS_WEBSITE_ID}
        scriptUrl={process.env.ANALYTICS_SCRIPT_URL}
      />
      <DemoBanner />
      <AuthProvider>
        <RedwoodApolloProvider useAuth={useAuth}>
          {children}
        </RedwoodApolloProvider>
      </AuthProvider>
    </RedwoodProvider>
  </FatalErrorBoundary>
)

export default App
