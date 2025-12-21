import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { useLocation } from '@cedarjs/router'

import { asssembleFullUrl, formatUrl } from 'src/lib/formatters'

declare global {
  interface Window {
    umami?: {
      trackView?: (path?: string) => void
      trackEvent?: (event: string, data?: Record<string, unknown>) => void
      track?: (path?: string) => void
    }
  }
}

const getUmami = () => {
  const maybeWindow =
    typeof globalThis !== 'undefined'
      ? (globalThis as typeof globalThis & { window?: Window }).window
      : undefined

  return maybeWindow?.umami
}

interface AnalyticsContextValue {
  ready: boolean
  load: () => Promise<void>
  trackPageview: (path?: string) => void
  trackEvent: (event: string, data?: Record<string, unknown>) => void
}

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(
  undefined
)

interface AnalyticsProviderProps {
  endpoint?: string
  websiteId?: string
  scriptUrl?: string
  children?: ReactNode
}

const SCRIPT_ID = 'analytics-script'

const AnalyticsProvider = ({
  endpoint,
  websiteId,
  scriptUrl,
  children,
}: AnalyticsProviderProps) => {
  const [ready, setReady] = useState(false)
  const loaderRef = useRef<Promise<void> | null>(null)

  const formattedEndpoint = endpoint ? formatUrl(endpoint) : undefined
  const resolvedScriptUrl = scriptUrl || '/script.js'

  const scriptSrc = formattedEndpoint
    ? asssembleFullUrl(formattedEndpoint, resolvedScriptUrl)
    : undefined

  const load = useCallback(() => {
    if (typeof document === 'undefined') {
      return Promise.resolve()
    }

    if (!formattedEndpoint || !websiteId || !scriptSrc) {
      return Promise.resolve()
    }

    if (loaderRef.current) {
      return loaderRef.current
    }

    loaderRef.current = new Promise<void>((resolve) => {
      const existingScript = document.getElementById(
        SCRIPT_ID
      ) as HTMLScriptElement | null

      if (existingScript) {
        setReady(true)
        resolve()
        return
      }

      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.defer = true
      script.src = scriptSrc
      script.dataset.websiteId = websiteId

      script.addEventListener('load', () => {
        setReady(true)
        resolve()
      })

      script.addEventListener('error', () => {
        setReady(false)
        resolve()
      })

      console.log('Appending analytics script:', scriptSrc)
      document.head.appendChild(script)
    })

    return loaderRef.current
  }, [formattedEndpoint, scriptSrc, websiteId])

  const trackPageview = useCallback(
    (path?: string) => {
      const umami = getUmami()
      if (!ready || !umami) return

      if (typeof umami.trackView === 'function') {
        umami.trackView(path)
        return
      }

      if (typeof umami.track === 'function') {
        umami.track(path)
      }
    },
    [ready]
  )

  const trackEvent = useCallback(
    (event: string, data?: Record<string, unknown>) => {
      const umami = getUmami()
      if (!ready || !umami) return

      if (typeof umami.trackEvent === 'function') {
        umami.trackEvent(event, data)
        return
      }

      if (typeof umami.track === 'function') {
        umami.track(event)
      }
    },
    [ready]
  )

  useEffect(() => {
    load()
  }, [load])

  const value = useMemo(
    () => ({ ready, load, trackPageview, trackEvent }),
    [ready, load, trackPageview, trackEvent]
  )

  return (
    <AnalyticsContext.Provider value={value}>
      {children ?? null}
    </AnalyticsContext.Provider>
  )
}

export const useAnalytics = () => {
  const ctx = useContext(AnalyticsContext)
  if (!ctx) {
    throw new Error('useAnalytics must be used within AnalyticsProvider')
  }
  return ctx
}

export const AnalyticsRouteTracker = ({
  children,
}: {
  children: ReactNode
}) => {
  const { ready, trackPageview } = useAnalytics()
  const location = useLocation()

  useEffect(() => {
    if (!ready) return

    const path = `${location.pathname}${location.search ?? ''}`
    trackPageview(path)
  }, [location.pathname, location.search, ready, trackPageview])

  return <>{children}</>
}

export default AnalyticsProvider
