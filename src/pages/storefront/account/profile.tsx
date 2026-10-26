
import { useState } from "react"
import { UserRound } from "lucide-react"

export default function ProfilePage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  const inputClass =
    "w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#55b000]"

  return (
    <section>
      <div className="flex items-center gap-3 border-b border-gray-200 pb-5">
        <UserRound size={24} className="text-[#55b000]" />
        <div>
          <h2 className="text-2xl font-bold">Hồ sơ của tôi</h2>
          <p className="mt-1 text-sm text-gray-500">
            Bản xem trước thông tin cá nhân
          </p>
        </div>
      </div>

      <form
        className="mt-8 space-y-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="first-name" className="mb-2 block text-sm">
              Tên
            </label>
            <input
              id="first-name"
              className={inputClass}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Nhập tên"
            />
          </div>

          <div>
            <label htmlFor="last-name" className="mb-2 block text-sm">
              Họ
            </label>
            <input
              id="last-name"
              className={inputClass}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Nhập họ"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm">
              Địa chỉ email
            </label>
            <input
              id="email"
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-2 block text-sm">
              Số điện thoại
            </label>
            <input
              id="phone"
              type="tel"
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
            />
          </div>
        </div>

        <button
          type="button"
          disabled
          className="rounded-md bg-[#55b000] px-7 py-3 text-sm font-bold text-white opacity-60"
        >
          LƯU THAY ĐỔI
        </button>

        <p className="text-xs text-gray-500">
          Đây là bản xem trước. Tính năng chỉnh sửa hồ sơ sẽ khả dụng khi hệ thống tài khoản khách hàng được hoàn thiện.
        </p>
      </form>
    </section>
  )
}
