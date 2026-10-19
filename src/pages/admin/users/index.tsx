import { Link } from "react-router-dom"
import { ListPagination } from "@/components/list-pagination"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ContentSkeleton } from "@/components/page-skeleton"
import { useEffect, useMemo, useState, type FormEvent } from "react"
import {
  ArrowDown, ArrowUp, BriefcaseBusiness, Users, CheckCircle2, CirclePause,
  KeyRound,
  LoaderCircle, MoreHorizontal, ShieldCheck,
  Trash2, UserRound, UserRoundPlus, X,
} from "lucide-react"
import { BaseLayout } from "@/layout/admin/base-layout"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getTemporaryPassword, type ManagedUser } from "@/features/users/services/users.service"
import { api, getApiError } from "@/services/api"
import { useAuthStore } from "@/stores/auth.store"
import { useUsers } from "@/features/users/hooks/use-users"
import { useResetUserPassword } from "@/features/users/hooks/use-reset-user-password"
import { DeleteUserConfirmation } from "@/features/users/components/delete-user-confirmation"
import { queryClient } from "@/services/query-client"
import "@/pages/admin/users/index.css"

type Status = "all" | "active" | "suspended"
type Column = "username" | "name" | "email" | "phone" | "status" | "role"
const columns: { key: Column; label: string; width: string }[] = [
  { key: "username", label: "Username", width: "20%" },
  { key: "name", label: "Name", width: "18%" },
  { key: "email", label: "Email", width: "25%" },
  { key: "phone", label: "Phone Number", width: "15%" },
  { key: "status", label: "Status", width: "10%" },
  { key: "role", label: "Role", width: "8%" },
]
const roleOptions = [
  { value: "all", label: "All roles" }, { value: "admin", label: "Admin" },
  { value: "staff", label: "Staff" },
] as const
const statusOptions = [
  { value: "all", label: "All statuses" }, { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
] as const

function getDisplayName(user: ManagedUser) {
  return `${user.firstName || ""} ${user.lastName || ""}`.trim()
}
function getUsername(user: ManagedUser) { return user.email.split("@")[0] || "" }
function getRoleLabel(role: ManagedUser["role"]) {
  return role.charAt(0).toUpperCase() + role.slice(1)
}
function getRoleIcon(role: ManagedUser["role"]) {
  const Icon = role === "admin" ? ShieldCheck : BriefcaseBusiness
  return <Icon aria-hidden="true" className="size-4.5 shrink-0 text-muted-foreground" />
}
function getStatus(user: ManagedUser): Exclude<Status, "all"> {
  return user.active ? "active" : "suspended"
}

function FilterMenu<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void
}) {
  const id = label === "Account status" ? "users-status" : "users-role"
  return <Field><FieldLabel htmlFor={id}>{label}</FieldLabel>
    <select id={id} className="h-8 rounded-md border bg-background px-2 text-sm" value={value} onChange={event => {
      const selected = options.find(option => option.value === event.target.value)
      if (selected) onChange(selected.value)
    }}>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
  </Field>
}

function ResetPasswordDialog({ user, onClose }: { user: ManagedUser; onClose: () => void }) {
  const mutation = useResetUserPassword(user._id, { onSuccess: onClose })
  const [password] = useState(() => getTemporaryPassword(user.role))
  return (
    <Dialog open onOpenChange={open => { if (!open && !mutation.isPending) onClose() }}>
      <DialogContent className="users-surface sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>Set a temporary password for {user.email}. They will need to change it at their next sign-in.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={event => { event.preventDefault(); mutation.mutate({ password }) }}>
          <Field>
            <FieldLabel htmlFor="reset-password-default">New temporary password</FieldLabel>
            <Input id="reset-password-default" value={password} readOnly />
          </Field>
          {mutation.error && <p role="alert" className="text-sm text-destructive">{getApiError(mutation.error).message}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <LoaderCircle className="animate-spin" />}Save changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function UserProfileDialog({ user, onClose }: { user: ManagedUser; onClose: () => void }) {
  const name = getDisplayName(user)
  const details = [
    ["Username", getUsername(user)], ["First name", user.firstName],
    ["Last name", user.lastName], ["Account email", user.email],
    ["Personal email", user.personalEmail], ["Phone number", user.phone],
    ["Location", user.location],
  ]
  return (
    <Dialog open onOpenChange={open => { if (!open) onClose() }}>
      <DialogContent className="users-surface max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>User profile</DialogTitle>
          <DialogDescription>Account information for {name || user.email}.</DialogDescription>
        </DialogHeader>
        <div className="flex min-w-0 items-center gap-4 rounded-lg bg-muted/50 p-4">
          <UserAvatar name={name || getUsername(user)} avatar={user.avatar} className="size-14" />
          <div className="min-w-0">
            <p className="wrap-break-word text-lg font-semibold">{name || getUsername(user)}</p>
            <p className="break-all text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          {details.map(([label, value]) => <div key={label} className="min-w-0">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-1 wrap-break-word text-sm">{value?.trim() || "Not provided"}</dd>
          </div>)}
          <div><dt className="text-xs text-muted-foreground">Role</dt>
            <dd className="mt-1 flex items-center gap-2">{getRoleIcon(user.role)}{getRoleLabel(user.role)}</dd>
          </div>
          <div><dt className="text-xs text-muted-foreground">Status</dt>
            <dd className="mt-1"><Badge variant={user.active ? "secondary" : "destructive"}>{user.active ? "Active" : "Suspended"}</Badge></dd>
          </div>
          <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">Bio</dt>
            <dd className="mt-1 whitespace-pre-wrap wrap-break-word text-sm">{user.bio?.trim() || "Not provided"}</dd>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  )
}

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const limit = 10
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<Status>("all")
  const [roleFilter, setRoleFilter] = useState<"all" | ManagedUser["role"]>("all")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [profileUser, setProfileUser] = useState<ManagedUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null)
  const [resetTarget, setResetTarget] = useState<ManagedUser | null>(null)
  const [editUser, setEditUser] = useState<ManagedUser | null>(null)
  const [editRole, setEditRole] = useState<ManagedUser["role"]>("staff")
  const [editActive, setEditActive] = useState(true)
  const [editError, setEditError] = useState("")
  const [isSavingRole, setIsSavingRole] = useState(false)
  const currentUser = useAuthStore(state => state.user)

  useEffect(() => {
    if (searchInput.trim() === search) return
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim()); setPage(1)
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [searchInput, search])

  const users = useUsers(page, search, limit)

  const visibleUsers = useMemo(() => (users.data?.data ?? [])
    .filter(user => (roleFilter === "all" || user.role === roleFilter) && (statusFilter === "all" || getStatus(user) === statusFilter))
    .sort((left, right) => {
      const result = getUsername(left).localeCompare(getUsername(right), undefined, { sensitivity: "base" })
      return sortDirection === "asc" ? result : -result
    }), [users.data, roleFilter, statusFilter, sortDirection])
  const totalPages = Math.max(1, users.data?.pagination.totalPages ?? 1)
  const isBusy = users.isFetching && users.isPlaceholderData

  function changePage(next: number) { setPage(next) }
  function openEditUser(user: ManagedUser) {
    setEditUser(user); setEditRole(user.role); setEditActive(user.active); setEditError("")
  }
  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editUser) return
    try {
      setIsSavingRole(true); setEditError("")
      await api.put(`/users/${encodeURIComponent(editUser._id)}`, { role: editRole, active: editActive })
      setEditUser(null)
      await queryClient.invalidateQueries({ queryKey: ["users"] })
    } catch (error) { setEditError(getApiError(error).message) }
    finally { setIsSavingRole(false) }
  }

  const statistics = [
    { label: "Matching accounts", value: users.data?.pagination.total, caption: "Across all result pages", Icon: Users, color: "text-muted-foreground" },
    { label: "Active accounts", value: users.data?.data.filter(user => user.active).length, caption: "On this page", Icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Suspended accounts", value: users.data?.data.filter(user => !user.active).length, caption: "On this page", Icon: CirclePause, color: "text-amber-600 dark:text-amber-400" },
  ]
  return (
    <BaseLayout title="Users" description="Manage your team accounts, roles and access.">
      <section className="space-y-4 px-4 lg:px-6" aria-label="User management">
        <section aria-label="User statistics" className="grid grid-cols-2 gap-4 md:grid-cols-3" aria-busy={users.isFetching}>
          {statistics.map(({ label, value, caption, Icon, color }) => <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">{label}</CardTitle>
              <Icon className={`size-4 shrink-0 ${color}`} />
            </CardHeader>
            <CardContent><div className={`text-2xl font-bold ${color}`}>{users.isPending ? <Skeleton className="h-8 w-20" /> : users.isError ? "-" : value ?? "-"}</div><p className="mt-1 text-xs text-muted-foreground">{caption}</p></CardContent>
          </Card>)}
        </section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{users.data ? `${users.data.pagination.total} accounts` : "User accounts"}</p>
          <Button nativeButton={false} role="link" render={<Link to="/users/new" />}><UserRoundPlus />Add User</Button>
        </div>
        <div role="search" aria-label="Filter users" className="space-y-3 rounded-lg border p-4">
          <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field className="lg:col-span-2"><FieldLabel htmlFor="users-search">Name or account email</FieldLabel>
              <div className="relative"><Input id="users-search" aria-label="Search accounts by name or account email" maxLength={200} value={searchInput} onChange={event => setSearchInput(event.target.value)} className="pr-9" />
                {searchInput && <Button variant="ghost" size="icon-sm" aria-label="Clear account search" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => { setSearchInput(""); setSearch(""); changePage(1) }}><X className="size-3.5" /></Button>}
              </div>
            </Field>
            <FilterMenu label="Account status" value={statusFilter} options={statusOptions} onChange={setStatusFilter} />
            <FilterMenu label="Account role" value={roleFilter} options={roleOptions} onChange={setRoleFilter} />
            <Button type="button" variant="outline" className="sm:col-span-2 lg:col-span-4 lg:justify-self-end" onClick={() => { setSearchInput(""); setSearch(""); setStatusFilter("all"); setRoleFilter("all"); setPage(1) }}>Reset filters</Button>
          </div>
          <p className="text-xs text-muted-foreground">Role, status and sorting apply to the current page.</p>
        </div>
        <p role="status" className="text-sm text-muted-foreground">{users.isFetching && !users.isLoading ? search ? "Searching" : "Updating" : ""}</p>

        {users.isError && <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <span>{getApiError(users.error).message}</span><Button variant="outline" size="sm" onClick={() => void users.refetch()}>Retry</Button>
        </div>}

        <div className="overflow-hidden rounded-lg border border-border">
          <Table className="w-full min-w-250 table-fixed" aria-label="User list table" aria-busy={users.isFetching}>
            <colgroup>{columns.map(column => <col key={column.key} style={{ width: column.width }} />)}<col style={{ width: "4%" }} /></colgroup>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map(column => <TableHead key={column.key}
                  aria-sort={column.key === "username" ? sortDirection === "asc" ? "ascending" : "descending" : undefined}>
                  {column.key === "username" ? <button type="button" aria-label="Sort by username" title="Sort by username" className="inline-flex cursor-pointer items-center gap-3 rounded py-1 focus-visible:outline-2 focus-visible:outline-ring"
                    onClick={() => setSortDirection(previous => previous === "asc" ? "desc" : "asc")}>{column.label}
                    {sortDirection === "asc" ? <ArrowUp className="size-4 cursor-pointer" /> : <ArrowDown className="size-4 cursor-pointer" />}
                  </button> : column.label}
                </TableHead>)}
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleUsers.map(user => {
                const status = getStatus(user)
                return <TableRow key={user._id} tabIndex={0} aria-haspopup="dialog"
                  aria-label={`View profile for ${user.email}`}
                  className="cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                  onClick={() => setProfileUser(user)}
                  onKeyDown={event => {
                    if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
                      event.preventDefault(); setProfileUser(user)
                    }
                  }}>
                  {columns.map(column => <TableCell key={column.key} className={column.key === "username" ? "font-medium" : ""}>
                    {column.key === "status" ? <Badge variant={user.active ? "default" : "secondary"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
                      : column.key === "role" ? <div className="flex items-center gap-2.5">{getRoleIcon(user.role)}<span className="truncate">{getRoleLabel(user.role)}</span></div>
                      : column.key === "username" ? <div className="flex min-w-0 items-center gap-2.5">
                        <span aria-hidden="true" className="shrink-0"><UserAvatar name={getDisplayName(user) || getUsername(user)} avatar={user.avatar} /></span>
                        <span className="block min-w-0 truncate" title={getUsername(user)}>{getUsername(user)}</span>
                      </div>
                      : <span className="block truncate" title={column.key === "name" ? getDisplayName(user) : user[column.key] || undefined}>
                        {column.key === "name" ? getDisplayName(user) : user[column.key] || "\u2014"}
                      </span>}
                  </TableCell>)}
                  <TableCell className="px-1 text-center" onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" disabled={user._id === currentUser?.id || isBusy} aria-label={`Edit account ${user.email}`} className="cursor-pointer rounded-md" />}><MoreHorizontal className="size-4.5" /></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="users-surface w-48">
                        <DropdownMenuItem onClick={() => openEditUser(user)}><UserRound className="size-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setResetTarget(user)}><KeyRound className="size-4" />Reset password</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(user)}><Trash2 className="size-4" />Delete account</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              })}
              {!visibleUsers.length && <TableRow className="hover:bg-transparent"><TableCell colSpan={columns.length + 1} className="h-64 text-center text-muted-foreground">
                {users.isLoading ? <ContentSkeleton label="Loading users..." />
                  : users.isError ? "Unable to load users. Please try again."
                  : statusFilter !== "all" || roleFilter !== "all" ? "No users on this page match your filters."
                  : search ? `No accounts found for "${search}".` : "No accounts found."}
              </TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>

        <ListPagination label="Users pagination" page={page} totalPages={totalPages} disabled={users.isFetching} onPageChange={changePage} />
      </section>

      {profileUser && <UserProfileDialog user={profileUser} onClose={() => setProfileUser(null)} />}

      {deleteTarget && <DeleteUserConfirmation key={deleteTarget._id} id={deleteTarget._id} email={deleteTarget.email} open
        onOpenChange={open => { if (!open) setDeleteTarget(null) }}
        onDeleted={() => { setDeleteTarget(null); if ((users.data?.data.length ?? 0) === 1 && page > 1) changePage(page - 1) }} />}

      {editUser && <Dialog open onOpenChange={open => { if (!open && !isSavingRole) setEditUser(null) }}>
        <DialogContent className="users-surface sm:max-w-md">
          <DialogHeader><DialogTitle>Edit account</DialogTitle><DialogDescription>Update the role and access status for {editUser.email}.</DialogDescription></DialogHeader>
          <form className="space-y-5" onSubmit={handleEditSubmit}>
            <Field><FieldLabel htmlFor="edit-user-role">Role</FieldLabel>
              <select id="edit-user-role" value={editRole} onChange={event => setEditRole(event.target.value as ManagedUser["role"])} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
                {roleOptions.filter(option => option.value !== "all").map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <Field><FieldLabel htmlFor="edit-user-status">Status</FieldLabel>
              <select id="edit-user-status" value={editActive ? "active" : "suspended"} onChange={event => setEditActive(event.target.value === "active")} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
                <option value="active">Active</option><option value="suspended">Suspended</option>
              </select>
            </Field>
            {editError && <p role="alert" className="text-sm text-destructive">{editError}</p>}
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={isSavingRole} onClick={() => setEditUser(null)}>Cancel</Button>
              <Button type="submit" disabled={isSavingRole}>{isSavingRole && <LoaderCircle className="animate-spin" />}Save changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>}
      {resetTarget && <ResetPasswordDialog user={resetTarget} onClose={() => setResetTarget(null)} />}
    </BaseLayout>
  )
}
