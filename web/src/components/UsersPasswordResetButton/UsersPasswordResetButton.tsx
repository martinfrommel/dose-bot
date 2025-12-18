import { useMutation } from '@cedarjs/web/apollo'
import { toast } from '@cedarjs/web/toast'
import { useState } from 'react'
import gql from 'graphql-tag'

const RESET_PASSWORD = gql`
  mutation ResetUserPassword($userId: Int!) {
    resetUserPassword(userId: $userId)
  }
`

interface UsersPasswordResetButtonProps {
  userId: number
  userEmail: string
}

const UsersPasswordResetButton = ({ userId, userEmail }: UsersPasswordResetButtonProps) => {
  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD)
  const [showPassword, setShowPassword] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)

  const handleReset = async () => {
    try {
      const { data } = await resetPassword({
        variables: { userId },
      })

      setTempPassword(data.resetUserPassword)
      setShowPassword(true)
      toast.success('Password reset successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password')
    }
  }

  if (showPassword && tempPassword) {
    return (
      <div className="alert alert-info">
        <div>
          <p className="font-semibold mb-2">Temporary password for {userEmail}:</p>
          <code className="bg-base-300 p-2 rounded block mb-2 break-all">{tempPassword}</code>
          <p className="text-sm">Please share this password securely with the user. They should change it immediately after logging in.</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(tempPassword)
              toast.success('Password copied to clipboard')
            }}
            className="btn btn-sm btn-ghost mt-2"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className="btn btn-sm btn-warning"
    >
      {loading ? 'Resetting...' : 'Reset Password'}
    </button>
  )
}

export default UsersPasswordResetButton
}

export default UsersPasswordResetButton
