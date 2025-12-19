import { useEffect, useRef } from 'react'

import {
  Form,
  Label,
  TextField,
  PasswordField,
  Submit,
  FieldError,
} from '@cedarjs/forms'
import { Link, navigate, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { useAuth } from 'src/auth'
import AuthLayout from 'src/layouts/AuthLayout/AuthLayout'

const WELCOME_MESSAGE = 'Welcome back!'
const REDIRECT = routes.home()

/**
 * Sanitize email to lowercase
 */
const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}

const LoginPage = () => {
  const { isAuthenticated, logIn } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(REDIRECT)
    }
  }, [isAuthenticated])

  // focus on the username field as soon as the page loads
  const usernameRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    usernameRef.current?.focus()
  }, [])

  interface LoginCredentials {
    username: string
    password: string
  }

  interface LoginResponse {
    error?: string
    message?: string
  }

  const onSubmit = async (data: LoginCredentials): Promise<void> => {
    const response: LoginResponse = await logIn({
      username: sanitizeEmail(data.username),
      password: data.password,
    })

    if (response.error) {
      toast.error(response.error)
    } else {
      toast.success(WELCOME_MESSAGE)
    }
  }

  return (
    <>
      <Metadata title="Login" description="Login to your account" />
      <AuthLayout title="Login">
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

          <div className="form-control mt-4 w-full">
            <Label name="password" className="label">
              <span className="label-text">Password</span>
            </Label>
            <PasswordField
              name="password"
              className="input input-bordered w-full"
              errorClassName="input input-bordered input-error w-full"
              autoComplete="current-password"
              validation={{
                required: {
                  value: true,
                  message: 'Password is required',
                },
              }}
            />
            <div className="label">
              <span className="label-text-alt"></span>
              <Link
                to={routes.forgotPassword()}
                className="link-hover link label-text-alt"
              >
                Forgot Password?
              </Link>
            </div>
            <FieldError
              name="password"
              className="label-text-alt mt-1 text-error"
            />
          </div>

          <div className="form-control mt-6">
            <Submit className="btn btn-primary w-full">Login</Submit>
          </div>
        </Form>
      </AuthLayout>
    </>
  )
}

export default LoginPage
