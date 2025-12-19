import { useState, useEffect, useRef } from 'react'

import gql from 'graphql-tag'
import { MoreVertical, RotateCcw, Trash2 } from 'lucide-react'

import { useMutation } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

type UsersUserActionsProps = {
  userId: number
  userEmail: string
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
  onRefresh = () => {},
}: UsersUserActionsProps) => {
  const [resetUserPassword, { loading: resetting }] =
    useMutation(RESET_USER_PASSWORD)
  const [deleteUser, { loading: deleting }] = useMutation(DELETE_USER)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

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
    <div className="flex flex-col items-end gap-2">
      <div className="relative" ref={dropdownRef}>
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
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="gap-2 text-error"
              >
                <Trash2 className="size-4" />
                {deleting ? 'Deleting...' : 'Delete user'}
              </button>
            </li>
          </ul>
        )}
      </div>

      {tempPassword && (
        <div className="alert alert-info w-full max-w-md text-left">
          <div>
            <p className="font-semibold">Temporary password for {userEmail}</p>
            <code className="mb-2 block break-all rounded bg-base-300 p-2">
              {tempPassword}
            </code>
            <p className="text-sm text-base-content/80">
              Share securely and ask the user to change it after login.
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(tempPassword)
                  toast.success('Password copied to clipboard')
                }}
                className="btn btn-ghost btn-xs"
              >
                Copy
              </button>
              <button
                onClick={() => setTempPassword(null)}
                className="btn btn-ghost btn-xs"
              >
                Hide
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
