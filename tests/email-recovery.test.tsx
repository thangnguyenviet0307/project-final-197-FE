import { afterEach, beforeEach, expect, it } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AxiosHeaders, AxiosError } from 'axios';
import { RecoveryForm } from '@/features/auth/components/recovery-form';
import { PersonalEmailVerification } from '@/features/auth/components/personal-email-verification';
import { api, authApi, clearAuth } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { authRedirect } from '@/features/auth/utils/auth-redirect';
import { recoveryPasswordSchema } from '@/features/auth/schemas/recovery-schema';

const originalApi = api.defaults.adapter;
const originalAuth = authApi.defaults.adapter;
beforeEach(clearAuth);
afterEach(() => {
  api.defaults.adapter = originalApi;
  authApi.defaults.adapter = originalAuth;
  clearAuth();
});
function setup(component = <RecoveryForm />) {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      <MemoryRouter>
        <Routes>
          <Route path="/" element={component} />
          <Route path="/thanh-vien" element={<p>Login again</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

it('recovers a Customer in three steps without placing credentials into persistent storage', async () => {
  const requests: { url?: string; body: unknown }[] = [];
  authApi.defaults.adapter = async (config) => {
    const body = JSON.parse(config.data as string);
    requests.push({ url: config.url, body });
    return {
      config,
      headers: new AxiosHeaders(),
      status: 200,
      statusText: '',
      data: {
        data: config.url?.endsWith('/verify-otp')
          ? { resetToken: 'a'.repeat(64), expiresIn: 300 }
          : null,
      },
    };
  };
  setup();
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: ' Buyer@example.com ' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Gửi mã' }));
  const otp = await screen.findByLabelText('Mã OTP');
  expect(
    (screen.getByRole('button', { name: /Gửi lại sau/ }) as HTMLButtonElement)
      .disabled
  ).toBe(true);
  fireEvent.change(otp, { target: { value: '012345' } });
  fireEvent.click(screen.getByRole('button', { name: 'Xác nhận OTP' }));
  fireEvent.change(await screen.findByLabelText('Mật khẩu mới'), {
    target: { value: 'New123!' },
  });
  fireEvent.change(screen.getByLabelText('Xác nhận mật khẩu'), {
    target: { value: 'New123!' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Đổi mật khẩu' }));
  expect(await screen.findByText('Login again')).toBeTruthy();
  expect(requests).toEqual([
    { url: '/customer-auth/send-otp', body: { email: 'buyer@example.com' } },
    {
      url: '/customer-auth/verify-otp',
      body: { email: 'buyer@example.com', otp: '012345' },
    },
    {
      url: '/customer-auth/reset-password',
      body: {
        email: 'buyer@example.com',
        resetToken: 'a'.repeat(64),
        newPassword: 'New123!',
      },
    },
  ]);
  for (const storage of [localStorage, sessionStorage]) {
    const contents = Array.from({ length: storage.length }, (_, index) =>
      storage.getItem(storage.key(index)!)
    ).join('');
    expect(contents).not.toContain('a'.repeat(64));
    expect(contents).not.toContain('New123!');
    expect(contents).not.toContain('012345');
  }
});

it('validates email locally and retains the email when SMTP fails', async () => {
  let calls = 0;
  authApi.defaults.adapter = async (config) => {
    calls++;
    throw new AxiosError('Unavailable', 'ERR_BAD_RESPONSE', config, undefined, {
      config,
      headers: new AxiosHeaders(),
      status: 503,
      statusText: '',
      data: { message: 'Email unavailable' },
    });
  };
  setup();
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'invalid' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Gửi mã' }));
  expect(await screen.findByRole('alert')).toBeTruthy();
  expect(calls).toBe(0);
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'buyer@example.com' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Gửi mã' }));
  await waitFor(() =>
    expect(screen.getByRole('alert').textContent).toContain('Email unavailable')
  );
  expect(screen.getByLabelText('Email')).toHaveProperty(
    'value',
    'buyer@example.com'
  );
});

it('verifies only the saved personal email and refreshes the authenticated profile', async () => {
  const user = {
    id: 'staff',
    firstName: 'Test',
    lastName: 'Staff',
    name: 'Staff Test',
    email: 'staff@example.com',
    role: 'staff' as const,
    mustChangePassword: false,
    personalEmail: 'private@example.com',
    onboardingRequired: true,
  };
  useAuthStore.getState().setSession(user, { accessToken: 'access' });
  const requests: { url?: string; body: unknown }[] = [];
  api.defaults.adapter = async (config) => {
    requests.push({
      url: config.url,
      body: config.data ? JSON.parse(config.data as string) : undefined,
    });
    return {
      config,
      headers: new AxiosHeaders(),
      status: 200,
      statusText: '',
      data: {
        data:
          config.method === 'get'
            ? {
                ...user,
                personalEmailVerified: true,
                onboardingRequired: false,
              }
            : null,
      },
    };
  };
  setup(<PersonalEmailVerification email={user.personalEmail} />);
  fireEvent.click(screen.getByRole('button', { name: 'Gửi mã xác nhận' }));
  await screen.findByText('Đã gửi mã đến email cá nhân đã lưu.');
  fireEvent.change(screen.getByLabelText('Mã xác nhận'), {
    target: { value: '012345' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Xác nhận email' }));
  await waitFor(() =>
    expect(useAuthStore.getState().user?.onboardingRequired).toBe(false)
  );
  expect(requests).toContainEqual({
    url: '/auth/email-verification/send-otp',
    body: {},
  });
  expect(requests).toContainEqual({
    url: '/auth/email-verification/verify-otp',
    body: { otp: '012345' },
  });
});

it('password change takes precedence, then incomplete employees must visit Profile', () => {
  const user = {
    role: 'staff' as const,
    accountType: 'user' as const,
    mustChangePassword: true,
    onboardingRequired: true,
  };
  expect(authRedirect(user)).toBe('/auth/change-password');
  expect(authRedirect({ ...user, mustChangePassword: false })).toBe(
    '/auth/settings/user'
  );
  expect(
    authRedirect({
      ...user,
      mustChangePassword: false,
      onboardingRequired: false,
    })
  ).toBe('/auth/dashboard');
  expect(
    authRedirect({ accountType: 'customer', mustChangePassword: false })
  ).toBe('/');
});

it('reset password validation enforces strength and confirmation', () => {
  expect(
    recoveryPasswordSchema.safeParse({
      newPassword: 'New123!',
      confirmPassword: 'New123!',
    }).success
  ).toBe(true);
  for (const [newPassword, confirmPassword] of [
    ['short', 'short'],
    ['New123!', 'Other123!'],
    ['abcdef1!', 'abcdef1!'],
  ])
    expect(
      recoveryPasswordSchema.safeParse({ newPassword, confirmPassword }).success
    ).toBe(false);
});
