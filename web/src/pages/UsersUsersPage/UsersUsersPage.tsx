import gql from 'graphql-tag'

import { Link, routes } from '@cedarjs/router'
import { Metadata, useQuery } from '@cedarjs/web'

import { useAuth } from 'src/auth'
import UserAvatar from 'src/components/UserAvatar/UserAvatar'
import UsersUserActions from 'src/components/UsersUserActions/UsersUserActions'

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      avatarUrl
      role
      createdAt
    }
  }
`

const UsersUsersPage = () => {
  const { data, loading, error, refetch } = useQuery(GET_USERS)
  const { currentUser } = useAuth()

  const users = data?.users ?? []

  return (
    <>
      <Metadata title="Users" description="Manage users" />

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-base-content/70">
            Administer access and roles
          </p>
        </div>
        <Link to={routes.usersNewUser()} className="btn btn-primary">
          New User
        </Link>
      </div>

      {loading && (
        <div className="mt-6 rounded-lg border border-base-300 bg-base-100 p-6 shadow">
          <p className="text-sm text-base-content/70">Loading users...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error mt-6">
          <span>Failed to load users: {error.message}</span>
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <div className="alert alert-info mt-6">
          <span>No users found.</span>
        </div>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="mt-6 rounded-lg border border-base-300 bg-base-100 shadow">
          <div className="overflow-x-auto">
            <table className="table table-sm">
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
                  const joined = new Date(user.createdAt).toLocaleDateString()
                  const roleClass =
                    user.role === 'Admin' ? 'badge-warning' : 'badge-info'
                  const isSelf = currentUser?.id === user.id
                  const isAdminTarget = user.role === 'Admin'
                  const canDelete = !isSelf && !isAdminTarget
                  const deleteTooltip = isSelf
                    ? 'You cannot delete your own account.'
                    : isAdminTarget
                      ? 'Admins cannot delete other admins.'
                      : undefined

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            email={user.email}
                            avatarUrl={user.avatarUrl}
                            size="sm"
                          />
                          <div>
                            <div
                              className="max-w-[16rem] truncate font-semibold sm:max-w-none"
                              title={user.email}
                            >
                              {user.email}
                            </div>
                            <div className="break-all text-sm text-base-content/70">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${roleClass}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap text-sm text-base-content/80">
                        {joined}
                      </td>
                      <td className="text-right">
                        <UsersUserActions
                          userId={user.id}
                          userEmail={user.email}
                          canDelete={canDelete}
                          deleteTooltip={deleteTooltip}
                          onRefresh={() => refetch()}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

export default UsersUsersPage
