import { api, authApi } from '@/services/api';
import type { ApiResponse } from '@/types/api';

const storefront = { headers: { 'X-Login-Area': 'storefront' } };
export async function sendRecoveryOtp(email: string) {
  await authApi.post('/customer-auth/send-otp', { email }, storefront);
}
export async function verifyRecoveryOtp(input: { email: string; otp: string }) {
  const { data } = await authApi.post<
    ApiResponse<{ resetToken: string; expiresIn: number }>
  >('/customer-auth/verify-otp', input, storefront);
  return data.data;
}
export async function resetRecoveredPassword(input: {
  email: string;
  resetToken: string;
  newPassword: string;
}) {
  await authApi.post('/customer-auth/reset-password', input, storefront);
}
export async function sendPersonalEmailOtp() {
  await api.post('/auth/email-verification/send-otp', {});
}
export async function verifyPersonalEmailOtp(otp: string) {
  await api.post('/auth/email-verification/verify-otp', { otp });
}
