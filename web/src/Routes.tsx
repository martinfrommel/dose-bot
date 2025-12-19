// In this file, all Page components from 'src/pages` are auto-imported. Nested
// directories are supported, and should be uppercase. Each subdirectory will be
// prepended onto the component name.
//
// Examples:
//
// 'src/pages/HomePage/HomePage.js'         -> HomePage
// 'src/pages/Admin/BooksPage/BooksPage.js' -> AdminBooksPage

import { Router, Route, Set, PrivateSet } from '@cedarjs/router'

import UsersNewUserPage from 'src/pages/UsersNewUserPage/UsersNewUserPage'
import UsersUsersPage from 'src/pages/UsersUsersPage/UsersUsersPage'

import { useAuth } from './auth.js'
import ItemViewLayout from './layouts/ItemViewLayout/ItemViewLayout'
import MainLayout from './layouts/MainLayout/MainLayout'

const Routes = () => {
  return (
    <Router useAuth={useAuth}>
      <Route path="/login" page={LoginPage} name="login" prerender />
      <Route path="/forgot-password" page={ForgotPasswordPage} name="forgotPassword" prerender />
      <Route path="/reset-password" page={ResetPasswordPage} name="resetPassword" prerender />
      <PrivateSet unauthenticated={'login'} wrap={MainLayout}>
        <PrivateSet unauthenticated={'/'} roles={'Admin'}>
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
        <Route path="/" page={HomePage} name="home" />
        <Route notfound page={NotFoundPage} prerender />
      </PrivateSet>
    </Router>
  )
}

export default Routes
