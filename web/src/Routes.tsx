// In this file, all Page components from 'src/pages` are auto-imported. Nested
// directories are supported, and should be uppercase. Each subdirectory will be
// prepended onto the component name.
//
// Examples:
//
// 'src/pages/HomePage/HomePage.js'         -> HomePage
// 'src/pages/Admin/BooksPage/BooksPage.js' -> AdminBooksPage

import { useEffect, useRef } from 'react'

import { useApolloClient } from '@apollo/client'
import gql from 'graphql-tag'
import type { Role } from 'types/graphql'

import { PrivateSet, Route, Router, Set, navigate, routes, useLocation } from '@cedarjs/router'

import { useAuth } from './auth.js'
import { AnalyticsRouteTracker } from './components/Analytics/Analytics'
import ItemViewLayout from './layouts/ItemViewLayout/ItemViewLayout'
import MainLayout from './layouts/MainLayout/MainLayout'

const NEEDS_INITIAL_ADMIN = gql`
  query NeedsInitialAdminRoutes {
    needsInitialAdmin
  }
`

const InitialSetupGate = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const hasCheckedRef = useRef(false)
  const apollo = useApolloClient()

  useEffect(() => {
    if (authLoading || hasCheckedRef.current) return
    hasCheckedRef.current = true

    apollo
      .query({ query: NEEDS_INITIAL_ADMIN, fetchPolicy: 'network-only' })
      .then(({ data }) => {
        const needsSetup = data?.needsInitialAdmin
        const onSetupPage = location.pathname === routes.setup()

        if (needsSetup && !onSetupPage) {
          navigate(routes.setup(), { replace: true })
          return
        }

        if (!needsSetup && onSetupPage) {
          navigate(isAuthenticated ? routes.home() : routes.login(), {
            replace: true,
          })
        }
      })
      .catch(() => {
        // On errors, allow normal flow; SetupPage itself will surface issues
        hasCheckedRef.current = false
      })
  }, [apollo, authLoading, isAuthenticated, location.pathname])

  return <>{children}</>
}

const Routes = () => {
  return (
    <Router useAuth={useAuth}>
      <Set wrap={AnalyticsRouteTracker}>
        <Set wrap={InitialSetupGate}>
          <Route path="/setup" page={SetupPage} name="setup" />
          <Route path="/login" page={LoginPage} name="login" />
          <Route path="/forgot-password" page={ForgotPasswordPage} name="forgotPassword" prerender />
          <Route path="/reset-password" page={ResetPasswordPage} name="resetPassword" prerender />
          <PrivateSet unauthenticated={'login'} wrap={MainLayout}>
            <PrivateSet unauthenticated={'home'} roles={['Admin' as Role]}>
              <Route path="/users" page={UsersUsersPage} name="users" />
              <Route path="/users/new" page={UsersNewUserPage} name="usersNewUser" />
            </PrivateSet>
            <Set wrap={ItemViewLayout}>
              <Route path="/substances/{slug}/doses/new" page={DoseNewDosePage} name="newDose" />
              <Route path="/substances/{slug}/doses/{id}/edit" page={DoseEditDosePage} name="editDose" />
              <Route path="/substances/{slug}/doses/{id}" page={DoseDosePage} name="dose" />
              <Route path="/substances/new" page={SubstanceNewSubstancePage} name="newSubstance" />
              <Route path="/substances/{slug}/edit" page={SubstanceEditSubstancePage} name="editSubstance" />
              <Route path="/substances/{slug}" page={SubstanceSubstancePage} name="substance" />
              <Route path="/substances/{slug}/doses" page={DoseDosesPage} name="doses" />
            </Set>
            <Route path="/substances" page={SubstanceSubstancesPage} name="substances" />
            <Route path="/api-keys/new" page={ApiKeyNewApiKeyPage} name="newApiKey" />
            <Route path="/api-keys/{id}/edit" page={ApiKeyEditApiKeyPage} name="editApiKey" />
            <Route path="/api-keys/{id}" page={ApiKeyApiKeyPage} name="apiKey" />
            <Route path="/api-keys" page={ApiKeyApiKeysPage} name="apiKeys" />
            <Route path="/" page={HomePage} name="home" prerender />
            <Route notfound page={NotFoundPage} prerender />
          </PrivateSet>
        </Set>
      </Set>
    </Router>
  )
}

export default Routes
