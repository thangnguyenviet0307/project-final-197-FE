import { useUnsavedForm } from "@/hooks/use-unsaved-form"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getApiError } from "@/services/api"
import { getDefaultUserPassword } from "@/features/users/services/users.service"
import { createUserSchema } from "@/features/users/schemas/user-schema"
import type { CreateUserInput } from "@/features/users/types/users"
import { useCreateUser } from "@/features/users/hooks/use-create-user"

export function UserForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: getDefaultUserPassword("staff"), role: "staff" },
  })
  const navigation = useUnsavedForm(form.formState.isDirty)
  const mutation = useCreateUser({
    onSuccess: () => {
      navigation.allowSavedNavigation()
      form.reset({ firstName: "", lastName: "", email: "", password: getDefaultUserPassword("staff"), role: "staff" })
      onSaved()
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

 return (<> <form aria-label="Create account" className="max-w-3xl space-y-6" noValidate onSubmit={form.handleSubmit(async values => {
   try { await mutation.mutateAsync(values) } catch { /* Field errors are set by the mutation callback. */ }
 })}>
                <fieldset disabled={mutation.isPending} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field data-invalid={!!form.formState.errors.firstName}>
                    <FieldLabel htmlFor="create-first-name">First name</FieldLabel>
                    <Input id="create-first-name"  autoComplete="off" aria-invalid={!!form.formState.errors.firstName} {...form.register("firstName")} />
                    <FieldError errors={[form.formState.errors.firstName]} />
                  </Field>
                  <Field data-invalid={!!form.formState.errors.lastName}>
                    <FieldLabel htmlFor="create-last-name">Last name</FieldLabel>
                    <Input id="create-last-name"  autoComplete="off" aria-invalid={!!form.formState.errors.lastName} {...form.register("lastName")} />
                    <FieldError errors={[form.formState.errors.lastName]} />
                  </Field>
                </div>

                <Field data-invalid={!!form.formState.errors.email}>
                  <FieldLabel htmlFor="create-email">Email</FieldLabel>
                  <Input id="create-email"  type="email" autoComplete="off" aria-invalid={!!form.formState.errors.email} {...form.register("email")} />
                  <FieldError errors={[form.formState.errors.email]} />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field data-invalid={!!form.formState.errors.role}>
                    <FieldLabel htmlFor="create-role">Role</FieldLabel>
                    <Controller name="role" control={form.control} render={({ field }) => (
                      <Select value={field.value} onValueChange={value => {
                        if (value !== "staff" && value !== "admin") return
                        field.onChange(value)
                        form.setValue("password", getDefaultUserPassword(value), { shouldValidate: true })
                      }}>
                        <SelectTrigger id="create-role" ref={field.ref} onBlur={field.onBlur}
                          aria-invalid={!!form.formState.errors.role}
                          className="w-full">
                          <SelectValue>{field.value === "admin" ? "Admin" : "Staff"}</SelectValue>
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
                    <Input id="create-password"  type="text" readOnly autoComplete="off" aria-invalid={!!form.formState.errors.password} {...form.register("password")} />
                    <FieldError errors={[form.formState.errors.password]} />
                  </Field>
                </div>

                </fieldset>
                {form.formState.errors.root && <p role="alert" className="text-sm text-destructive">{form.formState.errors.root.message}</p>}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button type="button" variant="outline"  disabled={mutation.isPending} onClick={() => form.reset()}>
                    Reset
                  </Button>
                  <Button type="submit" disabled={mutation.isPending} >
                    {mutation.isPending && <LoaderCircle className="animate-spin" />}
                    Create account
                  </Button>
                  <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => navigation.confirmDiscard(onCancel)}>Cancel</Button>
                </div>
              </form>{navigation.guard}</>)
}
