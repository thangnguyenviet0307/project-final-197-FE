import {
  pendingInformationPages,
  policyDocuments,
} from '@/features/support/utils/policy-documents';

export const managedDocuments = [
  ...policyDocuments,
  {
    key: 'payment',
    title: 'Thanh toán và hủy đơn',
    path: '/chinh-sach-thanh-toan',
    description: 'Thông tin thanh toán và hủy đơn.',
  },
  {
    key: 'support',
    title: 'Liên hệ và tiếp nhận hỗ trợ',
    path: '/chinh-sach-ho-tro',
    description: 'Thông tin tiếp nhận hỗ trợ của cửa hàng.',
  },
  ...pendingInformationPages.map((document) => ({
    key: document.slug,
    title: document.title,
    path: `/${document.slug}`,
    description: 'Thông tin dành cho khách hàng của cửa hàng.',
  })),
];
