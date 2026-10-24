
import { Package } from "lucide-react"

export default function OrdersPage() {
  return (
    <section>
      <h2 className="border-b border-gray-200 pb-5 text-2xl font-bold">
        My Orders
      </h2>

      <div className="flex min-h-80 flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#55b000]/10 text-[#55b000]">
          <Package size={36} />
        </div>

        <h3 className="mt-6 text-lg font-bold">
          Order History
        </h3>

        <p className="mt-3 max-w-md text-sm leading-7 text-gray-500">
          Customer order history will appear here when
          storefront authentication and order APIs are available.
        </p>
      </div>
    </section>
  )
}
