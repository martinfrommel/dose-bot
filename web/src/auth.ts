import { createDbAuthClient, createAuth } from '@cedarjs/auth-dbauth-web'

// WebAuthn is disabled due to import issues with Cedar 2.1.0
// TODO: Re-enable when package exports are fixed
const dbAuthClient = createDbAuthClient()

export const { AuthProvider, useAuth } = createAuth(dbAuthClient)
