import { useState, useEffect } from 'react'

import { AUTH_KEY_STORAGE_KEY } from 'src/components/AuthKeyModal/AuthKeyModal'

/**
 * Hook to get and monitor the auth key from localStorage
 * @returns The current auth key or null if not set
 */
export const useAuthKey = (): string | null => {
  const [authKey, setAuthKey] = useState<string | null>(() => {
    return localStorage.getItem(AUTH_KEY_STORAGE_KEY)
  })

  useEffect(() => {
    // Listen for storage changes (in case it's updated in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === AUTH_KEY_STORAGE_KEY) {
        setAuthKey(e.newValue)
      }
    }

    // Listen for custom event (for same-tab updates)
    const handleAuthKeyChange = () => {
      setAuthKey(localStorage.getItem(AUTH_KEY_STORAGE_KEY))
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('authKeyChanged', handleAuthKeyChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authKeyChanged', handleAuthKeyChange)
    }
  }, [])

  return authKey
}

/**
 * Get the auth key from localStorage
 * @returns The auth key or null if not set
 */
export const getAuthKey = (): string | null => {
  return localStorage.getItem(AUTH_KEY_STORAGE_KEY)
}

/**
 * Set the auth key in localStorage and dispatch event
 * @param key The auth key to set
 */
export const setAuthKey = (key: string): void => {
  localStorage.setItem(AUTH_KEY_STORAGE_KEY, key)
  window.dispatchEvent(new Event('authKeyChanged'))
}

/**
 * Remove the auth key from localStorage and dispatch event
 */
export const clearAuthKey = (): void => {
  localStorage.removeItem(AUTH_KEY_STORAGE_KEY)
  window.dispatchEvent(new Event('authKeyChanged'))
}
