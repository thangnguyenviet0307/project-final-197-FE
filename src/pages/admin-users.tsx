import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useUsers } from "@/hooks/users/use-users"
import { useCreateUser } from "@/hooks/users/use-create-user"
import { useResetUserPassword } from "@/hooks/users/use-reset-user-password"
import { z } from "zod"
import { KeyRound, LoaderCircle, MoreVertical, Search, Trash2, UserPlus, X } from "lucide-react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createUserSchema, getTemporaryPassword, type CreateUserInput, type ManagedUser } from "@/services/users.service"
import { getApiError } from "@/services/api"
import { useAuthStore } from "@/stores/auth.store"
import { passwordSchema } from "@/lib/auth-schemas"
import { UserAvatar } from "@/components/user-avatar"
import { DeleteUserConfirmation } from "@/components/auth/delete-user-confirmation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const resetSchema = z.object({ password: passwordSchema })

function ResetPassword({ user, close }: { user: ManagedUser; close: () => void }) {
  const form = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema), defaultValues: { password: getTemporaryPassword(user.role) } })
  const mutation = useResetUserPassword(user._id, {
    onSuccess: () => form.reset(),
    onError: (error) => form.setError("root", { message: getApiError(error).message }),
  })
  return <Card><CardHeader><CardTitle>Reset password: {user.email}</CardTitle></CardHeader>
    <CardContent><form className="space-y-4" noValidate onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
      <p className="text-sm text-muted-foreground">Existing sessions will be revoked. Share the temporary password privately; the user must change it after signing in.</p>
      <Field data-invalid={!!form.formState.errors.password}>
        <FieldLabel htmlFor="reset-password">New temporary password</FieldLabel>
        <Input id="reset-password" type="text" readOnly autoComplete="off" aria-invalid={!!form.formState.errors.password} {...form.register("password")} />
        <FieldError errors={[form.formState.errors.password]} />
      </Field>
      {form.formState.errors.root && <p role="alert" className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
      {mutation.isSuccess && <p role="status" className="text-sm">Password reset.</p>}
      <div className="flex gap-2"><Button type="submit" disabled={mutation.isPending}>{mutation.isPending && <LoaderCircle className="animate-spin" />}Reset password</Button>
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={close}>Close</Button></div>
    </form></CardContent>
  </Card>
}

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [resetTarget, setResetTarget] = useState<ManagedUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null)
  const currentUser = useAuthStore((state) => state.user)
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [searchInput])
  const users = useUsers(page, search)
  const form = useForm<CreateUserInput>({ resolver: zodResolver(createUserSchema), defaultValues: {
    firstName: "", lastName: "", email: "", password: getTemporaryPassword("staff"), role: "staff",
  } })
  const mutation = useCreateUser({
    onSuccess: () => { form.reset(); setPage(1) },
    onError: (error) => {
      const failure = getApiError(error)
      form.setError("root", { message: failure.message })
      failure.errors?.forEach(({ field, message }) => {
        if (field === "firstName" || field === "lastName" || field === "email" || field === "password" || field === "role") form.setError(field, { message })
      })
    },
  })
  return <BaseLayout title="User Management" description="Create staff accounts and manage their passwords.">
    <div className="space-y-6 px-4 lg:px-6">
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="size-5" />Create account</CardTitle></CardHeader>
        <CardContent><form className="grid gap-4 sm:grid-cols-2" noValidate onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          {([ ["firstName", "First name", "text"], ["lastName", "Last name", "text"], ["email", "Email", "email"], ["password", "Temporary password", "password"] ] as const).map(([name, label, type]) => <Field key={name} data-invalid={!!form.formState.errors[name]}>
            <FieldLabel htmlFor={`create-${name}`}>{label}</FieldLabel>
            <Input id={`create-${name}`} type={name === "password" ? "text" : type} readOnly={name === "password"} autoComplete="off" aria-invalid={!!form.formState.errors[name]} {...form.register(name)} />
            <FieldError errors={[form.formState.errors[name]]} />
          </Field>)}
          <Field><FieldLabel htmlFor="create-role">Role</FieldLabel>
            <select id="create-role" className="h-9 rounded-lg border bg-background px-3 text-sm" {...form.register("role", {
              onChange: (event) => form.setValue("password", getTemporaryPassword(event.target.value), { shouldValidate: true }),
            })}><option value="staff">Staff</option><option value="admin">Admin</option></select>
            <FieldError errors={[form.formState.errors.role]} />
          </Field>
          <div className="flex items-end"><Button type="submit" disabled={mutation.isPending}>{mutation.isPending && <LoaderCircle className="animate-spin" />}Create account</Button></div>
          <p className="text-sm text-muted-foreground sm:col-span-2">The user must change their temporary password on first sign-in.</p>
          {form.formState.errors.root && <p role="alert" className="text-sm text-destructive sm:col-span-2">{form.formState.errors.root.message}</p>}
          {mutation.isSuccess && <p role="status" className="text-sm sm:col-span-2">Account created. Share the sign-in details with the user privately.</p>}
        </form></CardContent>
      </Card>
      {resetTarget && <ResetPassword key={resetTarget._id} user={resetTarget} close={() => setResetTarget(null)} />}
      {deleteTarget && <DeleteUserConfirmation
        key={deleteTarget._id}
        id={deleteTarget._id}
        email={deleteTarget.email}
        open
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        onDeleted={() => {
          setDeleteTarget(null)
          if (users.data?.data.length === 1 && page > 1) setPage((value) => value - 1)
        }}
      />}
      <Card><CardHeader><CardTitle>Accounts</CardTitle></CardHeader><CardContent>
        <form
          role="search"
          className="mb-4 flex w-full gap-2 sm:max-w-md"
          onSubmit={(event) => {
            event.preventDefault()
            setSearch(searchInput.trim())
            setPage(1)
          }}
        >
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search accounts by name or account email"
              placeholder="Search by name or account email"
              maxLength={200}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="pl-9 pr-9"
            />
            {searchInput && <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Clear account search"
              className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
              onClick={() => {
                setSearchInput("")
                setSearch("")
                setPage(1)
              }}
            ><X /></Button>}
          </div>
          <Button type="submit" className="w-24 shrink-0" aria-label="Search accounts">
            {users.isFetching
              ? <><LoaderCircle className="animate-spin" />Searching</>
              : <><Search />Search</>}
          </Button>
        </form>
        {users.isPending ? <div className="flex min-h-[610px] items-start"><p role="status" className="flex gap-2"><LoaderCircle className="size-4 animate-spin" />Loading…</p></div>
          : users.isError && !users.data ? <div role="alert" className="min-h-[610px]"><p>{getApiError(users.error).message}</p><Button variant="outline" onClick={() => void users.refetch()}>Try again</Button></div>
          : <div className="min-h-[610px]">
            <div className="transition-opacity duration-200" aria-busy={users.isFetching}>
            {users.isError && <div role="alert" className="mb-3 flex items-center gap-3 text-sm text-destructive">
              <p>{getApiError(users.error).message}</p><Button size="sm" variant="outline" onClick={() => void users.refetch()}>Try again</Button>
            </div>}
            <Table className="w-full table-fixed [&_td]:py-3">
              <colgroup>
                <col style={{ width: "24%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "12%" }} />
              </colgroup>
              <TableHeader><TableRow><TableHead>Full name</TableHead><TableHead>Account email</TableHead><TableHead>Personal email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>{users.data.data.map((user) => <TableRow key={user._id}>
              <TableCell><div className="flex min-w-0 items-center gap-3"><UserAvatar className="shrink-0" name={`${user.firstName || ""} ${user.lastName || ""}`.trim()} avatar={user.avatar} /><span className="min-w-0 flex-1 truncate" title={`${user.firstName || ""} ${user.lastName || ""}`.trim()}>{`${user.firstName || ""} ${user.lastName || ""}`.trim()}</span></div></TableCell>
              <TableCell><span className="block truncate" title={user.email}>{user.email}</span></TableCell>
              <TableCell><span className="block truncate" title={user.personalEmail || "—"}>{user.personalEmail || "—"}</span></TableCell>
              <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
              <TableCell><span className="block truncate" title={`${user.active ? "Active" : "Disabled"}${user.mustChangePassword ? " · Password change required" : ""}`}>{user.active ? "Active" : "Disabled"}{user.mustChangePassword && " · Password change required"}</span></TableCell>
              <TableCell><DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" size="sm" disabled={user._id === currentUser?.id} aria-label={`Edit account ${user.email}`} />}>
                  Edit<MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setResetTarget(user)}><KeyRound />Reset password</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteTarget(user)}
                  ><Trash2 />Delete account</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu></TableCell>
            </TableRow>)}{users.data.data.length === 0 && <TableRow>            <TableCell colSpan={6}>{search ? `No accounts found for "${search}".` : "No accounts found."}</TableCell></TableRow>}</TableBody></Table>
            </div>
            <div className="mt-3 flex items-center justify-end gap-3">
              <Button variant="outline" disabled={page <= 1 || users.isFetching} onClick={() => setPage((value) => value - 1)}>Previous</Button>
              <span className="text-sm">Page {page} / {Math.max(1, users.data.pagination.totalPages)}</span>
              <Button variant="outline" disabled={page >= users.data.pagination.totalPages || users.isFetching} onClick={() => setPage((value) => value + 1)}>Next</Button>
            </div></div>}
      </CardContent></Card>
    </div>
  </BaseLayout>
}
