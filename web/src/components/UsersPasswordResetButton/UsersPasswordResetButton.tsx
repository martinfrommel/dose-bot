import { useState } from 'react'

import gql from 'graphql-tag'
import type { Role } from 'types/graphql'

import { useMutation } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { useAuth } from 'src/auth'
import { getErrorMessage } from 'src/lib/getErrorMessage'

type UsersPasswordResetButtonProps = {
  userId: number
  userEmail: string
  userRole: Role
}

const RESET_PASSWORD = gql`
  mutation ResetUserPassword($userId: Int!) {
    resetUserPassword(userId: $userId)
  }
`

const UsersPasswordResetButton = ({
  userId,
  userEmail,
  userRole,
}: UsersPasswordResetButtonProps) => {
  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const { currentUser } = useAuth()
  const isSelf = currentUser?.id === userId
  const isTargetAdmin = userRole === 'Admin'

  const handleReset = async () => {
    if (isSelf) {
      toast.error('You cannot reset your own password')
      return
    }

    if (isTargetAdmin) {
      toast.error('Admins cannot reset passwords for other admins')
      return
    }

    try {
      const { data } = await resetPassword({ variables: { userId } })
      const password = data?.resetUserPassword

      if (password) {
        setTempPassword(password)
        toast.success('Password reset successfully')
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || 'Failed to reset password')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleReset}
        disabled={loading || isSelf || isTargetAdmin}
        className="btn btn-warning btn-sm"
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
      {tempPassword && (
        <div className="alert alert-info">
          <div>
            <p className="mb-2 font-semibold">
              Temporary password for {userEmail}
            </p>
            <code className="mb-2 block break-all rounded bg-base-300 p-2">
              {tempPassword}
            </code>
            <p className="text-sm">
              Please share this password securely with the user. They should
              change it after login.
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(tempPassword)
                toast.success('Password copied to clipboard')
              }}
              className="btn btn-ghost btn-sm mt-2"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersPasswordResetButton
