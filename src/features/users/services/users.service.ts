import { api } from '@/services/api';
import type { ApiResponse } from '@/types/api';
import type {
  CreateUserInput,
  ManagedUser,
  UsersFilters,
} from '@/features/users/types/users';

// Initial credentials are handed over by the provisioning administrator; never returned by the API.
export function generateInitialPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return 'Aa1!' + Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
}

export function getTemporaryPassword(role: ManagedUser['role']) {
  if (role === 'super_admin') throw new Error('Super Admin must change their own password');
  return generateInitialPassword();
}

export async function reissueInitialPassword(id: string, password: string) {
  await api.post(`/users/${encodeURIComponent(id)}/reissue-initial-password`, { password });
}

export async function listUsers(
  page: number,
  signal: AbortSignal,
  search = '',
  limit = 10,
  filters: UsersFilters = {}
) {
  const { data } = await api.get<
    ApiResponse<ManagedUser[]> & {
      pagination: { totalPages: number; total: number };
    }
  >('/users', {
    params: { page, limit, ...(search ? { search } : {}), ...filters },
    signal,
  });
  return data;
}

export async function createUser(input: CreateUserInput) {
  await api.post('/users', { ...input, active: true });
}

export async function resetUserPassword(id: string) {
  await api.post(`/users/${encodeURIComponent(id)}/reset-password`, {});
}

export async function deleteUser(id: string) {
  await api.delete(`/users/${encodeURIComponent(id)}`);
}

export async function updateUser({
  id,
  input,
}: {
  id: string;
  input: { role?: 'admin' | 'staff'; active: boolean };
}) {
  await api.put(`/users/${encodeURIComponent(id)}`, input);
}

export async function transferOwnership(input: {
  targetUserId: string;
  currentPassword: string;
}) {
  await api.post('/users/transfer-ownership', input);
}

export async function revokeUserSessions(id: string) {
  await api.post(`/users/${encodeURIComponent(id)}/revoke-sessions`);
}
