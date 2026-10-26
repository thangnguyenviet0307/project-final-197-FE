
import { LockKeyhole } from "lucide-react"

export default function ChangePasswordPage() {
  return (
    <section>
      <div className="flex items-center gap-3 border-b border-gray-200 pb-5">
        <LockKeyhole size={24} className="text-[#55b000]" />
        <h2 className="text-2xl font-bold">
          Đổi mật khẩu
        </h2>
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="font-semibold text-gray-900">
          Quản lý mật khẩu
        </h3>

        <p className="mt-3 max-w-xl text-sm leading-7 text-gray-600">
          Tính năng đổi mật khẩu sẽ khả dụng khi hệ thống xác thực khách hàng được triển khai.
        </p>

        <p className="mt-3 text-xs text-gray-500">
          Bản xem trước này không thu thập hoặc lưu mật khẩu.
        </p>
      </div>
    </section>
  )
}
