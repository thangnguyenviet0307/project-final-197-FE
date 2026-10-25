
import { MapPin } from "lucide-react"

export default function AddressesPage() {
  return (
    <section>
      <h2 className="border-b border-gray-200 pb-5 text-2xl font-bold">
        Địa chỉ của tôi
      </h2>

      <div className="flex min-h-80 flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#55b000]/10 text-[#55b000]">
          <MapPin size={36} />
        </div>

        <h3 className="mt-6 text-lg font-bold">
          Địa chỉ giao hàng
        </h3>

        <p className="mt-3 max-w-md text-sm leading-7 text-gray-500">
          Địa chỉ giao hàng đã lưu sẽ hiển thị tại đây khi tính năng quản lý tài khoản khách hàng được triển khai.
        </p>
      </div>
    </section>
  )
}
