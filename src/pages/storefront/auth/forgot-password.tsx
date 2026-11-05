import { RecoveryForm } from '@/features/auth/components/recovery-form';
import { PageLayout } from '@/layout/storefront/page-layout';
import { ShieldCheck } from 'lucide-react';
import '@/features/auth/components/customer-auth-form.css';

export default function ForgotPasswordPage() {
  return <PageLayout title="Quên mật khẩu" breadcrumbs={[{ label: 'Quên mật khẩu' }]}>
    <section className="customer-auth-form mx-auto max-w-md space-y-6 rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-sm sm:p-8">
      <header className="space-y-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-green-50 text-[#459000]"><ShieldCheck aria-hidden="true" className="size-6" /></div>
        <h2 className="text-2xl font-bold">Khôi phục mật khẩu</h2>
        <p className="text-sm text-gray-500">Xác nhận email để đặt lại mật khẩu và tiếp tục mua sắm.</p>
      </header>
      <RecoveryForm />
    </section>
  </PageLayout>;
}
