import { useEffect, useRef, useState } from 'react'

import { MoveLeft } from 'lucide-react'

const DemoBanner = () => {
  const isDemoMode = process.env.DEMO_MODE === '1'

  const STORAGE_KEY = 'dosebot:demoBannerDismissed'

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.localStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })

  const [expandedVisible, setExpandedVisible] = useState(false)
  const collapseTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (collapseTimerRef.current != null) {
      window.clearTimeout(collapseTimerRef.current)
      collapseTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (collapsed) {
      setExpandedVisible(false)
      return
    }

    // Ensure we transition in (avoid first-paint flicker).
    setExpandedVisible(false)
    const raf = window.requestAnimationFrame(() => setExpandedVisible(true))
    return () => window.cancelAnimationFrame(raf)
  }, [collapsed])

  const setCollapsedPersisted = (next: boolean) => {
    setCollapsed(next)
    if (typeof window === 'undefined') return
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, '1')
      else window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore storage failures
    }
  }

  if (!isDemoMode) return null

  if (collapsed) {
    return (
      <button
        type="button"
        className="fixed bottom-14 left-0 z-[999] flex items-center gap-2 rounded-r-box bg-warning px-3 py-2 text-sm font-semibold text-warning-content shadow-lg"
        onClick={() => setCollapsedPersisted(false)}
        aria-label="Expand demo mode banner"
        title="Expand"
      >
        <span className="hidden sm:inline">Demo mode</span>
        <span aria-hidden>›</span>
      </button>
    )
  }

  const startCollapse = () => {
    setExpandedVisible(false)
    collapseTimerRef.current = window.setTimeout(() => {
      collapseTimerRef.current = null
      setCollapsedPersisted(true)
    }, 200)
  }

  return (
    <div
      className={
        'alert alert-warning fixed bottom-24 left-4 z-[70] flex w-80 flex-col gap-1 shadow-lg transition duration-200 ease-out sm:bottom-4 ' +
        (expandedVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2')
      }
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          className="btn btn-neutral btn-xs"
          onClick={startCollapse}
          aria-label="Collapse demo mode banner"
          title="Collapse"
        >
          <MoveLeft className="size-3" />
        </button>
        <div className="font-semibold">Demo mode</div>
      </div>
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

export default DemoBanner
