import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resetUserPassword, reissueInitialPassword } from '@/features/users/services/users.service';
import type { MutationCallbacks } from '@/types/mutation';

export function useResetUserPassword(
  id: string,
  options: MutationCallbacks<void, void> = {}
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: () => resetUserPassword(id),
    meta: { successMessage: 'Đặt lại mật khẩu thành công.' },
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      return options.onSuccess?.(...args);
    },
  });
}

export function useReissueInitialPassword(id: string, onSuccess: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (password: string) => reissueInitialPassword(id, password),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      onSuccess();
    },
  });
}
