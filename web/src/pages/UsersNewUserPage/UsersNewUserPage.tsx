import { useMutation } from '@cedarjs/web/apollo'
import { navigate, routes } from '@cedarjs/router'
import { Metadata } from '@cedarjs/web'
import { toast } from '@cedarjs/web/toast'
import gql from 'graphql-tag'

import { useAuth } from 'src/auth'
import UsersUserForm from 'src/components/UsersUserForm'

const CREATE_USER = gql`
  mutation CreateUser($email: String!, $plainPassword: String!, $role: Role) {
    createUser(email: $email, plainPassword: $plainPassword, role: $role) {
      id
      email
      role
    }
  }
`

interface FormData {
  email: string
  plainPassword: string
  role?: string
}

const UsersNewUserPage = () => {
  const { currentUser } = useAuth()
  const [createUser, { loading }] = useMutation(CREATE_USER)

  // Only admins can access this page
  if (currentUser?.email !== process.env.REACT_APP_ADMIN_EMAIL && currentUser?.email !== 'admin@dosebot.local') {
    return (
      <>
        <Metadata title="Access Denied" description="You do not have permission to access this page" />
        <div className="flex min-h-screen items-center justify-center">
          <div className="alert alert-error">
            <span>Only admins can create new users.</span>
          </div>
        </div>
      </>
    )
  }

  const handleSubmit = async (data: FormData) => {
    try {
      const { data: result } = await createUser({
        variables: {
          email: data.email,
          plainPassword: data.plainPassword,
          role: data.role || 'User',
        },
      })

      toast.success(`User ${result.createUser.email} created successfully`)
      navigate(routes.home())
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user')
    }
  }

  return (
    <>
      <Metadata title="Create New User" description="Create a new user account" />
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Create New User</h1>
        <UsersUserForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </>
  )
}

export default UsersNewUserPage
