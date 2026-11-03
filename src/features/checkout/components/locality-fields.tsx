import { useCheckoutLocations } from '@/features/checkout/hooks/use-checkout';
import { getApiError } from '@/services/api';

export function LocalityFields({
  provinceCode,
  wardCode,
  onChange,
  disabled = false,
  idPrefix,
  provinceError,
  wardError,
}: {
  provinceCode: string;
  wardCode: string;
  onChange: (province: string, ward: string) => void;
  disabled?: boolean;
  idPrefix: string;
  provinceError?: string;
  wardError?: string;
}) {
  const locations = useCheckoutLocations();
  const province = locations.data?.find(
    (item) => String(item.code) === provinceCode
  );
  return (
    <>
      {locations.isPending && (
        <p role="status" className="text-sm text-gray-500 sm:col-span-2">
          Đang tải danh sách địa phương…
        </p>
      )}
      {locations.isError && (
        <div role="alert" className="text-sm text-red-600 sm:col-span-2">
          {getApiError(locations.error).message}{' '}
          <button
            type="button"
            onClick={() => void locations.refetch()}
            className="underline"
          >
            Thử lại
          </button>
        </div>
      )}
      {(
        [
          [
            'province',
            'Tỉnh/Thành phố',
            provinceCode,
            locations.data ?? [],
            !locations.data,
            provinceError,
          ],
          [
            'ward',
            'Phường/Xã',
            wardCode,
            province?.wards ?? [],
            !province,
            wardError,
          ],
        ] as const
      ).map(([field, label, value, options, unavailable, error]) => (
        <div key={field} className="space-y-2">
          <label
            htmlFor={`${idPrefix}-${field}`}
            className="block text-sm font-medium"
          >
            {label}
            <span
              aria-hidden="true"
              className="ml-1 text-red-600 after:content-['*']"
            />
          </label>
          <select
            id={`${idPrefix}-${field}`}
            value={value}
            disabled={disabled || unavailable}
            aria-required="true"
            aria-invalid={!!error}
            aria-describedby={error ? `${idPrefix}-${field}-error` : undefined}
            onChange={(event) =>
              onChange(
                field === 'province' ? event.target.value : provinceCode,
                field === 'province' ? '' : event.target.value
              )
            }
            className="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm focus:border-[#4d9210] focus:outline-none focus:ring-1 focus:ring-[#4d9210] aria-invalid:border-red-500 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">Chọn {label.toLowerCase()}</option>
            {options.map((option) => (
              <option key={option.code} value={option.code}>
                {option.name}
              </option>
            ))}
          </select>
          {error && (
            <p
              id={`${idPrefix}-${field}-error`}
              role="alert"
              className="text-sm text-red-600"
            >
              {error}
            </p>
          )}
        </div>
      ))}
    </>
  );
}
