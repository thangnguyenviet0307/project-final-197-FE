import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { CircleUserRound, LoaderCircle, Mail, MapPin, Pencil, Phone, ShieldCheck, Upload } from "lucide-react"
import { useAvatarUpload } from "@/hooks/profile/use-avatar-upload"
import { useProfile } from "@/hooks/profile/use-profile"
import { useUpdateProfile } from "@/hooks/profile/use-update-profile"
import { BaseLayout } from "@/components/layouts/base-layout"
import { UserAvatar } from "@/components/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { getApiError } from "@/services/api"
import { useAuthStore } from "@/stores/auth.store"
import { profileSchema, type ProfileValues } from "@/lib/profile-schema"
import type { User } from "@/types/auth"
import { ContentSkeleton } from "@/components/page-skeleton"

function valuesFromUser(user: User | null): ProfileValues {
  return {
    firstName: user?.firstName ?? "", lastName: user?.lastName ?? "",
    personalEmail: user?.personalEmail ?? "", phone: user?.phone ?? "",
    location: user?.location ?? "", bio: user?.bio ?? "",
  }
}

function displayValue(value: string | undefined, fallback = "Not provided") {
  return value?.trim() || fallback
}

function ProfileDetail({ icon: Icon, label, value }: {
  icon: typeof Mail
  label: string
  value: string | undefined
}) {
  return <div className="flex gap-3">
    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm">{displayValue(value)}</dd>
    </div>
  </div>
}

export default function UserProfilePage() {
  const user = useAuthStore((state) => state.user)
  const profile = useProfile()
  const current = profile.data ?? user
  const [isEditing, setIsEditing] = useState(false)
  const { fileInput, avatar, preview, removeAvatar, avatarError, isReading,
    clearPhotoChanges, selectPhoto, resetPhoto } = useAvatarUpload()
  const form = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: valuesFromUser(current) })
  const { reset } = form
  const dirty = form.formState.isDirty
  const bio = useWatch({ control: form.control, name: "bio" }) ?? ""
  useEffect(() => { if (profile.data && !dirty) reset(valuesFromUser(profile.data)) }, [profile.data, reset, dirty])

  const mutation = useUpdateProfile({
    onSuccess: (saved) => {
      reset(valuesFromUser(saved))
      clearPhotoChanges()
      setIsEditing(false)
    },
    onError: (error) => {
      const failure = getApiError(error)
      form.setError("root", { message: failure.message })
      failure.errors?.forEach(({ field, message }) => {
        if (field === "firstName" || field === "lastName" || field === "personalEmail" || field === "phone" || field === "location" || field === "bio") form.setError(field, { message })
      })
    },
  })

  const beginEditing = () => {
    reset(valuesFromUser(current))
    mutation.reset()
    clearPhotoChanges()
    setIsEditing(true)
  }
  const cancelEditing = () => {
    reset(valuesFromUser(current))
    clearPhotoChanges()
    mutation.reset()
    setIsEditing(false)
  }

  return <BaseLayout title="User Profile" description="View and manage your personal account information.">
    <div className="space-y-6 px-4 lg:px-6">
      {profile.isPending ? <Card><CardContent><ContentSkeleton label="Loading your profile…" variant="profile" /></CardContent></Card> : profile.isError ? <Card>
        <CardContent className="flex flex-col items-start gap-3 py-6">
          <p role="alert" className="text-sm text-destructive">{getApiError(profile.error).message}</p>
          <Button variant="outline" onClick={() => void profile.refetch()}>Try again</Button>
        </CardContent>
      </Card> : isEditing ? <Card>
        <CardHeader className="border-b">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CircleUserRound className="size-5" />
            </div>
            <div className="space-y-1">
              <CardTitle>Cập nhật thông tin cá nhân</CardTitle>
              <CardDescription>Account email and role are managed by your administrator.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form noValidate onSubmit={form.handleSubmit((values) => {
            mutation.reset()
            mutation.mutate({ profile: values, avatar, removeAvatar })
          })}>
            <fieldset disabled={mutation.isPending} className="space-y-6">
              <section className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium">Profile photo</h3>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF, up to 800 KB.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <UserAvatar name={current?.name || current?.email || "User"} avatar={removeAvatar ? "" : preview ?? current?.avatar} className="size-14" />
                  <Button type="button" size="sm" onClick={() => fileInput.current?.click()}><Upload />Upload new photo</Button>
                  <Button type="button" size="sm" variant="outline" onClick={resetPhoto}>Reset photo</Button>
                  <input ref={fileInput} type="file" aria-label="Profile photo" accept="image/jpeg,image/png,image/gif" className="hidden" onChange={(event) => selectPhoto(event.target.files?.[0])} />
                </div>
                {avatarError && <p role="alert" className="text-sm text-destructive">{avatarError}</p>}
              </section>
              <Separator />
              <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                {([
                  ["firstName", "First Name", "text"],
                  ["lastName", "Last Name", "text"],
                  ["personalEmail", "Personal email", "email"],
                  ["phone", "Phone Number", "tel"],
                  ["location", "Location", "text"],
                ] as const).map(([name, label, type]) => <Field key={name} data-invalid={!!form.formState.errors[name]}>
                  <FieldLabel htmlFor={`profile-${name}`}>{label}</FieldLabel>
                  <Input id={`profile-${name}`} type={type} aria-invalid={!!form.formState.errors[name]} {...form.register(name)} />
                  <FieldError errors={[form.formState.errors[name]]} />
                </Field>)}
                <Field>
                  <FieldLabel htmlFor="profile-account-email">Account email</FieldLabel>
                  <Input id="profile-account-email" type="email" value={current?.email ?? ""} readOnly aria-readonly="true" className="bg-muted" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="profile-role">Role</FieldLabel>
                  <Input id="profile-role" value={current?.role ?? ""} readOnly aria-readonly="true" className="bg-muted capitalize" />
                </Field>
                <Field className="sm:col-span-2" data-invalid={!!form.formState.errors.bio}>
                  <FieldLabel htmlFor="profile-bio">Bio</FieldLabel>
                  <Textarea id="profile-bio" rows={4} aria-invalid={!!form.formState.errors.bio} placeholder="Share a little about yourself…" {...form.register("bio")} />
                  <div className="flex items-center justify-between gap-2">
                    <FieldError errors={[form.formState.errors.bio]} />
                    <span className="ml-auto text-xs text-muted-foreground">{bio.length}/1000</span>
                  </div>
                </Field>
              </div>
              {form.formState.errors.root && <p role="alert" className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
              <div className="flex justify-end gap-2 border-t pt-5">
                <Button type="button" variant="outline" onClick={cancelEditing}>Hủy</Button>
                <Button type="submit" disabled={isReading || !!avatarError || mutation.isPending}>
                  {(mutation.isPending || isReading) && <LoaderCircle className="animate-spin" />}
                  {mutation.isPending ? "Saving…" : "Lưu thông tin"}
                </Button>
              </div>
            </fieldset>
          </form>
        </CardContent>
      </Card> : <Card className="overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary/80 via-primary/40 to-primary/10" />
        <CardHeader className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <UserAvatar name={current?.name || current?.email || "User"} avatar={current?.avatar} className="size-24 ring-4 ring-background shadow-sm" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-2xl">{current?.name || "Your profile"}</CardTitle>
              {current?.role && <Badge variant="secondary" className="capitalize">{current.role}</Badge>}
            </div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-4 shrink-0" /> <span className="break-all">{displayValue(current?.email, "Account email unavailable")}</span>
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0 text-primary" /> Account managed by your administrator
            </p>
          </div>
          <Button onClick={beginEditing}><Pencil />Cập nhật thông tin cá nhân</Button>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-6 pt-6">
          <section className="space-y-4">
            <div>
              <h2 className="font-semibold">Thông tin cá nhân</h2>
              <p className="text-sm text-muted-foreground">Contact details and information visible to your team.</p>
            </div>
            <dl className="grid gap-5 sm:grid-cols-2">
              <ProfileDetail icon={Mail} label="Personal email" value={current?.personalEmail} />
              <ProfileDetail icon={Phone} label="Phone number" value={current?.phone} />
              <ProfileDetail icon={MapPin} label="Location" value={current?.location} />
            </dl>
          </section>
          <Separator />
          <section className="space-y-2">
            <h2 className="font-semibold">About</h2>
            <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{displayValue(current?.bio, "No bio has been added yet.")}</p>
          </section>
          <Separator />
          <section className="grid gap-5 sm:grid-cols-2">
            <div>
              <h2 className="font-semibold">Account email</h2>
              <p className="mt-1 break-all text-sm text-muted-foreground">{displayValue(current?.email)}</p>
            </div>
            <div>
              <h2 className="font-semibold">Account role</h2>
              <p className="mt-1 capitalize text-sm text-muted-foreground">{displayValue(current?.role)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Your role is assigned by an administrator.</p>
            </div>
          </section>
        </CardContent>
      </Card>}
    </div>
  </BaseLayout>
}
