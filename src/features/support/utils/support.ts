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
export function supportDate(value: string) {
  return new Date(value).toLocaleString('vi-VN');
}
