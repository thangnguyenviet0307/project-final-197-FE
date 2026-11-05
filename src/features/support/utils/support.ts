import type {
  PolicyContent,
  WarrantyStatus,
} from '@/features/support/types/support';

export const policySections: {
  key: keyof PolicyContent;
  title: string;
  hint: string;
}[] = [
  {
    key: 'privacy',
    title: 'Chính sách bảo mật',
    hint: 'Dữ liệu thu thập, mục đích sử dụng, bên tiếp nhận, lưu trữ, cookie và cách yêu cầu hỗ trợ về dữ liệu cá nhân.',
  },
  {
    key: 'warranty',
    title: 'Chính sách bảo hành',
    hint: 'Phạm vi, thời hạn theo sản phẩm, điều kiện áp dụng và trường hợp từ chối.',
  },
  {
    key: 'returns',
    title: 'Chính sách đổi trả',
    hint: 'Thời hạn, điều kiện sản phẩm, phương án xử lý, hoàn tiền và chi phí liên quan.',
  },
  {
    key: 'shipping',
    title: 'Chính sách giao hàng',
    hint: 'Khu vực phục vụ, thời gian dự kiến và cách kiểm tra hàng. Checkout hiện miễn phí vận chuyển.',
  },
  {
    key: 'payment',
    title: 'Thanh toán và hủy đơn',
    hint: 'Hiện hỗ trợ COD. Tài khoản được hủy đơn đang chờ; đơn khách vãng lai chưa tiếp nhận hết hạn sau 24 giờ.',
  },
  {
    key: 'support',
    title: 'Liên hệ và tiếp nhận hỗ trợ',
    hint: 'Kênh liên hệ thực tế, giờ làm việc và thông tin khách cần cung cấp.',
  },
];
export const warrantyLabels: Record<WarrantyStatus, string> = {
  submitted: 'Chờ tiếp nhận',
  reviewing: 'Đang kiểm tra',
  repairing: 'Đang bảo hành',
  resolved: 'Đã hoàn tất',
  rejected: 'Từ chối bảo hành',
};
export const warrantyTransitions: Record<WarrantyStatus, WarrantyStatus[]> = {
  submitted: ['reviewing'],
  reviewing: ['repairing', 'resolved', 'rejected'],
  repairing: ['resolved', 'rejected'],
  resolved: [],
  rejected: [],
};
export const warrantyStatusStyles: Record<WarrantyStatus, string> = {
  submitted: 'bg-amber-50 text-amber-800',
  reviewing: 'bg-blue-50 text-blue-800',
  repairing: 'bg-violet-50 text-violet-800',
  resolved: 'bg-green-50 text-green-800',
  rejected: 'bg-red-50 text-red-800',
};
// Admin badges follow its light/dark theme; the customer palette stays light.
export const adminWarrantyStatusStyles: Record<WarrantyStatus, string> = {
  submitted: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  reviewing: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  repairing: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
  resolved: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  rejected: 'bg-red-500/10 text-red-700 dark:text-red-400',
};
export function supportDate(value: string) {
  return new Date(value).toLocaleString('vi-VN');
}
