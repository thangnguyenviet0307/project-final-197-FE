import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { RequiredMark } from '@/components/required-mark';
import { useRecovery } from '@/features/auth/hooks/use-recovery';
import {
  recoveryEmailSchema,
  otpSchema,
  recoveryPasswordSchema,
} from '@/features/auth/schemas/recovery-schema';
import { getApiError } from '@/services/api';
import { ArrowLeft, LoaderCircle } from 'lucide-react';

export function RecoveryForm() {
  const navigate = useNavigate();
  const { send, verify, reset } = useRecovery();
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const remaining = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const pending = send.isPending || verify.isPending || reset.isPending;
  async function sendCode() {
    const parsed = recoveryEmailSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError('');
    try {
      await send.mutateAsync(parsed.data.email);
      setEmail(parsed.data.email);
      setOtp('');
      setStep('otp');
      setResendAt(Date.now() + 60_000);
    } catch (failure) {
      setError(getApiError(failure).message);
    }
  }
  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setError('');
        if (step === 'email') {
          await sendCode();
          return;
        }
        try {
          if (step === 'otp') {
            const parsed = otpSchema.safeParse({ otp });
            if (!parsed.success) {
              setError(parsed.error.issues[0].message);
              return;
            }
            const result = await verify.mutateAsync({ email, otp });
            setResetToken(result.resetToken);
            setOtp('');
            setStep('password');
          } else {
            const parsed = recoveryPasswordSchema.safeParse({
              newPassword,
              confirmPassword,
            });
            if (!parsed.success) {
              setError(parsed.error.issues[0].message);
              return;
            }
            await reset.mutateAsync({ email, resetToken, newPassword });
            setResetToken('');
            setNewPassword('');
            setConfirmPassword('');
            navigate('/thanh-vien?act=login', {
              replace: true,
              state: { message: 'Đã đổi mật khẩu. Vui lòng đăng nhập lại.' },
            });
          }
        } catch (failure) {
          setError(getApiError(failure).message);
        }
      }}
    >
      <ol aria-label="Tiến trình khôi phục" className="mb-6 flex gap-2 text-xs">
        {['Email', 'Xác nhận', 'Mật khẩu mới'].map((label, index) => (
          <li
            key={label}
            aria-current={
              index === ['email', 'otp', 'password'].indexOf(step)
                ? 'step'
                : undefined
            }
            className={`flex-1 rounded-lg px-2 py-2 text-center font-medium ${index === ['email', 'otp', 'password'].indexOf(step) ? 'bg-green-50 text-[#459000]' : 'bg-gray-50 text-gray-500'}`}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>
      <p className="text-sm leading-6 text-gray-500">
        {step === 'email'
          ? 'Nhập email đã đăng ký để nhận mã xác nhận.'
          : step === 'otp'
            ? 'Nếu email đã đăng ký và đủ điều kiện, mã sẽ được gửi. Mã có hiệu lực 5 phút.'
            : 'Đặt mật khẩu mới trong 5 phút sau khi xác nhận OTP.'}
      </p>
      <fieldset disabled={pending} className="space-y-4">
        <Field>
          <FieldLabel htmlFor="recovery-email">
            Email <RequiredMark />
          </FieldLabel>
          <Input
            id="recovery-email"
            placeholder="Nhập địa chỉ email đã đăng ký"
            type="email"
            required
            value={email}
            readOnly={step !== 'email'}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        {step === 'otp' && (
          <Field>
            <FieldLabel htmlFor="recovery-otp">
              Mã OTP <RequiredMark />
            </FieldLabel>
            <Input
              id="recovery-otp"
              placeholder="Nhập mã xác nhận gồm 6 chữ số"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
            />
          </Field>
        )}
        {step === 'password' && (
          <>
            <p className="text-sm">
              Mật khẩu từ 6–1024 ký tự, gồm chữ hoa, chữ số và ký tự đặc biệt.
            </p>
            <Field>
              <FieldLabel htmlFor="recovery-password">
                Mật khẩu mới <RequiredMark />
              </FieldLabel>
              <Input
                id="recovery-password"
                placeholder="Nhập mật khẩu mới"
                required
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="recovery-confirm">
                Xác nhận mật khẩu <RequiredMark />
              </FieldLabel>
              <Input
                id="recovery-confirm"
                placeholder="Nhập lại mật khẩu mới"
                required
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </Field>
          </>
        )}
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
        <Button
          className="h-11 w-full bg-[#55b000] text-white hover:bg-[#459000]"
          type="submit"
        >
          {pending && <LoaderCircle className="size-4 animate-spin" />}
          {pending
            ? 'Đang xử lý…'
            : step === 'email'
              ? 'Gửi mã'
              : step === 'otp'
                ? 'Xác nhận OTP'
                : 'Đổi mật khẩu'}
        </Button>
        {step === 'otp' && (
          <Button
            className="h-10 w-full border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
            type="button"
            variant="outline"
            disabled={remaining > 0}
            onClick={() => void sendCode()}
          >
            {remaining ? `Gửi lại sau ${remaining}s` : 'Gửi lại mã'}
          </Button>
        )}
        {step !== 'email' && (
          <Button
            className="h-10 w-full border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            type="button"
            variant="outline"
            onClick={() => {
              setStep('email');
              setResetToken('');
              setOtp('');
              setNewPassword('');
              setConfirmPassword('');
              setError('');
            }}
          >
            Bắt đầu lại
          </Button>
        )}
      </fieldset>
      <Link
        className="flex items-center justify-center gap-2 pt-2 text-sm font-semibold text-[#459000] hover:underline"
        to="/thanh-vien?act=login"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Quay lại đăng nhập
      </Link>
    </form>
  );
}
