import { useEffect } from "react"
import { useAvatarUpload } from "@/hooks/profile/use-avatar-upload"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useProfile } from "@/hooks/profile/use-profile"
import { useUpdateProfile } from "@/hooks/profile/use-update-profile"
import { LoaderCircle, Upload } from "lucide-react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { profileSchema, type ProfileValues } from "@/lib/profile-schema"
import { useAuthStore } from "@/stores/auth.store"
import { getApiError } from "@/services/api"
import type { User } from "@/types/auth"

function valuesFromUser(user: User | null): ProfileValues {
  return {
    firstName: user?.firstName ?? "", lastName: user?.lastName ?? "",
    personalEmail: user?.personalEmail ?? "", phone: user?.phone ?? "",
    location: user?.location ?? "", bio: user?.bio ?? "",
  }
}

export default function UserProfilePage() {
  const user = useAuthStore((state) => state.user)
  const profile = useProfile()
  const current = profile.data ?? user
  const { fileInput, avatar, preview, removeAvatar, avatarError, isReading,
    clearPhotoChanges, selectPhoto, resetPhoto } = useAvatarUpload()
  const form = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: valuesFromUser(user) })
  const { reset } = form
  const dirty = form.formState.isDirty
  useEffect(() => { if (profile.data && !dirty) reset(valuesFromUser(profile.data)) }, [profile.data, reset, dirty])
  const mutation = useUpdateProfile({
    onSuccess: (saved) => { reset(valuesFromUser(saved)); clearPhotoChanges() },
    onError: (error) => {
      const failure = getApiError(error)
      form.setError("root", { message: failure.message })
      failure.errors?.forEach(({ field, message }) => {
        if (field === "firstName" || field === "lastName" || field === "personalEmail" || field === "phone" || field === "location" || field === "bio") form.setError(field, { message })
      })
    },
  })

  return <BaseLayout title="User Profile" description="Update your profile and personal contact information.">
    <div className="px-4 lg:px-6">
      <Card><CardHeader><CardTitle>Profile</CardTitle><CardDescription>Your account email and role are managed by your administrator.</CardDescription></CardHeader>
        <CardContent>
          {profile.isPending ? <p role="status">Loading profile…</p> : profile.isError ? <div role="alert" className="space-y-3">
            <p>{getApiError(profile.error).message}</p><Button variant="outline" onClick={() => void profile.refetch()}>Try again</Button>
          </div> : <form noValidate className="space-y-6" onSubmit={form.handleSubmit((values) => {
            mutation.reset()
            mutation.mutate({ profile: values, avatar, removeAvatar })
          })}>
            <fieldset disabled={mutation.isPending} className="space-y-6">
              <div className="flex flex-wrap items-center gap-6">
                <UserAvatar name={current?.name || current?.email || "User"} avatar={removeAvatar ? "" : preview ?? current?.avatar} className="size-20" />
                <div className="space-y-2"><div className="flex gap-2">
                  <Button type="button" size="sm" onClick={() => fileInput.current?.click()}><Upload />Upload new photo</Button>
                  <Button type="button" size="sm" variant="outline" onClick={resetPhoto}>Reset photo</Button>
                </div><p className="text-xs text-muted-foreground">JPG, GIF or PNG, up to 800 KB. Click Save Changes to save your photo.</p></div>
                <input ref={fileInput} type="file" aria-label="Profile photo" accept="image/jpeg,image/png,image/gif" className="hidden" onChange={(event) => selectPhoto(event.target.files?.[0])} />
              </div>
              {avatarError && <p role="alert" className="text-sm text-destructive">{avatarError}</p>}
              <Separator />
              <div className="grid gap-6 md:grid-cols-2">
                {([
                  ["firstName", "First Name", "text"], ["lastName", "Last Name", "text"],
                  ["personalEmail", "Personal email", "email"], ["phone", "Phone Number", "tel"],
                  ["location", "Location", "text"],
                ] as const).map(([name, label, type]) => <Field key={name} data-invalid={!!form.formState.errors[name]}>
                  <FieldLabel htmlFor={`profile-${name}`}>{label}</FieldLabel>
                  <Input id={`profile-${name}`} type={type} aria-invalid={!!form.formState.errors[name]} {...form.register(name)} />
                  <FieldError errors={[form.formState.errors[name]]} />
                </Field>)}
                <Field><FieldLabel htmlFor="profile-account-email">Account email</FieldLabel>
                  <Input id="profile-account-email" type="email" value={current?.email ?? ""} readOnly aria-readonly="true" className="bg-muted" />
                </Field>
                <Field><FieldLabel htmlFor="profile-role">Role</FieldLabel>
                  <Input id="profile-role" value={current?.role ?? ""} readOnly aria-readonly="true" className="bg-muted" />
                </Field>
                <Field className="md:col-span-2" data-invalid={!!form.formState.errors.bio}>
                  <FieldLabel htmlFor="profile-bio">Bio</FieldLabel>
                  <Textarea id="profile-bio" rows={4} aria-invalid={!!form.formState.errors.bio} {...form.register("bio")} />
                  <FieldError errors={[form.formState.errors.bio]} />
                </Field>
              </div>
              {form.formState.errors.root && <p role="alert" className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
              {mutation.isSuccess && <p role="status" className="text-sm">Profile updated.</p>}
              <div className="flex gap-3">
                <Button type="submit" disabled={isReading || !!avatarError}>{(mutation.isPending || isReading) && <LoaderCircle className="animate-spin" />}Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => { reset(valuesFromUser(current)); clearPhotoChanges(); mutation.reset() }}>Cancel</Button>
              </div>
            </fieldset>
          </form>}
        </CardContent>
      </Card>
    </div>
  </BaseLayout>
}
