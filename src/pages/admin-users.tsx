import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowDown, ArrowUp, BriefcaseBusiness, Check,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, KeyRound,
  LoaderCircle, MoreHorizontal, PlusCircle, ShieldCheck,
  Trash2, UserRound, UserRoundPlus, X,
} from "lucide-react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createUserSchema, getTemporaryPassword, type CreateUserInput, type ManagedUser } from "@/services/users.service"
import { api, getApiError } from "@/services/api"
import { useAuthStore } from "@/stores/auth.store"
import { useUsers } from "@/hooks/users/use-users"
import { useCreateUser } from "@/hooks/users/use-create-user"
import { useResetUserPassword } from "@/hooks/users/use-reset-user-password"
import { DeleteUserConfirmation } from "@/components/auth/delete-user-confirmation"
import { queryClient } from "@/lib/query-client"
import "./admin-users.css"

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
  return <Icon aria-hidden="true" className="size-[18px] shrink-0 text-muted-foreground" />
}
function getStatus(user: ManagedUser): Exclude<Status, "all"> {
  return user.active ? "active" : "suspended"
}
function pageNumbers(page: number, total: number): (number | "start-gap" | "end-gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  const start = Math.max(2, Math.min(page - 1, total - 4))
  const end = Math.min(total - 1, Math.max(page + 1, 5))
  return [1, ...(start > 2 ? ["start-gap" as const] : []),
    ...Array.from({ length: end - start + 1 }, (_, index) => start + index),
    ...(end < total - 1 ? ["end-gap" as const] : []), total]
}

function FilterMenu<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void
}) {
  const active = value !== "all"
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" className="h-10 border-dashed px-3.5" />}>
        <PlusCircle className="size-4" />{label}
        {active && <span className="rounded bg-muted px-1.5 text-xs">{options.find(option => option.value === value)?.label}</span>}
      </PopoverTrigger>
      <PopoverContent align="start" className="users-surface w-56 p-1.5">
        <p className="px-2.5 py-2 text-xs font-medium text-muted-foreground">Filter by {label.toLowerCase()}</p>
        {options.map(option => (
          <button key={option.value} type="button" aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
            {option.label}{value === option.value && <Check className="size-4" />}
          </button>
        ))}
        <p className="border-t px-2.5 py-2 text-xs text-muted-foreground">Filters apply to the current page.</p>
      </PopoverContent>
    </Popover>
  )
}

function ResetPasswordDialog({ user, onClose }: { user: ManagedUser; onClose: () => void }) {
  const mutation = useResetUserPassword(user._id, { onSuccess: onClose })
  const password = getTemporaryPassword(user.role)
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
            <p className="break-words text-lg font-semibold">{name || getUsername(user)}</p>
            <p className="break-all text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          {details.map(([label, value]) => <div key={label} className="min-w-0">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-1 break-words text-sm">{value?.trim() || "Not provided"}</dd>
          </div>)}
          <div><dt className="text-xs text-muted-foreground">Role</dt>
            <dd className="mt-1 flex items-center gap-2">{getRoleIcon(user.role)}{getRoleLabel(user.role)}</dd>
          </div>
          <div><dt className="text-xs text-muted-foreground">Status</dt>
            <dd className="mt-1"><Badge variant={user.active ? "secondary" : "destructive"}>{user.active ? "Active" : "Suspended"}</Badge></dd>
          </div>
          <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">Bio</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words text-sm">{user.bio?.trim() || "Not provided"}</dd>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  )
}

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<Status>("all")
  const [roleFilter, setRoleFilter] = useState<"all" | ManagedUser["role"]>("all")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [profileUser, setProfileUser] = useState<ManagedUser | null>(null)
  const [createUserOpen, setCreateUserOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null)
  const [resetTarget, setResetTarget] = useState<ManagedUser | null>(null)
  const [editUser, setEditUser] = useState<ManagedUser | null>(null)
  const [editRole, setEditRole] = useState<ManagedUser["role"]>("staff")
  const [editActive, setEditActive] = useState(true)
  const [editError, setEditError] = useState("")
  const [isSavingRole, setIsSavingRole] = useState(false)
  const currentUser = useAuthStore(state => state.user)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim()); setPage(1)
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  const users = useUsers(page, search)
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: getTemporaryPassword("staff"), role: "staff" },
  })
  const mutation = useCreateUser({
    onSuccess: () => {
      form.reset({ firstName: "", lastName: "", email: "", password: getTemporaryPassword("staff"), role: "staff" })
      setCreateUserOpen(false); setPage(1)
      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: error => {
      const failure = getApiError(error)
      form.setError("root", { message: failure.message })
      failure.errors?.forEach(({ field, message }) => {
        if (field === "firstName" || field === "lastName" || field === "email" || field === "password" || field === "role") {
          form.setError(field, { message })
        }
      })
    },
  })

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

  return (
    <BaseLayout>
      <section className="users-page mx-4 min-w-0 rounded-xl lg:mx-6" aria-labelledby="users-heading">
        <header className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h1 id="users-heading" className="text-[28px] font-bold tracking-tight">User List</h1>
            <p className="mt-1 text-base text-muted-foreground">Manage your users and their roles here.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button className="h-11 rounded-lg px-4" onClick={() => setCreateUserOpen(true)}>Add User<UserRoundPlus className="ml-1 size-[18px]" /></Button>
          </div>
        </header>

        <div role="search" aria-label="Filter users" className="mb-5 flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-72 lg:w-80">
            <Input aria-label="Search accounts by name or account email" placeholder="Filter users..." maxLength={200}
              value={searchInput} onChange={event => setSearchInput(event.target.value)} className="h-10 rounded-lg px-3.5 pr-9" />
            {searchInput && <Button variant="ghost" size="icon-sm" aria-label="Clear account search" className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => { setSearchInput(""); setSearch(""); changePage(1) }}><X className="size-3.5" /></Button>}
          </div>
          <FilterMenu label="Status" value={statusFilter} options={statusOptions} onChange={value => { setStatusFilter(value) }} />
          <FilterMenu label="Role" value={roleFilter} options={roleOptions} onChange={value => { setRoleFilter(value) }} />
          {(statusFilter !== "all" || roleFilter !== "all") && <Button variant="ghost" onClick={() => { setRoleFilter("all"); setStatusFilter("all") }}>Reset<X className="size-3.5" /></Button>}
          <span role="status" className="text-xs text-muted-foreground">{users.isFetching && !users.isLoading ? search ? "Searching" : "Updating" : ""}</span>

        </div>

        {users.isError && <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <span>{getApiError(users.error).message}</span><Button variant="outline" size="sm" onClick={() => void users.refetch()}>Retry</Button>
        </div>}

        <div className="overflow-hidden rounded-lg border border-border">
          <Table className="w-full min-w-[1000px] table-fixed [&_td]:py-3" aria-label="User list table" aria-busy={users.isFetching}>
            <colgroup>{columns.map(column => <col key={column.key} style={{ width: column.width }} />)}<col style={{ width: "4%" }} /></colgroup>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map(column => <TableHead key={column.key} className={column.key === "username" ? "users-username" : ""}
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
                  {columns.map(column => <TableCell key={column.key} className={column.key === "username" ? "users-username font-medium" : ""}>
                    {column.key === "status" ? <Badge className={`users-status users-status-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
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
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" disabled={user._id === currentUser?.id} aria-label={`Edit account ${user.email}`} className="cursor-pointer rounded-md" />}><MoreHorizontal className="size-[18px]" /></DropdownMenuTrigger>
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
                {users.isLoading ? <span className="inline-flex items-center gap-2"><LoaderCircle className="size-4 animate-spin" />Loading users...</span>
                  : users.isError ? "Unable to load users. Please try again."
                  : statusFilter !== "all" || roleFilter !== "all" ? "No users on this page match your filters."
                  : search ? `No accounts found for "${search}".` : "No accounts found."}
              </TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>

        <footer className="mt-5 flex justify-end text-sm">
          <nav aria-label="Users pagination" className="flex flex-wrap items-center gap-2">
            <span className="mr-3 font-medium">Page {page} of {totalPages}</span>
            <Button variant="outline" size="icon" aria-label="First page" disabled={page === 1 || isBusy} onClick={() => changePage(1)}><ChevronsLeft className="size-4" /></Button>
            <Button variant="outline" size="icon" aria-label="Previous" disabled={page === 1 || isBusy} onClick={() => changePage(page - 1)}><ChevronLeft className="size-4" /></Button>
            {pageNumbers(page, totalPages).map(number => typeof number === "string" ? <span key={number} className="px-1 text-muted-foreground">...</span>
              : <Button key={number} variant={number === page ? "default" : "outline"} size="icon" aria-label={`Page ${number}`} aria-current={number === page ? "page" : undefined}
                disabled={isBusy} onClick={() => changePage(number)}>{number}</Button>)}
            <Button variant="outline" size="icon" aria-label="Next" disabled={page >= totalPages || isBusy} onClick={() => changePage(page + 1)}><ChevronRight className="size-4" /></Button>
            <Button variant="outline" size="icon" aria-label="Last page" disabled={page >= totalPages || isBusy} onClick={() => changePage(totalPages)}><ChevronsRight className="size-4" /></Button>
          </nav>
        </footer>
      </section>

      <Dialog open={createUserOpen} onOpenChange={open => { if (!mutation.isPending) setCreateUserOpen(open) }}>
        <DialogContent className="users-surface w-[min(42rem,calc(100%-2rem))] rounded-xl sm:max-w-[42rem]">
          <DialogHeader>
            <DialogTitle>Create account</DialogTitle>
            <DialogDescription>Add a team member and share their temporary sign-in details privately.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" noValidate onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field data-invalid={!!form.formState.errors.firstName}>
                    <FieldLabel htmlFor="create-first-name">First name</FieldLabel>
                    <Input id="create-first-name" className="h-11 px-3" autoComplete="off" aria-invalid={!!form.formState.errors.firstName} {...form.register("firstName")} />
                    <FieldError errors={[form.formState.errors.firstName]} />
                  </Field>
                  <Field data-invalid={!!form.formState.errors.lastName}>
                    <FieldLabel htmlFor="create-last-name">Last name</FieldLabel>
                    <Input id="create-last-name" className="h-11 px-3" autoComplete="off" aria-invalid={!!form.formState.errors.lastName} {...form.register("lastName")} />
                    <FieldError errors={[form.formState.errors.lastName]} />
                  </Field>
                </div>

                <Field data-invalid={!!form.formState.errors.email}>
                  <FieldLabel htmlFor="create-email">Email</FieldLabel>
                  <Input id="create-email" className="h-11 px-3" type="email" autoComplete="off" aria-invalid={!!form.formState.errors.email} {...form.register("email")} />
                  <FieldError errors={[form.formState.errors.email]} />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field data-invalid={!!form.formState.errors.role}>
                    <FieldLabel htmlFor="create-role">Role</FieldLabel>
                    <Controller name="role" control={form.control} render={({ field }) => (
                      <Select value={field.value} onValueChange={value => {
                        if (value !== "staff" && value !== "admin") return
                        field.onChange(value)
                        form.setValue("password", getTemporaryPassword(value), { shouldValidate: true })
                      }}>
                        <SelectTrigger id="create-role" ref={field.ref} onBlur={field.onBlur}
                          aria-invalid={!!form.formState.errors.role}
                          className="w-full cursor-pointer rounded-xl px-3 data-[size=default]:h-11">
                          <SelectValue>{getRoleLabel(field.value)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false} align="start" className="rounded-xl p-1.5">
                          <SelectItem value="staff" className="cursor-pointer rounded-lg px-3 py-2">Staff</SelectItem>
                          <SelectItem value="admin" className="cursor-pointer rounded-lg px-3 py-2">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )} />
                    <FieldError errors={[form.formState.errors.role]} />
                  </Field>
                  <Field data-invalid={!!form.formState.errors.password}>
                    <FieldLabel htmlFor="create-password">Temporary password</FieldLabel>
                    <Input id="create-password" className="h-11 px-3" type="text" readOnly autoComplete="off" aria-invalid={!!form.formState.errors.password} {...form.register("password")} />
                    <FieldError errors={[form.formState.errors.password]} />
                  </Field>
                </div>

                {form.formState.errors.root && <p role="alert" className="text-sm text-destructive">{form.formState.errors.root.message}</p>}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" className="h-11 min-w-24 px-4 text-sm" disabled={mutation.isPending} onClick={() => form.reset()}>
                    Reset
                  </Button>
                  <Button type="submit" disabled={mutation.isPending} className="h-11 px-5 text-sm">
                    {mutation.isPending && <LoaderCircle className="animate-spin" />}
                    Create account
                  </Button>
                </div>
              </form>
        </DialogContent>
      </Dialog>

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
