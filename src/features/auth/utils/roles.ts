export function isAdministrator(role: string | undefined): boolean {
  return role === "super_admin" || role === "admin"
}

export function canManageUser(actorRole: string | undefined, targetRole: string): boolean {
  return (targetRole === "admin" || targetRole === "staff") && (actorRole === "super_admin" || (actorRole === "admin" && targetRole === "staff"))
}
