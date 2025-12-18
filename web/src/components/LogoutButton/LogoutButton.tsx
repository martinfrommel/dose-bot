import { useAuth } from 'src/auth'

const LogoutButton = () => {
  const { logOut } = useAuth()
  return (
    <button className="btn btn-secondary" onClick={() => logOut()}>
      Logout
    </button>
  )
}

export default LogoutButton
