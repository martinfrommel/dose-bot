import { Link, routes } from '@cedarjs/router'
import { Metadata, useQuery } from '@cedarjs/web'
import gql from 'graphql-tag'

import UsersUserActions from 'src/components/UsersUserActions/UsersUserActions'

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      role
      createdAt
    }
  }
`

const UsersUsersPage = () => {
  const { data, loading, error, refetch } = useQuery(GET_USERS)

  const users = data?.users ?? []

  return (
    <>
      <Metadata title="Users" description="Manage users" />

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-base-content/70">Administer access and roles</p>
        </div>
        <Link to="/users/new" className="btn btn-primary">
          New User
        </Link>
      </div>

      {loading && (
        <div className="mt-6 rounded-lg border border-base-300 bg-base-100 p-6 shadow">
          <p className="text-sm text-base-content/70">Loading users...</p>
        </div>
      )}

      {error && (
        <div className="mt-6 alert alert-error">
          <span>Failed to load users: {error.message}</span>
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <div className="mt-6 alert alert-info">
          <span>No users found.</span>
        </div>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-lg border border-base-300 bg-base-100 shadow">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => {
                const initial = user.email?.charAt(0)?.toUpperCase() ?? '?'
                const joined = new Date(user.createdAt).toLocaleDateString()
                const roleClass = user.role === 'Admin' ? 'badge-warning' : 'badge-info'

                return (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="w-10 rounded-full bg-neutral text-neutral-content">
                            <span className="text-lg font-semibold">{initial}</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold">{user.email}</div>
                          <div className="text-sm text-base-content/70">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${roleClass}`}>{user.role}</span>
                    </td>
                    <td className="whitespace-nowrap text-sm text-base-content/80">{joined}</td>
                    <td className="text-right">
                      <UsersUserActions
                        userId={user.id}
                        userEmail={user.email}
                        onRefresh={() => refetch()}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default UsersUsersPage
