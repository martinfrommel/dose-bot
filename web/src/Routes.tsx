// In this file, all Page components from 'src/pages` are auto-imported. Nested
// directories are supported, and should be uppercase. Each subdirectory will be
// prepended onto the component name.
//
// Examples:
//
// 'src/pages/HomePage/HomePage.js'         -> HomePage
// 'src/pages/Admin/BooksPage/BooksPage.js' -> AdminBooksPage

import { Router, Route, Set } from '@cedarjs/router'

import MainLayout from './layouts/MainLayout/MainLayout'

const Routes = () => {
  return (
    <Router>
      <Set wrap={MainLayout}>
        <Route path="/doses/new" page={DoseNewDosePage} name="newDose" />
        <Route path="/doses/{id}/edit" page={DoseEditDosePage} name="editDose" />
        <Route path="/doses/{id}" page={DoseDosePage} name="dose" />
        <Route path="/doses" page={DoseDosesPage} name="doses" />
        <Route path="/substances/new" page={SubstanceNewSubstancePage} name="newSubstance" />
        <Route path="/substances/{id}/edit" page={SubstanceEditSubstancePage} name="editSubstance" />
        <Route path="/substances/{id}" page={SubstanceSubstancePage} name="substance" />
        <Route path="/substances" page={SubstanceSubstancesPage} name="substances" />
        <Route path="/api-keys/new" page={ApiKeyNewApiKeyPage} name="newApiKey" />
        <Route path="/api-keys/{id}/edit" page={ApiKeyEditApiKeyPage} name="editApiKey" />
        <Route path="/api-keys/{id}" page={ApiKeyApiKeyPage} name="apiKey" />
        <Route path="/api-keys" page={ApiKeyApiKeysPage} name="apiKeys" />
        <Route path="/" page={HomePage} name="home" />
        <Route notfound page={NotFoundPage} />
      </Set>
    </Router>
  )
}

export default Routes
