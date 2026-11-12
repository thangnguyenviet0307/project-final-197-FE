import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  sendRecoveryOtp,
  verifyRecoveryOtp,
  resetRecoveredPassword,
  sendPersonalEmailOtp,
  verifyPersonalEmailOtp,
} from '@/features/auth/services/recovery.service';
import { getProfile } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

export function useRecovery() {
  const send = useMutation({
    mutationFn: sendRecoveryOtp,
    meta: { suppressGlobalErrorToast: true },
  });
  const verify = useMutation({
    mutationFn: verifyRecoveryOtp,
    meta: { suppressGlobalErrorToast: true },
  });
  const reset = useMutation({
    mutationFn: resetRecoveredPassword,
    meta: { suppressGlobalErrorToast: true },
  });
  return { send, verify, reset };
}
export function usePersonalEmailVerification() {
  const queryClient = useQueryClient();
  const send = useMutation({
    mutationFn: sendPersonalEmailOtp,
    meta: { suppressGlobalErrorToast: true },
  });
  const verify = useMutation({
    mutationFn: async (otp: string) => {
      const version = useAuthStore.getState().sessionVersion;
      await verifyPersonalEmailOtp(otp);
      const user = await getProfile();
      if (version !== useAuthStore.getState().sessionVersion)
        throw new Error('Session changed');
      useAuthStore.setState({ user });
      return user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(
        ['auth', 'me', useAuthStore.getState().sessionVersion],
        user
      );
      return queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    meta: { suppressGlobalErrorToast: true },
  });
  return { send, verify };
}
