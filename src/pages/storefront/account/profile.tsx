import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useProfile } from "@/features/profile/hooks/use-profile"
import { useUpdateProfile } from "@/features/profile/hooks/use-update-profile"
import { profileSchema, type ProfileValues } from "@/features/profile/schemas/profile-schema"
import { valuesFromUser } from "@/features/profile/utils/profile-values"
import type { User } from "@/features/auth/types/auth"
import { useUnsavedForm } from "@/hooks/use-unsaved-form"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getApiError } from "@/services/api"

function ProfileEditor({ user }: { user: User }) {
  const form = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: valuesFromUser(user) })
  const navigation = useUnsavedForm(form.formState.isDirty)
  const mutation = useUpdateProfile({ onSuccess: saved => form.reset(valuesFromUser(saved)), onError: error => {
    const failure = getApiError(error)
    form.setError("root", { message: failure.message })
    failure.errors?.forEach(({ field, message }) => {
      if (["firstName", "lastName", "personalEmail", "phone", "location", "bio"].includes(field)) form.setError(field as keyof ProfileValues, { message })
    })
  } })
  return <><form className="space-y-5" noValidate onSubmit={form.handleSubmit(values => {
    form.clearErrors(); mutation.mutate({ profile: values, avatar: null, removeAvatar: false })
  })}>
    <h2 className="text-2xl font-bold">Hồ sơ của tôi</h2>
    <fieldset disabled={mutation.isPending} className="grid gap-4 sm:grid-cols-2">
      {([["lastName", "Họ"], ["firstName", "Tên"], ["personalEmail", "Email liên hệ"], ["phone", "Số điện thoại"], ["location", "Địa điểm"], ["bio", "Giới thiệu"]] as const).map(([name, label]) => <Field key={name}>
        <FieldLabel htmlFor={`customer-profile-${name}`}>{label}</FieldLabel><Input id={`customer-profile-${name}`} type={name === "personalEmail" ? "email" : name === "phone" ? "tel" : "text"} aria-invalid={!!form.formState.errors[name]} {...form.register(name)} /><FieldError errors={[form.formState.errors[name]]} />
      </Field>)}
      <Field><FieldLabel htmlFor="account-email">Email đăng nhập</FieldLabel><Input id="account-email" value={user.email} readOnly /></Field>
    </fieldset>
    <p className="text-sm text-muted-foreground">Email đăng nhập không thay đổi tại đây. Email liên hệ là thông tin riêng trong hồ sơ.</p>
    {form.formState.errors.root && <p role="alert">{form.formState.errors.root.message}</p>}
    {mutation.isSuccess && <p role="status">Đã lưu hồ sơ.</p>}
    <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Đang lưu…" : "Lưu thay đổi"}</Button>
  </form>{navigation.guard}</>
}
export default function ProfilePage() {
  const query = useProfile()
  if (query.isPending) return <p role="status">Đang tải hồ sơ…</p>
  if (query.isError) return <div role="alert">{getApiError(query.error).message}<Button onClick={() => void query.refetch()}>Thử lại</Button></div>
  return <ProfileEditor key={query.data.id} user={query.data} />
}
