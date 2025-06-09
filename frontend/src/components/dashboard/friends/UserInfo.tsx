import { FriendData } from '@/types/friends'

interface UserInfoProps {
  user: Pick<FriendData, 'id' | 'username' | 'first_name' | 'last_name' | 'avatar' | 'is_online'> | { 
    userId: number;
    username?: string;
    avatar?: string;
  }
  minimal?: boolean
}

export function UserInfo({ user, minimal = false }: UserInfoProps) {
  const isMinimal = 'userId' in user
  const userId = isMinimal ? user.userId : user.id
  const username = isMinimal ? user.username : user.username
  const avatar = isMinimal ? user.avatar : user.avatar
  
  const firstName = !isMinimal && 'first_name' in user ? user.first_name : ''
  const lastName = !isMinimal && 'last_name' in user ? user.last_name : ''
  const isOnline = !isMinimal && 'is_online' in user ? user.is_online : false  
  const defaultAvatarPath = "/data/avatars/default.png"
  
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          {avatar ? (
            <img src={avatar} alt={username || `User ${userId}`} className="h-10 w-10 rounded-full" />
          ) : (
            <img src={defaultAvatarPath} alt={username || `User ${userId}`} className="h-10 w-10 rounded-full" />
          )}
        </div>
        {!isMinimal && isOnline && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background"></span>
        )}
      </div>
      <div>
        {(!isMinimal && (firstName || lastName)) ? (
          <p className="font-medium text-sm">{firstName} {lastName}</p>
        ) : null}
        <p className={`${(!isMinimal && (firstName || lastName)) ? 'text-xs text-muted-foreground' : 'font-medium text-sm'}`}>
          @{username || `User ${userId}`}
        </p>
      </div>
    </div>
  )
}
