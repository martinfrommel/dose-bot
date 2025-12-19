import { useState, useEffect, useRef } from 'react'

import gql from 'graphql-tag'
import { MoreVertical, RotateCcw, Trash2 } from 'lucide-react'

import { useMutation } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

type UsersUserActionsProps = {
  userId: number
  userEmail: string
  canDelete?: boolean
  deleteTooltip?: string
  onRefresh?: () => void | Promise<unknown>
}

const RESET_USER_PASSWORD = gql`
  mutation ResetUserPassword($userId: Int!) {
    resetUserPassword(userId: $userId)
  }
`

const DELETE_USER = gql`
  mutation DeleteUser($id: Int!) {
    deleteUser(id: $id) {
      id
    }
  }
`

const UsersUserActions = ({
  userId,
  userEmail,
  canDelete = true,
  deleteTooltip,
  onRefresh = () => {},
}: UsersUserActionsProps) => {
  const [resetUserPassword, { loading: resetting }] =
    useMutation(RESET_USER_PASSWORD)
  const [deleteUser, { loading: deleting }] = useMutation(DELETE_USER)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setTempPassword(null)
      }
    }

    if (isOpen || tempPassword) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, tempPassword])

  const handleReset = async () => {
    setIsOpen(false)
    try {
      const { data } = await resetUserPassword({ variables: { userId } })
      const newPassword = data?.resetUserPassword

      if (newPassword) {
        setTempPassword(newPassword)
        toast.success('Temporary password generated')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password')
    }
  }

  const handleDelete = async () => {
    if (!canDelete) return
    setIsOpen(false)
    const confirmed = globalThis.window?.confirm(
      `Delete ${userEmail}? This cannot be undone.`
    )
    if (!confirmed) return

    try {
      await deleteUser({ variables: { id: userId } })
      toast.success('User deleted')
      onRefresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user')
    }
  }

  return (
    <div className="relative flex flex-col items-end gap-2" ref={containerRef}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-ghost btn-xs"
          aria-label="User actions"
        >
          <MoreVertical className="size-4" />
        </button>
        {isOpen && (
          <ul className="menu absolute right-0 top-full z-[100] w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg">
            <li>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="gap-2"
              >
                <RotateCcw className="size-4" />
                {resetting ? 'Resetting...' : 'Reset password'}
              </button>
            </li>
            <li>
              {canDelete ? (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex gap-2 text-white/20"
                >
                  <Trash2 className="size-4" />
                  {deleting ? 'Deleting...' : 'Delete user'}
                </button>
              ) : (
                <div
                  className="tooltip tooltip-left"
                  data-tip={deleteTooltip || 'Deletion not permitted'}
                >
                  <button
                    onClick={handleDelete}
                    disabled
                    className="flex gap-2  text-white/20"
                  >
                    <Trash2 className="size-4" />
                    Delete user
                  </button>
                </div>
              )}
            </li>
          </ul>
        )}
      </div>

      {tempPassword && (
        <div className="absolute right-0 top-[3.25rem] z-[200] w-80 rounded-box border border-base-300 bg-base-100 shadow-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-base-200 p-4">
            <div>
              <p className="text-sm font-semibold text-base-content">
                Temporary password
              </p>
              <p className="text-xs text-base-content/70">for {userEmail}</p>
            </div>
            <button
              type="button"
              className="btn btn-circle btn-ghost btn-xs"
              onClick={() => setTempPassword(null)}
              aria-label="Close temporary password popover"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3 p-4">
            <pre className="overflow-x-auto rounded-box bg-base-200 p-3 text-sm">
              <code className="break-all font-mono">{tempPassword}</code>
            </pre>
            <p className="text-sm text-base-content/80">
              Share securely and ask the user to change it after login.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(tempPassword)
                  toast.success('Password copied to clipboard')
                }}
              >
                Copy
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setTempPassword(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export type { UsersUserActionsProps }
export default UsersUserActions
