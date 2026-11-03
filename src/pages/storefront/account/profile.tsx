import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProfile } from '@/features/profile/hooks/use-profile';
import { useUpdateProfile } from '@/features/profile/hooks/use-update-profile';
import {
  customerProfileSchema,
  type CustomerProfileValues,
} from '@/features/profile/schemas/customer-account-schema';
import type { User } from '@/features/auth/types/auth';
import { useUnsavedForm } from '@/hooks/use-unsaved-form';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { getApiError } from '@/services/api';

function ProfileEditor({ user }: { user: User }) {
  const valuesFromCustomer = (saved: User): CustomerProfileValues => ({
    firstName: saved.firstName,
    lastName: saved.lastName,
    phone: saved.phone ?? '',
    birthDate: saved.birthDate ?? '',
    gender: saved.gender ?? '',
  });
  const form = useForm<CustomerProfileValues>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues: valuesFromCustomer(user),
  });
  useEffect(() => {
    form.reset(
      {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone ?? '',
        birthDate: user.birthDate ?? '',
        gender: user.gender ?? '',
      },
      { keepDirtyValues: true }
    );
  }, [user, form]);
  const { dirtyFields, isDirty } = form.formState;
  const navigation = useUnsavedForm(
    isDirty || Object.keys(dirtyFields).length > 0
  );
  const birthDate = useWatch({ control: form.control, name: 'birthDate' });
  const currentYear = new Date().getFullYear();
  const mutation = useUpdateProfile({
    onSuccess: (saved) => form.reset(valuesFromCustomer(saved)),
    onError: (error) => {
      const failure = getApiError(error);
      form.setError('root', { message: failure.message });
      failure.errors?.forEach(({ field, message }) => {
        if (
          ['firstName', 'lastName', 'phone', 'birthDate', 'gender'].includes(
            field
          )
        )
          form.setError(field as keyof CustomerProfileValues, { message });
      });
    },
  });
  return (
    <>
      <form
        className="space-y-5"
        noValidate
        onSubmit={form.handleSubmit((values) => {
          form.clearErrors();
          mutation.mutate({
            profile: values,
            avatar: null,
            removeAvatar: false,
          });
        })}
      >
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-2xl font-bold">Hồ sơ của tôi</h2>
          <p className="mt-2 text-sm text-gray-500">
            Cập nhật thông tin cá nhân để thuận tiện khi mua sắm.
          </p>
        </div>
        <fieldset
          disabled={mutation.isPending}
          className="grid gap-4 sm:grid-cols-2"
        >
          {(
            [
              ['lastName', 'Họ'],
              ['firstName', 'Tên'],
            ] as const
          ).map(([name, label]) => (
            <Field key={name}>
              <FieldLabel htmlFor={`customer-profile-${name}`}>
                {label}
              </FieldLabel>
              <Input
                id={`customer-profile-${name}`}
                autoComplete={
                  name === 'lastName' ? 'family-name' : 'given-name'
                }
                aria-invalid={!!form.formState.errors[name]}
                {...form.register(name)}
              />
              <FieldError errors={[form.formState.errors[name]]} />
            </Field>
          ))}
          <Field>
            <FieldLabel htmlFor="customer-birth-date">Ngày sinh</FieldLabel>
            <div className="flex flex-wrap gap-2">
              <select
                aria-label="Năm sinh"
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={birthDate.slice(0, 4)}
                onChange={(event) => {
                  const year = Number(event.target.value);
                  if (!year) {
                    form.setValue('birthDate', '', {
                      shouldDirty: true,
                      shouldValidate: form.formState.isSubmitted,
                    });
                    return;
                  }
                  const month = Number(birthDate.slice(5, 7)) || 1;
                  const day = Math.min(
                    Number(birthDate.slice(8, 10)) || 1,
                    new Date(Date.UTC(year, month, 0)).getUTCDate()
                  );
                  const value = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const today = new Date().toISOString().slice(0, 10);
                  form.setValue('birthDate', value > today ? today : value, {
                    shouldDirty: true,
                    shouldValidate: form.formState.isSubmitted,
                  });
                }}
              >
                <option value="">Chọn năm</option>
                {Array.from(
                  { length: currentYear - 1900 + 1 },
                  (_, index) => currentYear - index
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <Input
                id="customer-birth-date"
                className="min-w-0 flex-1"
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                autoComplete="bday"
                aria-invalid={!!form.formState.errors.birthDate}
                {...form.register('birthDate')}
              />
            </div>
            <FieldError errors={[form.formState.errors.birthDate]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="customer-gender">Giới tính</FieldLabel>
            <select
              id="customer-gender"
              aria-invalid={!!form.formState.errors.gender}
              {...form.register('gender')}
            >
              <option value="">Chưa chọn</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
            <FieldError errors={[form.formState.errors.gender]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="account-email">Email</FieldLabel>
            <Input
              id="account-email"
              type="email"
              value={user.email}
              readOnly
              aria-describedby="account-email-hint"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="customer-phone">Số điện thoại</FieldLabel>
            <Input
              id="customer-phone"
              type="tel"
              autoComplete="tel"
              aria-invalid={!!form.formState.errors.phone}
              {...form.register('phone')}
            />
            <FieldError errors={[form.formState.errors.phone]} />
          </Field>
        </fieldset>
        <p id="account-email-hint" className="text-xs text-gray-500">
          Email này dùng để đăng nhập và nhận thông tin tài khoản, không thay
          đổi tại đây.
        </p>
        {form.formState.errors.root && (
          <p role="alert" className="text-sm text-red-700">
            {form.formState.errors.root.message}
          </p>
        )}
        {mutation.isSuccess && !form.formState.isDirty && (
          <p role="status" className="text-sm text-green-800">
            Đã lưu hồ sơ.
          </p>
        )}
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="h-11 bg-[#55b000] px-6 text-white hover:bg-[#459000]"
        >
          {mutation.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
        </Button>
      </form>
      {navigation.guard}
    </>
  );
}
export default function ProfilePage() {
  const query = useProfile();
  if (query.isPending) return <p role="status">Đang tải hồ sơ…</p>;
  if (query.isError)
    return (
      <div role="alert">
        {getApiError(query.error).message}
        <Button onClick={() => void query.refetch()}>Thử lại</Button>
      </div>
    );
  return <ProfileEditor key={query.data.id} user={query.data} />;
}
