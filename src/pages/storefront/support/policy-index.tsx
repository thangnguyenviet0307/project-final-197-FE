import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { StoreInformationLayout } from '@/features/support/components/store-information-layout';
import { policyDocuments } from '@/features/support/utils/policy-documents';

export default function StorePolicyIndexPage() {
  return (
    <StoreInformationLayout
      title="Chính sách cửa hàng"
      description="Thông tin về các chính sách và hỗ trợ dành cho khách hàng."
      path="/chinh-sach-cua-hang"
    >
      <h2 className="text-xl font-bold">Các chính sách</h2>
      <ul className="mt-4 divide-y divide-gray-100">
        {policyDocuments.map((document) => (
          <li key={document.key}>
            <Link
              to={document.path}
              className="flex items-center justify-between gap-4 py-4 font-medium text-gray-700 hover:text-[#559d13]"
            >
              <span>{document.title}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <p className="pb-4 text-sm leading-6 text-gray-500">
              {document.description}
            </p>
          </li>
        ))}
      </ul>
    </StoreInformationLayout>
  );
}
