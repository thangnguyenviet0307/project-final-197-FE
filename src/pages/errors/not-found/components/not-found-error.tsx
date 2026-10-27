import { Link } from "react-router-dom"
import { FileQuestion, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotFoundError() {
  return <div className="flex min-h-dvh items-center justify-center bg-background p-6 text-foreground">
    <section className="w-full max-w-xl rounded-2xl border bg-card p-8 text-center shadow-sm sm:p-12">
      <FileQuestion className="mx-auto mb-6 size-12 text-muted-foreground" aria-hidden="true" />
      <p className="text-7xl font-bold tracking-tight text-primary">404</p>
      <h1 className="mt-5 text-2xl font-semibold">Không tìm thấy trang quản trị</h1>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">Đường dẫn không tồn tại hoặc đã thay đổi. Vui lòng kiểm tra lại địa chỉ hoặc quay về bảng điều khiển.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button nativeButton={false} role="link" render={<Link to="/auth/dashboard" />}><LayoutDashboard />Về bảng điều khiển</Button>
        <Button nativeButton={false} role="link" variant="outline" render={<Link to="/auth/login" />}>Đăng nhập quản trị</Button>
      </div>
    </section>
  </div>
}
