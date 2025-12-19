import { useState } from 'react'

import gql from 'graphql-tag'

import { useMutation } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

type UsersPasswordResetButtonProps = {
  userId: number
  userEmail: string
}

const RESET_PASSWORD = gql`
  mutation ResetUserPassword($userId: Int!) {
    resetUserPassword(userId: $userId)
  }
`

const UsersPasswordResetButton = ({
  userId,
  userEmail,
}: UsersPasswordResetButtonProps) => {
  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD)
  const [tempPassword, setTempPassword] = useState<string | null>(null)

  const handleReset = async () => {
    try {
      const { data } = await resetPassword({ variables: { userId } })
      const password = data?.resetUserPassword

      if (password) {
        setTempPassword(password)
        toast.success('Password reset successfully')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button onClick={handleReset} disabled={loading} className="btn btn-warning btn-sm">
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>

      {tempPassword && (
        <div className="alert alert-info">
          <div>
            <p className="mb-2 font-semibold">Temporary password for {userEmail}</p>
            <code className="mb-2 block break-all rounded bg-base-300 p-2">
              {tempPassword}
            </code>
            <p className="text-sm">
              Please share this password securely with the user. They should change it after login.
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
