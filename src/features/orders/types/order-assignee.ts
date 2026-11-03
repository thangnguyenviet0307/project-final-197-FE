import type { Role } from '@/features/auth/types/auth';
import type { Pagination } from '@/types/api';

export interface OrderAssignee { _id: string; firstName: string; lastName: string; email: string; role: Role }
export interface OrderAssigneesResult { data: OrderAssignee[]; pagination: Pagination }
