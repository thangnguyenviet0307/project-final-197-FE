import { Link } from 'react-router-dom';
import { FileQuestion, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundError() {
  return (
    <div className="bg-background text-foreground flex min-h-dvh items-center justify-center p-6">
      <section className="bg-card w-full max-w-xl rounded-2xl border p-8 text-center shadow-sm sm:p-12">
        <FileQuestion
          className="text-muted-foreground mx-auto mb-6 size-12"
          aria-hidden="true"
        />
        <p className="text-primary text-7xl font-bold tracking-tight">404</p>
        <h1 className="mt-5 text-2xl font-semibold">
          Không tìm thấy trang quản trị
        </h1>
        <p className="text-muted-foreground mt-4 text-sm leading-7">
          Đường dẫn không tồn tại hoặc đã thay đổi. Vui lòng kiểm tra lại địa
          chỉ hoặc quay về bảng điều khiển.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            nativeButton={false}
            role="link"
            render={<Link to="/auth/dashboard" />}
          >
            <LayoutDashboard />
            Về bảng điều khiển
          </Button>
          <Button
            nativeButton={false}
            role="link"
            variant="outline"
            render={<Link to="/auth/login" />}
          >
            Đăng nhập quản trị
          </Button>
        </div>
      </section>
    </div>
  );
}
