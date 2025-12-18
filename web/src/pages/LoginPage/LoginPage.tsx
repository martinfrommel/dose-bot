import { useEffect, useRef, useState } from 'react'

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

const LoginPage = ({ type }) => {
  const {
    isAuthenticated,
    client: webAuthn,
    loading,
    logIn,
    reauthenticate,
  } = useAuth()
  const [shouldShowWebAuthn, setShouldShowWebAuthn] = useState(false)
  const [showWebAuthn, setShowWebAuthn] = useState(
    webAuthn.isEnabled() && type !== 'password'
  )

  // should redirect right after login or wait to show the webAuthn prompts?
  useEffect(() => {
    if (isAuthenticated && (!shouldShowWebAuthn || webAuthn.isEnabled())) {
      navigate(REDIRECT)
    }
  }, [isAuthenticated, shouldShowWebAuthn])

  // if WebAuthn is enabled, show the prompt as soon as the page loads
  useEffect(() => {
    if (!loading && !isAuthenticated && showWebAuthn) {
      onAuthenticate()
    }
  }, [loading, isAuthenticated])

  // focus on the username field as soon as the page loads
  const usernameRef = useRef()
  useEffect(() => {
    usernameRef.current && usernameRef.current.focus()
  }, [])

  const onSubmit = async (data) => {
    const webAuthnSupported = await webAuthn.isSupported()

    if (webAuthnSupported) {
      setShouldShowWebAuthn(true)
    }
    const response = await logIn({
      username: data.username,
      password: data.password,
    })

    if (response.message) {
      // auth details good, but user not logged in
      toast(response.message)
    } else if (response.error) {
      // error while authenticating
      toast.error(response.error)
    } else {
      // user logged in
      if (webAuthnSupported) {
        setShowWebAuthn(true)
      } else {
        toast.success(WELCOME_MESSAGE)
      }
    }
  }

  const onAuthenticate = async () => {
    try {
      await webAuthn.authenticate()
      await reauthenticate()
      toast.success(WELCOME_MESSAGE)
      navigate(REDIRECT)
    } catch (e) {
      if (e.name === 'WebAuthnDeviceNotFoundError') {
        toast.error(
          'Device not found, log in with Username/Password to continue'
        )
        setShowWebAuthn(false)
      } else {
        toast.error(e.message)
      }
    }
  }

  const onRegister = async () => {
    try {
      await webAuthn.register()
      toast.success(WELCOME_MESSAGE)
      navigate(REDIRECT)
    } catch (e) {
      toast.error(e.message)
    }
  }

  const onSkip = () => {
    toast.success(WELCOME_MESSAGE)
    setShouldShowWebAuthn(false)
  }

  const AuthWebAuthnPrompt = () => {
    return (
      <div className="card bg-base-200">
        <div className="card-body text-center">
          <h3 className="text-xl font-semibold">WebAuthn Login Enabled</h3>
          <p className="text-base-content/70">
            Log in with your fingerprint, face or PIN
          </p>
          <div className="card-actions justify-center mt-4">
            <button className="btn btn-primary" onClick={onAuthenticate}>
              Open Authenticator
            </button>
          </div>
        </div>
      </div>
    )
  }

  const RegisterWebAuthnPrompt = () => (
    <div className="card bg-base-200">
      <div className="card-body text-center">
        <h3 className="text-xl font-semibold">No more Passwords!</h3>
        <p className="text-base-content/70">
          Depending on your device you can log in with your fingerprint, face or
          PIN next time.
        </p>
        <div className="card-actions justify-center mt-4 gap-2">
          <button className="btn btn-primary" onClick={onRegister}>
            Turn On
          </button>
          <button className="btn btn-ghost" onClick={onSkip}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )

  const PasswordForm = () => (
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
          autoFocus
          validation={{
            required: {
              value: true,
              message: 'Username is required',
            },
          }}
        />
        <FieldError name="username" className="label-text-alt text-error mt-1" />
      </div>

      <div className="form-control w-full mt-4">
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
            className="label-text-alt link link-hover"
          >
            Forgot Password?
          </Link>
        </div>
        <FieldError name="password" className="label-text-alt text-error mt-1" />
      </div>

      <div className="form-control mt-6">
        <Submit className="btn btn-primary w-full">Login</Submit>
      </div>
    </Form>
  )

  const formToRender = () => {
    if (showWebAuthn) {
      if (webAuthn.isEnabled()) {
        return <AuthWebAuthnPrompt />
      } else {
        return <RegisterWebAuthnPrompt />
      }
    } else {
      return <PasswordForm />
    }
  }

  const linkToRender = () => {
    if (showWebAuthn) {
      if (webAuthn.isEnabled()) {
        return (
          <div className="divider">OR</div>,
          <a href="?type=password" className="link link-hover">
            Login with username and password
          </a>
        )
      }
    }
    return null
  }

  if (loading) {
    return null
  }

  return (
    <>
      <Metadata title="Login" />
      <AuthLayout title="Login">
        {formToRender()}
        {linkToRender()}
      </AuthLayout>
    </>
  )
}

export default LoginPage
