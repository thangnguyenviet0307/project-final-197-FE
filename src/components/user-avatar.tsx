import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserAvatar({ name, avatar, className }: {
  name: string
  avatar?: string
  className?: string
}) {
  const parts = name.trim().split(/\s+/)
  const initials = ((parts[0]?.[0] ?? "U") + (parts.length > 1 ? parts.at(-1)?.[0] ?? "" : "")).toUpperCase()
  return <Avatar className={className}>
    {avatar && <AvatarImage src={avatar} alt={`Avatar for ${name}`} />}
    <AvatarFallback className="bg-primary/10 font-medium text-primary">{initials}</AvatarFallback>
  </Avatar>
}
