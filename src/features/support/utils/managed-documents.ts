import {
  pendingInformationPages,
  policyDocuments,
} from '@/features/support/utils/policy-documents';

export const managedDocuments = [
  ...policyDocuments,
  ...pendingInformationPages.map((document) => ({
    key: document.slug,
    title: document.title,
    path: `/${document.slug}`,
    description: 'Thông tin dành cho khách hàng của cửa hàng.',
  })),
];
