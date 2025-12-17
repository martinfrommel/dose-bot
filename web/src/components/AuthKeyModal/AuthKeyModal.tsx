import { useState, useEffect } from 'react'

import { Key, X } from 'lucide-react'

const AUTH_KEY_STORAGE_KEY = 'dosebot_auth_key'

interface AuthKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (key: string) => void
}

const AuthKeyModal = ({ isOpen, onClose, onSave }: AuthKeyModalProps) => {
  const [authKey, setAuthKey] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      // Load existing auth key from localStorage
      const storedKey = localStorage.getItem(AUTH_KEY_STORAGE_KEY)
      if (storedKey) {
        setAuthKey(storedKey)
      }
      setError('')
    }
  }, [isOpen])

  const handleSave = () => {
    if (!authKey.trim()) {
      setError('Please enter an auth key')
      return
    }

    // Save to localStorage
    localStorage.setItem(AUTH_KEY_STORAGE_KEY, authKey.trim())

    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('authKeyChanged'))

    // Call optional callback
    if (onSave) {
      onSave(authKey.trim())
    }

    // Close modal
    onClose()
  }

  const handleClear = () => {
    localStorage.removeItem(AUTH_KEY_STORAGE_KEY)
    window.dispatchEvent(new Event('authKeyChanged'))
    setAuthKey('')
    setError('')
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <Key className="h-5 w-5" />
            Set Authentication Key
          </h3>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="divider"></div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Auth Key</span>
          </label>
          <input
            type="password"
            placeholder="Enter your authentication key"
            className="input input-bordered w-full"
            value={authKey}
            onChange={(e) => {
              setAuthKey(e.target.value)
              setError('')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave()
              }
            }}
          />
          {error && (
            <label className="label">
              <span className="label-text-alt text-error">{error}</span>
            </label>
          )}
        </div>

        <div className="modal-action">
          <button onClick={handleClear} className="btn btn-ghost">
            Clear
          </button>
          <button onClick={onClose} className="btn btn-neutral">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            Save
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}

export default AuthKeyModal

export { AUTH_KEY_STORAGE_KEY }
