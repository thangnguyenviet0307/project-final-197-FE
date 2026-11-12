import { LoadingSkeleton } from '@/components/loading-skeleton';
import { useEffect } from 'react';
import { LocalityFields } from '@/features/checkout/components/locality-fields';
import { useCheckoutLocations } from '@/features/checkout/hooks/use-checkout';
import { checkoutValuesFromProfile } from '@/features/checkout/utils/checkout-profile';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProfile } from '@/features/profile/hooks/use-profile';
import { useShippingAddress } from '@/features/profile/hooks/use-shipping-address';
import {
  shippingAddressSchema,
  type ShippingAddressValues,
} from '@/features/profile/schemas/customer-account-schema';
import type { User } from '@/features/auth/types/auth';
import { useUnsavedForm } from '@/hooks/use-unsaved-form';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { getApiError } from '@/services/api';

function AddressEditor({ user }: { user: User }) {
  const form = useForm<ShippingAddressValues>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: user.shippingAddress ?? {
      recipientName: `${user.lastName} ${user.firstName}`.trim(),
      email: user.email,
      province: user.address?.state ?? '',
      ward: user.address?.city ?? '',
      street: user.address?.street ?? '',
      deliveryTime: '',
    },
  });
  useEffect(() => {
    form.reset(
      user.shippingAddress ?? {
        recipientName: `${user.lastName} ${user.firstName}`.trim(),
        email: user.email,
        province: user.address?.state ?? '',
        ward: user.address?.city ?? '',
        street: user.address?.street ?? '',
        deliveryTime: '',
      },
      { keepDirtyValues: true }
    );
  }, [user, form]);
  const locations = useCheckoutLocations();
  const { dirtyFields } = form.formState;
  useEffect(() => {
    if (
      dirtyFields.province ||
      dirtyFields.ward ||
      dirtyFields.provinceCode ||
      dirtyFields.wardCode
    )
      return;
    const saved = checkoutValuesFromProfile(user, locations.data);
    form.setValue(
      'provinceCode',
      saved.provinceCode ? Number(saved.provinceCode) : undefined
    );
    form.setValue(
      'wardCode',
      saved.wardCode ? Number(saved.wardCode) : undefined
    );
  }, [user, locations.data, dirtyFields, form]);
  const [provinceCodeValue, wardCodeValue] = useWatch({
    control: form.control,
    name: ['provinceCode', 'wardCode'],
  });
  const navigation = useUnsavedForm(form.formState.isDirty);
  const mutation = useShippingAddress({
    onSuccess: (saved) => {
      if (saved.shippingAddress) form.reset(saved.shippingAddress);
    },
    onError: (error) => {
      form.setError('root', { message: getApiError(error).message });
    },
  });
  return (
    <>
      <form
        noValidate
        className="space-y-6"
        onSubmit={form.handleSubmit((values) => {
          form.clearErrors();
          const province = locations.data?.find(
            (item) => item.code === values.provinceCode
          );
          const ward = province?.wards?.find(
            (item) => item.code === values.wardCode
          );
          if (!province || !ward) {
            form.setError('ward', {
              message: 'Vui lòng chọn tỉnh/thành và phường/xã hiện hành.',
            });
            return;
          }
          mutation.mutate({
            ...values,
            addressVersion: 2,
            district: '',
            province: province.name,
            ward: ward.name,
          });
        })}
      >
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-2xl font-bold">Địa chỉ của tôi</h2>
          <p className="mt-2 text-sm text-gray-500">
            Lưu địa chỉ nhận hàng cho những lần mua sắm tiếp theo.
          </p>
        </div>
        <fieldset
          disabled={mutation.isPending}
          className="grid gap-5 sm:grid-cols-2"
        >
          <LocalityFields
            idPrefix="shipping"
            provinceCode={String(provinceCodeValue ?? '')}
            wardCode={String(wardCodeValue ?? '')}
            provinceError={form.formState.errors.province?.message}
            wardError={form.formState.errors.ward?.message}
            onChange={(provinceCode, wardCode) => {
              const province = locations.data?.find(
                (item) => String(item.code) === provinceCode
              );
              const ward = province?.wards?.find(
                (item) => String(item.code) === wardCode
              );
              form.setValue(
                'provinceCode',
                provinceCode ? Number(provinceCode) : undefined,
                { shouldDirty: true }
              );
              form.setValue(
                'wardCode',
                wardCode ? Number(wardCode) : undefined,
                { shouldDirty: true }
              );
              form.setValue('province', province?.name ?? '', {
                shouldDirty: true,
              });
              form.setValue('ward', ward?.name ?? '', {
                shouldDirty: true,
                shouldValidate: form.formState.isSubmitted,
              });
            }}
          />
          {(
            [
              [
                'recipientName',
                'Tên người nhận',
                'Nhập họ và tên người nhận',
                'name',
              ],
              [
                'email',
                'Email nhận hàng',
                'Nhập email nhận thông tin giao hàng',
                'email',
              ],
              [
                'street',
                'Địa chỉ chi tiết',
                'Số nhà, tên đường, tòa nhà…',
                'street-address',
              ],
              [
                'deliveryTime',
                'Thời gian giao hàng thuận tiện',
                'Ví dụ: Giờ hành chính, thứ Hai đến thứ Sáu',
                'off',
              ],
            ] as const
          ).map(([name, label, placeholder, autoComplete]) => (
            <Field
              key={name}
              className={
                name === 'street' || name === 'deliveryTime'
                  ? 'sm:col-span-2'
                  : undefined
              }
            >
              <FieldLabel htmlFor={`shipping-${name}`}>
                {label}
                {name !== 'deliveryTime' && (
                  <span aria-hidden="true" className="text-red-700">
                    {' '}
                    *
                  </span>
                )}
              </FieldLabel>
              <Input
                id={`shipping-${name}`}
                type={name === 'email' ? 'email' : 'text'}
                placeholder={placeholder}
                autoComplete={autoComplete}
                aria-required={name !== 'deliveryTime'}
                aria-invalid={!!form.formState.errors[name]}
                aria-describedby={
                  form.formState.errors[name]
                    ? `shipping-${name}-error`
                    : undefined
                }
                {...form.register(name)}
              />
              <FieldError
                id={`shipping-${name}-error`}
                errors={[form.formState.errors[name]]}
              />
            </Field>
          ))}
        </fieldset>
        <p className="text-xs leading-6 text-gray-500">
          Số điện thoại liên hệ được cập nhật tại Hồ sơ của tôi.
        </p>
        {form.formState.errors.root && (
          <p role="alert" className="text-sm text-red-700">
            {form.formState.errors.root.message}
          </p>
        )}
        {mutation.isSuccess && !form.formState.isDirty && (
          <p role="status" className="text-sm text-green-800">
            Đã lưu địa chỉ giao hàng.
          </p>
        )}
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="h-11 bg-[#55b000] px-6 text-white hover:bg-[#459000]"
        >
          {mutation.isPending ? 'Đang lưu…' : 'Lưu địa chỉ'}
        </Button>
      </form>
      {navigation.guard}
    </>
  );
}
export default function AddressesPage() {
  const query = useProfile();
  if (query.isPending)
    return <LoadingSkeleton label="Đang tải địa chỉ…" variant="list" />;
  if (query.isError)
    return (
      <div role="alert">
        {getApiError(query.error).message}
        <Button onClick={() => void query.refetch()}>Thử lại</Button>
      </div>
    );
  return <AddressEditor key={query.data.id} user={query.data} />;
}
