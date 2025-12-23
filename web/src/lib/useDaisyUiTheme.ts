import { useSyncExternalStore } from 'react'

export type DaisyUiTheme = 'dark' | 'light' | 'synthwave'

export const DEFAULT_DAISYUI_THEME: DaisyUiTheme = 'dark'
export const DAISYUI_THEME_STORAGE_KEY = 'dosebot:theme'

const THEME_ATTRIBUTE = 'data-theme'

export const getCurrentDaisyUiTheme = (): string => {
  if (typeof document === 'undefined') return DEFAULT_DAISYUI_THEME
  return document.documentElement.dataset.theme || DEFAULT_DAISYUI_THEME
}

export const getPersistedDaisyUiTheme = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(DAISYUI_THEME_STORAGE_KEY)
  } catch {
    return null
  }
}

export const setDaisyUiTheme = (
  theme: string,
  { persist = true }: { persist?: boolean } = {}
) => {
  if (typeof document === 'undefined') return

  document.documentElement.dataset.theme = theme

  if (!persist) return
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(DAISYUI_THEME_STORAGE_KEY, theme)
  } catch {
    // ignore storage failures
  }
}

const subscribe = (onStoreChange: () => void) => {
  if (typeof document === 'undefined') return () => {}

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes' && m.attributeName === THEME_ATTRIBUTE) {
        onStoreChange()
        break
      }
    }
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [THEME_ATTRIBUTE],
  })

  return () => observer.disconnect()
}

export const useDaisyUiTheme = (): string => {
  return useSyncExternalStore(
    subscribe,
    getCurrentDaisyUiTheme,
    () => DEFAULT_DAISYUI_THEME
  )
}
