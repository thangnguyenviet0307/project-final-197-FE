import { onboardingProfileSchema } from '@/features/profile/schemas/profile-schema';
import { RequiredMark } from '@/components/required-mark';
import { PersonalEmailVerification } from '@/features/auth/components/personal-email-verification';
import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import {
  CircleUserRound,
  LoaderCircle,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { useAvatarUpload } from '@/features/profile/hooks/use-avatar-upload';
import { useProfile } from '@/features/profile/hooks/use-profile';
import { useUpdateProfile } from '@/features/profile/hooks/use-update-profile';
import { BaseLayout } from '@/layout/admin/base-layout';
import { UserAvatar } from '@/components/user-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { getApiError } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import {
  profileSchema,
  type ProfileValues,
} from '@/features/profile/schemas/profile-schema';
import { valuesFromUser } from '@/features/profile/utils/profile-values';
import { ContentSkeleton } from '@/components/page-skeleton';

function displayValue(value: string | undefined, fallback = 'Chưa cung cấp') {
  return value?.trim() || fallback;
}

function ProfileDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string | undefined;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">
        <dt className="text-muted-foreground text-xs">{label}</dt>
        <dd className="text-sm break-words">{displayValue(value)}</dd>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  const user = useAuthStore((state) => state.user);
  const profile = useProfile();
  const current = profile.data ?? user;
  const [isEditing, setIsEditing] = useState(user?.onboardingRequired === true);
  const sendingEmail = useRef(false);
  const {
    fileInput,
    avatar,
    preview,
    removeAvatar,
    avatarError,
    isReading,
    clearPhotoChanges,
    selectPhoto,
    resetPhoto,
  } = useAvatarUpload();
  const form = useForm<ProfileValues>({
    resolver: zodResolver(
      current?.onboardingRequired ? onboardingProfileSchema : profileSchema
    ),
    defaultValues: valuesFromUser(current),
  });
  const { reset } = form;
  const dirty = form.formState.isDirty;
  const bio = useWatch({ control: form.control, name: 'bio' }) ?? '';
  const personalEmail =
    useWatch({ control: form.control, name: 'personalEmail' }) ?? '';
  useEffect(() => {
    if (profile.data && !dirty) reset(valuesFromUser(profile.data));
  }, [profile.data, reset, dirty]);

  const mutation = useUpdateProfile(
    {
      onSuccess: (saved) => {
        reset(valuesFromUser(saved));
        clearPhotoChanges();
        setIsEditing(saved.onboardingRequired === true || sendingEmail.current);
      },
      onError: (error) => {
        const failure = getApiError(error);
        form.setError('root', { message: failure.message });
        failure.errors?.forEach(({ field, message }) => {
          if (
            field === 'firstName' ||
            field === 'lastName' ||
            field === 'personalEmail' ||
            field === 'phone' ||
            field === 'location' ||
            field === 'bio'
          )
            form.setError(field, { message });
        });
      },
    },
    () => !sendingEmail.current
  );

  const beginEditing = () => {
    reset(valuesFromUser(current));
    mutation.reset();
    clearPhotoChanges();
    setIsEditing(true);
  };
  const cancelEditing = () => {
    reset(valuesFromUser(current));
    clearPhotoChanges();
    mutation.reset();
    setIsEditing(false);
  };

  return (
    <BaseLayout
      title="Hồ sơ người dùng"
      description="Xem và quản lý thông tin tài khoản cá nhân."
    >
      <div className="space-y-6 px-4 lg:px-6">
        {current?.onboardingRequired && (
          <p role="status" className="rounded-lg border p-4 text-sm">
            Hoàn tất hồ sơ và xác nhận email cá nhân để sử dụng hệ thống.
          </p>
        )}
        {profile.isPending ? (
          <Card>
            <CardContent>
              <ContentSkeleton label="Đang tải hồ sơ…" variant="profile" />
            </CardContent>
          </Card>
        ) : profile.isError ? (
          <Card>
            <CardContent className="flex flex-col items-start gap-3 py-6">
              <p role="alert" className="text-destructive text-sm">
                {getApiError(profile.error).message}
              </p>
              <Button variant="outline" onClick={() => void profile.refetch()}>
                Thử lại
              </Button>
            </CardContent>
          </Card>
        ) : isEditing ? (
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <CircleUserRound className="size-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle>Cập nhật thông tin cá nhân</CardTitle>
                  <CardDescription>
                    Email tài khoản và vai trò do quản trị viên quản lý.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form
                noValidate
                onSubmit={form.handleSubmit((values) => {
                  mutation.reset();
                  mutation.mutate({ profile: values, avatar, removeAvatar });
                })}
              >
                <fieldset
                  disabled={mutation.isPending}
                  className="space-y-6 [&_input]:caret-current [&_textarea]:caret-current"
                >
                  <section className="space-y-3">
                    <div>
                      <h3 className="text-sm font-medium">Ảnh hồ sơ</h3>
                      <p className="text-muted-foreground text-xs">
                        JPG, PNG hoặc GIF, tối đa 800 KB.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <UserAvatar
                        name={current?.name || current?.email || 'User'}
                        avatar={
                          removeAvatar ? '' : (preview ?? current?.avatar)
                        }
                        className="size-14"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => fileInput.current?.click()}
                      >
                        <Upload />
                        Tải ảnh mới lên
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={resetPhoto}
                      >
                        Đặt lại ảnh
                      </Button>
                      <input
                        ref={fileInput}
                        type="file"
                        aria-label="Ảnh hồ sơ"
                        accept="image/jpeg,image/png,image/gif"
                        className="hidden"
                        onChange={(event) =>
                          selectPhoto(event.target.files?.[0])
                        }
                      />
                    </div>
                    {avatarError && (
                      <p role="alert" className="text-destructive text-sm">
                        {avatarError}
                      </p>
                    )}
                  </section>
                  <Separator />
                  <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                    {(
                      [
                        ['firstName', 'Tên', 'text'],
                        ['lastName', 'Họ', 'text'],
                        ['personalEmail', 'Email cá nhân', 'email'],
                        ['phone', 'Số điện thoại', 'tel'],
                        ['location', 'Địa điểm', 'text'],
                      ] as const
                    ).map(([name, label, type]) => (
                      <Field
                        key={name}
                        data-invalid={!!form.formState.errors[name]}
                      >
                        <FieldLabel htmlFor={`profile-${name}`}>
                          {label}
                          {['firstName', 'lastName', 'personalEmail'].includes(
                            name
                          ) && <RequiredMark />}
                        </FieldLabel>
                        <Input
                          placeholder={
                            {
                              firstName: 'Nhập tên của bạn',
                              lastName: 'Nhập họ của bạn',
                              personalEmail: 'Nhập email cá nhân',
                              phone: 'Nhập số điện thoại',
                              location: 'Nhập địa điểm của bạn',
                            }[name]
                          }
                          id={`profile-${name}`}
                          type={type}
                          required={[
                            'firstName',
                            'lastName',
                            'personalEmail',
                          ].includes(name)}
                          aria-invalid={!!form.formState.errors[name]}
                          {...form.register(name)}
                        />
                        <FieldError errors={[form.formState.errors[name]]} />
                        {name === 'personalEmail' && (
                          <PersonalEmailVerification
                            email={personalEmail}
                            verified={
                              current?.personalEmailVerified &&
                              personalEmail.trim().toLowerCase() ===
                                current.personalEmail
                            }
                            beforeSend={async () => {
                              if (!(await form.trigger()))
                                throw new Error(
                                  'Vui lòng kiểm tra các trường thông tin hồ sơ.'
                                );
                              sendingEmail.current = true;
                              try {
                                await mutation.mutateAsync({
                                  profile: form.getValues(),
                                  avatar,
                                  removeAvatar,
                                });
                              } finally {
                                sendingEmail.current = false;
                              }
                            }}
                          />
                        )}
                      </Field>
                    ))}
                    <Field>
                      <FieldLabel htmlFor="profile-account-email">
                        Email tài khoản
                      </FieldLabel>
                      <Input
                        id="profile-account-email"
                        type="email"
                        value={current?.email ?? ''}
                        readOnly
                        aria-readonly="true"
                        className="bg-muted"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="profile-role">Vai trò</FieldLabel>
                      <Input
                        id="profile-role"
                        value={current?.role ?? ''}
                        readOnly
                        aria-readonly="true"
                        className="bg-muted capitalize"
                      />
                    </Field>
                    <Field
                      className="sm:col-span-2"
                      data-invalid={!!form.formState.errors.bio}
                    >
                      <FieldLabel htmlFor="profile-bio">Giới thiệu</FieldLabel>
                      <Textarea
                        id="profile-bio"
                        rows={4}
                        aria-invalid={!!form.formState.errors.bio}
                        placeholder="Chia sẻ đôi điều về bạn…"
                        {...form.register('bio')}
                      />
                      <div className="flex items-center justify-between gap-2">
                        <FieldError errors={[form.formState.errors.bio]} />
                        <span className="text-muted-foreground ml-auto text-xs">
                          {bio.length}/1000
                        </span>
                      </div>
                    </Field>
                  </div>
                  {form.formState.errors.root && (
                    <p role="alert" className="text-destructive text-sm">
                      {form.formState.errors.root.message}
                    </p>
                  )}
                  <div className="flex justify-end gap-2 border-t pt-5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEditing}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        isReading || !!avatarError || mutation.isPending
                      }
                    >
                      {(mutation.isPending || isReading) && (
                        <LoaderCircle className="animate-spin" />
                      )}
                      {mutation.isPending ? 'Đang lưu…' : 'Lưu thông tin'}
                    </Button>
                  </div>
                </fieldset>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="from-primary/80 via-primary/40 to-primary/10 h-2 bg-gradient-to-r" />
            <CardHeader className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <UserAvatar
                name={current?.name || current?.email || 'User'}
                avatar={current?.avatar}
                className="ring-background size-24 shadow-sm ring-4"
              />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-2xl">
                    {current?.name || 'Hồ sơ của bạn'}
                  </CardTitle>
                  {current?.role && (
                    <Badge variant="secondary" className="capitalize">
                      {current.role}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Mail className="size-4 shrink-0" />{' '}
                  <span className="break-all">
                    {displayValue(current?.email, 'Chưa có email tài khoản')}
                  </span>
                </p>
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <ShieldCheck className="text-primary size-4 shrink-0" /> Tài
                  khoản do quản trị viên quản lý
                </p>
              </div>
              <Button onClick={beginEditing}>
                <Pencil />
                Cập nhật thông tin cá nhân
              </Button>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-6 pt-6">
              <section className="space-y-4">
                <div>
                  <h2 className="font-semibold">Thông tin cá nhân</h2>
                  <p className="text-muted-foreground text-sm">
                    Thông tin liên hệ và hồ sơ hiển thị với đội ngũ của bạn.
                  </p>
                </div>
                <dl className="grid gap-5 sm:grid-cols-2">
                  <ProfileDetail
                    icon={Mail}
                    label="Email cá nhân"
                    value={current?.personalEmail}
                  />
                  <ProfileDetail
                    icon={Phone}
                    label="Nhập số điện thoại"
                    value={current?.phone}
                  />
                  <ProfileDetail
                    icon={MapPin}
                    label="Địa điểm"
                    value={current?.location}
                  />
                </dl>
              </section>
              <Separator />
              <section className="space-y-2">
                <h2 className="font-semibold">Giới thiệu</h2>
                <p className="text-muted-foreground text-sm break-words whitespace-pre-wrap">
                  {displayValue(current?.bio, 'Chưa có nội dung giới thiệu.')}
                </p>
              </section>
              <Separator />
              <section className="grid gap-5 sm:grid-cols-2">
                <div>
                  <h2 className="font-semibold">Email tài khoản</h2>
                  <p className="text-muted-foreground mt-1 text-sm break-all">
                    {displayValue(current?.email)}
                  </p>
                </div>
                <div>
                  <h2 className="font-semibold">Vai trò tài khoản</h2>
                  <p className="text-muted-foreground mt-1 text-sm capitalize">
                    {displayValue(current?.role)}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Vai trò của bạn do quản trị viên chỉ định.
                  </p>
                </div>
              </section>
            </CardContent>
          </Card>
        )}
      </div>
    </BaseLayout>
  );
}
