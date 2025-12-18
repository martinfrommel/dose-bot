import { useEffect, useRef } from 'react'

import { Form, Label, TextField, Submit, FieldError } from '@cedarjs/forms'
import { navigate, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { useAuth } from 'src/auth'
import BackButton from 'src/components/BackButton/BackButton'
import AuthLayout from 'src/layouts/AuthLayout/AuthLayout'

const ForgotPasswordPage = () => {
  const { isAuthenticated, forgotPassword } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.home())
    }
  }, [isAuthenticated])

  const usernameRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    usernameRef?.current?.focus()
  }, [])

  const onSubmit = async (data: { username: string }) => {
    const response = await forgotPassword(data.username)

    if (response.error) {
      toast.error(response.error)
    } else {
      // The function `forgotPassword.handler` in api/src/functions/auth.js has
      // been invoked, let the user know how to get the link to reset their
      // password (sent in email, perhaps?)
      toast.success(
        'A link to reset your password was sent to ' + response.email
      )
      navigate(routes.login())
    }
  }

  return (
    <>
      <Metadata title="Forgot Password" description="Reset your password" />
      <AuthLayout title="Forgot Password">
        <Form onSubmit={onSubmit}>
          <div className="form-control w-full">
            <Label name="username" className="label">
              <span className="label-text">Username</span>
            </Label>
            <TextField
              name="username"
              className="input input-bordered w-full"
              errorClassName="input input-bordered input-error w-full"
              ref={usernameRef}
              validation={{
                required: {
                  value: true,
                  message: 'Username is required',
                },
              }}
            />
            <FieldError
              name="username"
              className="label-text-alt mt-1 text-error"
            />
          </div>

          <div className="form-control mt-6">
            <Submit className="btn btn-primary w-full">Submit</Submit>
          </div>
        </Form>
        <BackButton />
      </AuthLayout>
    </>
  )
}

export default ForgotPasswordPage
