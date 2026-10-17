import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { KeyRound, LoaderCircle, UserPlus } from "lucide-react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createUser, createUserSchema, getTemporaryPassword, listUsers, resetUserPassword, type CreateUserInput, type ManagedUser } from "@/services/users.service"
import { getApiError } from "@/services/api"
import { useAuthStore } from "@/stores/auth.store"
import { passwordSchema } from "@/lib/auth-schemas"
import { UserAvatar } from "@/components/user-avatar"
import { DeleteUserButton } from "@/components/auth/delete-user-button"

const resetSchema = z.object({ password: passwordSchema })

function ResetPassword({ user, close }: { user: ManagedUser; close: () => void }) {
  const queryClient = useQueryClient()
  const form = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema), defaultValues: { password: getTemporaryPassword(user.role) } })
  const mutation = useMutation({
    meta: { successMessage: "Password reset successfully." },
    mutationFn: ({ password }: z.infer<typeof resetSchema>) => resetUserPassword({ id: user._id, password }),
    onSuccess: () => { form.reset(); void queryClient.invalidateQueries({ queryKey: ["users"] }) },
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
  const [resetTarget, setResetTarget] = useState<ManagedUser | null>(null)
  const currentUser = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const users = useQuery({ queryKey: ["users", page], queryFn: ({ signal }) => listUsers(page, signal) })
  const form = useForm<CreateUserInput>({ resolver: zodResolver(createUserSchema), defaultValues: {
    firstName: "", lastName: "", email: "", password: getTemporaryPassword("staff"), role: "staff",
  } })
  const mutation = useMutation({
    mutationFn: createUser,
    meta: { successMessage: "Account created successfully." },
    onSuccess: () => { form.reset(); setPage(1); void queryClient.invalidateQueries({ queryKey: ["users"] }) },
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
      <Card><CardHeader><CardTitle>Accounts</CardTitle></CardHeader><CardContent>
        {users.isPending ? <p role="status" className="flex gap-2"><LoaderCircle className="size-4 animate-spin" />Loading…</p>
          : users.isError ? <div role="alert"><p>{getApiError(users.error).message}</p><Button variant="outline" onClick={() => void users.refetch()}>Try again</Button></div>
          : <><Table><TableHeader><TableRow><TableHead>Full name</TableHead><TableHead>Account email</TableHead><TableHead>Personal email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>{users.data.data.map((user) => <TableRow key={user._id}>
              <TableCell><div className="flex items-center gap-3"><UserAvatar name={`${user.firstName || ""} ${user.lastName || ""}`.trim()} avatar={user.avatar} /><span>{`${user.firstName || ""} ${user.lastName || ""}`.trim()}</span></div></TableCell><TableCell>{user.email}</TableCell>
              <TableCell>{user.personalEmail || "—"}</TableCell>
              <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
              <TableCell>{user.active ? "Active" : "Disabled"}{user.mustChangePassword && " · Password change required"}</TableCell>
              <TableCell><div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={user._id === currentUser?.id} onClick={() => setResetTarget(user)}><KeyRound />Reset password</Button>
                <DeleteUserButton id={user._id} email={user.email} disabled={user._id === currentUser?.id} onDeleted={() => {
                  if (resetTarget?._id === user._id) setResetTarget(null)
                  if (users.data.data.length === 1 && page > 1) setPage((value) => value - 1)
                  void queryClient.invalidateQueries({ queryKey: ["users"] })
                }} />
              </div></TableCell>
            </TableRow>)}{users.data.data.length === 0 && <TableRow><TableCell colSpan={6}>No accounts found.</TableCell></TableRow>}</TableBody></Table>
            <div className="mt-4 flex items-center justify-end gap-3">
              <Button variant="outline" disabled={page <= 1 || users.isFetching} onClick={() => setPage((value) => value - 1)}>Previous</Button>
              <span className="text-sm">Page {page} / {Math.max(1, users.data.pagination.totalPages)}</span>
              <Button variant="outline" disabled={page >= users.data.pagination.totalPages || users.isFetching} onClick={() => setPage((value) => value + 1)}>Next</Button>
            </div></>}
      </CardContent></Card>
    </div>
  </BaseLayout>
}
