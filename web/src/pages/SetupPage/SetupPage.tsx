import { useEffect, useRef } from 'react'

import gql from 'graphql-tag'

import {
  FieldError,
  Form,
  Label,
  PasswordField,
  Submit,
  TextField,
} from '@cedarjs/forms'
import { navigate, routes } from '@cedarjs/router'
import { Metadata, useMutation, useQuery } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'

import { useAuth } from 'src/auth'
import AuthLayout from 'src/layouts/AuthLayout/AuthLayout'

type SetupFormValues = {
  email: string
  password: string
  confirmPassword: string
}

const NEEDS_INITIAL_ADMIN = gql`
  query NeedsInitialAdminSetupPage {
    needsInitialAdmin
  }
`

const CREATE_INITIAL_ADMIN = gql`
  mutation CreateInitialAdmin($email: String!, $plainPassword: String!) {
    createInitialAdmin(email: $email, plainPassword: $plainPassword) {
      id
      email
      role
    }
  }
`

const sanitizeEmail = (email: string): string => email.trim().toLowerCase()

const SetupPage = () => {
  const emailRef = useRef<HTMLInputElement>(null)
  const { isAuthenticated, logIn, loading: authLoading } = useAuth()
  const { data, loading, error, refetch } = useQuery(NEEDS_INITIAL_ADMIN)
  const [createInitialAdmin, { loading: creating }] =
    useMutation(CREATE_INITIAL_ADMIN)

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  useEffect(() => {
    if (loading || authLoading) return
    const needsSetup = data?.needsInitialAdmin

    if (!needsSetup) {
      navigate(isAuthenticated ? routes.home() : routes.login(), {
        replace: true,
      })
    }
  }, [authLoading, data, isAuthenticated, loading])

  const onSubmit = async (values: SetupFormValues) => {
    if (values.password !== values.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    const email = sanitizeEmail(values.email)

    try {
      await createInitialAdmin({
        variables: { email, plainPassword: values.password },
      })

      const loginResult = await logIn({
        username: email,
        password: values.password,
      })

      if (loginResult?.error) {
        toast.error(loginResult.error)
        return
      }

      toast.success('Admin account created')
      navigate(routes.home(), { replace: true })
    } catch (setupError: any) {
      toast.error(setupError?.message || 'Failed to create admin account')
      await refetch()
    }
  }

  const needsSetup = data?.needsInitialAdmin
  const isLoading = loading || authLoading

  return (
    <>
      <Metadata
        title="Initial Setup"
        description="Create the first admin user"
      />
      <AuthLayout title="Create admin account">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 text-sm text-base-content/70">
            <span className="loading loading-spinner loading-md" />
            <span>Checking setup status...</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="alert alert-error">
            <span>
              Unable to verify setup status. Please reload or contact an
              administrator.
            </span>
          </div>
        )}

        {!isLoading && needsSetup && (
          <Form onSubmit={onSubmit} className="space-y-4">
            <div className="alert ">
              <div>
                <p className="font-semibold">One-time setup</p>
                <p className="text-sm text-base-content/80">
                  Create the first admin account for DoseBot. After this step,
                  self-signup is disabled.
                </p>
              </div>
            </div>

            <div className="form-control w-full">
              <Label name="email" className="label">
                <span className="label-text">Email</span>
              </Label>
              <TextField
                name="email"
                className="input input-bordered w-full"
                errorClassName="input input-bordered input-error w-full"
                ref={emailRef}
                validation={{
                  required: {
                    value: true,
                    message: 'Email is required',
                  },
                }}
                autoComplete="email"
              />
              <FieldError
                name="email"
                className="label-text-alt mt-1 text-error"
              />
            </div>

            <div className="form-control w-full">
              <Label name="password" className="label">
                <span className="label-text">Password</span>
              </Label>
              <PasswordField
                name="password"
                className="input input-bordered w-full"
                errorClassName="input input-bordered input-error w-full"
                autoComplete="new-password"
                validation={{
                  required: {
                    value: true,
                    message: 'Password is required',
                  },
                  minLength: {
                    value: 8,
                    message: 'Use at least 8 characters',
                  },
                }}
              />
              <FieldError
                name="password"
                className="label-text-alt mt-1 text-error"
              />
            </div>

            <div className="form-control w-full">
              <Label name="confirmPassword" className="label">
                <span className="label-text">Confirm password</span>
              </Label>
              <PasswordField
                name="confirmPassword"
                className="input input-bordered w-full"
                errorClassName="input input-bordered input-error w-full"
                autoComplete="new-password"
                validation={{
                  required: {
                    value: true,
                    message: 'Please confirm your password',
                  },
                }}
              />
              <FieldError
                name="confirmPassword"
                className="label-text-alt mt-1 text-error"
              />
            </div>

            <div className="form-control pt-2">
              <Submit className="btn btn-primary w-full" disabled={creating}>
                {creating ? 'Creating admin...' : 'Create admin account'}
              </Submit>
            </div>
          </Form>
        )}
      </AuthLayout>
    </>
  )
}

export default SetupPage
