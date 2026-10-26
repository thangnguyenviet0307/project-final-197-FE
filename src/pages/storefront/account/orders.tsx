
import { Package } from "lucide-react"

export default function OrdersPage() {
  return (
    <section>
      <h2 className="border-b border-gray-200 pb-5 text-2xl font-bold">
        Đơn hàng của tôi
      </h2>

      <div className="flex min-h-80 flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#55b000]/10 text-[#55b000]">
          <Package size={36} />
        </div>

        <h3 className="mt-6 text-lg font-bold">
          Lịch sử đơn hàng
        </h3>

        <p className="mt-3 max-w-md text-sm leading-7 text-gray-500">
          Lịch sử đơn hàng sẽ hiển thị tại đây khi tính năng tài khoản và tra cứu đơn hàng khả dụng.
        </p>
      </div>
    </section>
  )
}
