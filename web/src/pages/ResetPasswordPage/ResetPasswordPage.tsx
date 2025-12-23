import { useEffect, useRef, useState } from 'react'

import { Form, Label, PasswordField, Submit, FieldError } from '@cedarjs/forms'
import { navigate, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { useAuth } from 'src/auth'
import AuthLayout from 'src/layouts/AuthLayout/AuthLayout'

const ResetPasswordPage = ({ resetToken }: { resetToken: string }) => {
  const { isAuthenticated, reauthenticate, validateResetToken, resetPassword } =
    useAuth()
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.home())
    }
  }, [isAuthenticated])

  useEffect(() => {
    const validateToken = async () => {
      const response = await validateResetToken(resetToken)
      if (response.error) {
        setEnabled(false)
        toast.error(response.error)
      } else {
        setEnabled(true)
      }
    }
    validateToken()
  }, [resetToken, validateResetToken])

  const passwordRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    passwordRef.current?.focus()
  }, [])

  const onSubmit = async (data: Record<string, string>) => {
    const response = await resetPassword({
      resetToken,
      password: data.password,
    })

    if (response.error) {
      toast.error(response.error)
    } else {
      toast.success('Password changed!')
      await reauthenticate()
      navigate(routes.login())
    }
  }

  return (
    <>
      <Metadata title="Reset Password" />
      <AuthLayout title="Reset Password">
        <Form onSubmit={onSubmit}>
          <div className="form-control w-full">
            <Label name="password" className="label">
              <span className="label-text">New Password</span>
            </Label>
            <PasswordField
              name="password"
              autoComplete="new-password"
              className="input input-bordered w-full"
              errorClassName="input input-bordered input-error w-full"
              disabled={!enabled}
              ref={passwordRef}
              validation={{
                required: {
                  value: true,
                  message: 'New Password is required',
                },
              }}
            />
            <FieldError
              name="password"
              className="label-text-alt mt-1 text-error"
            />
          </div>

          <div className="form-control mt-6">
            <Submit className="btn btn-primary w-full" disabled={!enabled}>
              Submit
            </Submit>
          </div>
        </Form>
      </AuthLayout>
    </>
  )
}

export default ResetPasswordPage
