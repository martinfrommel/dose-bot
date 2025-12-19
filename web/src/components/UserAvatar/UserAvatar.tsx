type UserAvatarProps = {
  email: string
  avatarUrl?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const sizeClasses: Record<NonNullable<UserAvatarProps['size']>, string> = {
  xs: 'w-8',
  sm: 'w-10',
  md: 'w-12',
  lg: 'w-16',
}

const UserAvatar = ({ email, avatarUrl, size = 'sm' }: UserAvatarProps) => {
  const initial = email?.charAt(0)?.toUpperCase() || '?'
  const dimension = sizeClasses[size]

  return (
    <div className={`avatar ${!avatarUrl && 'placeholder'}`}>
      {avatarUrl ? (
        <div
          className={`${dimension} rounded-full border border-base-300 bg-base-200`}
        >
          <img
            src={avatarUrl}
            alt={`Avatar for ${email}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div
          className={`${dimension} rounded-full bg-neutral text-neutral-content`}
        >
          <span className="text-lg font-semibold">{initial}</span>
        </div>
      )}
    </div>
  )
}

export type { UserAvatarProps }
export default UserAvatar
