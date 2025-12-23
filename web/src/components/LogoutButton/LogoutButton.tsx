import { useAuth } from 'src/auth'

type LogoutButtonProps = {
  className?: string
}

const LogoutButton = ({ className }: LogoutButtonProps) => {
  const { logOut } = useAuth()
  return (
    <button
      className={className ?? 'btn btn-secondary'}
      onClick={() => logOut()}
      type="button"
    >
      Logout
    </button>
  )
}

export default LogoutButton
