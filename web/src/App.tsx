import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { FatalErrorBoundary, RedwoodProvider } from '@cedarjs/web'
import { RedwoodApolloProvider } from '@cedarjs/web/apollo'

import DemoBanner from 'src/components/DemoBanner/DemoBanner'
import FatalErrorPage from 'src/pages/FatalErrorPage'

import { getPersistedDaisyUiTheme, setDaisyUiTheme } from 'src/lib/useDaisyUiTheme'

import { AuthProvider, useAuth } from './auth.js'
import './index.css'
import './scaffold.css'
import AnalyticsScript from './components/Analytics/Analytics'

interface AppProps {
  children?: ReactNode
}

const ThemeInitializer = () => {
  useEffect(() => {
    const persisted = getPersistedDaisyUiTheme()
    if (persisted) setDaisyUiTheme(persisted, { persist: false })
  }, [])

  return null
}

const App = ({ children }: AppProps) => (
  <FatalErrorBoundary page={FatalErrorPage}>
    <RedwoodProvider titleTemplate="%PageTitle | %AppTitle">
      <ThemeInitializer />
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
