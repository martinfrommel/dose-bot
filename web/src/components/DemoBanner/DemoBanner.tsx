import { useState } from 'react'

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
        className="fixed bottom-4 left-0 z-50 flex items-center gap-2 rounded-r-box bg-warning px-3 py-2 text-sm font-semibold text-warning-content shadow-lg"
        onClick={() => setCollapsedPersisted(false)}
        aria-label="Expand demo mode banner"
        title="Expand"
      >
        Demo mode
        <span aria-hidden>›</span>
      </button>
    )
  }

  return (
    <div className="alert alert-warning fixed bottom-4 left-4 z-50 flex w-80 flex-col gap-1 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          className="btn btn-neutral btn-xs"
          onClick={() => setCollapsedPersisted(true)}
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
