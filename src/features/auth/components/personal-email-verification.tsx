import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { RequiredMark } from '@/components/required-mark';
import { usePersonalEmailVerification } from '@/features/auth/hooks/use-recovery';
import { otpSchema } from '@/features/auth/schemas/recovery-schema';
import { getApiError } from '@/services/api';

export function PersonalEmailVerification({
  email,
  verified,
  beforeSend,
}: {
  email?: string;
  verified?: boolean;
  beforeSend?: () => Promise<void>;
}) {
  const { send, verify } = usePersonalEmailVerification();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const [preparing, setPreparing] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const remaining = Math.max(0, Math.ceil((resendAt - now) / 1000));
  if (verified)
    return (
      <p role="status" className="text-sm text-green-700">
        Email cá nhân đã được xác nhận.
      </p>
    );
  const busy = preparing || send.isPending || verify.isPending;
  async function confirmEmail() {
    setError('');
    const parsed = otpSchema.safeParse({ otp });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (sentEmail !== email?.trim().toLowerCase()) {
      setError('Vui lòng gửi mã cho email hiện tại.');
      return;
    }
    try {
      await verify.mutateAsync(otp);
      setOtp('');
    } catch (failure) {
      setError(getApiError(failure).message);
    }
  }
  return (
    <div className="mt-2 space-y-2" aria-label="Xác nhận email cá nhân">
      <Field>
        <FieldLabel htmlFor="personal-email-otp">
          Mã xác nhận <RequiredMark />
        </FieldLabel>
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <Input
            id="personal-email-otp"
            className="caret-current"
            placeholder="Mã xác nhận"
            aria-required="true"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            disabled={busy}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void confirmEmail();
              }
            }}
            onChange={(event) => setOtp(event.target.value)}
          />
          <Button
            type="button"
            className="disabled:bg-muted disabled:text-muted-foreground shrink-0 disabled:opacity-100"
            disabled={!email?.trim() || remaining > 0 || busy}
            onClick={async () => {
              setError('');
              setPreparing(true);
              try {
                await beforeSend?.();
                await send.mutateAsync();
                setSentEmail(email!.trim().toLowerCase());
                setOtp('');
                const time = Date.now();
                setNow(time);
                setResendAt(time + 60_000);
              } catch (failure) {
                setError(getApiError(failure).message);
              } finally {
                setPreparing(false);
              }
            }}
          >
            {remaining
              ? `Gửi lại sau ${remaining}s`
              : busy
                ? 'Đang xử lý…'
                : 'Gửi mã xác nhận'}
          </Button>
        </div>
      </Field>
      <p className="text-muted-foreground text-xs">
        Mã có hiệu lực 5 phút. Khi gửi mã, thông tin hồ sơ sẽ được lưu trước.
      </p>
      {send.isSuccess && (
        <p role="status" className="text-sm">
          Đã gửi mã đến email cá nhân đã lưu.
        </p>
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={!email || busy || !sentEmail}
        type="button"
        onClick={() => void confirmEmail()}
      >
        Xác nhận email
      </Button>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
