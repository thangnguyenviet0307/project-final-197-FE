import type { User } from '@/features/auth/types/auth';

export function authRedirect(
  user: Pick<
    User,
    'role' | 'mustChangePassword' | 'accountType' | 'onboardingRequired'
  >
): string {
  if (user.mustChangePassword) {
    return user.accountType === 'customer'
      ? '/account/change-password'
      : '/auth/change-password';
  }
  if (user.onboardingRequired && user.accountType !== 'customer')
    return '/auth/settings/user';
  return user.accountType === 'customer' ? '/' : '/auth/dashboard';
}
