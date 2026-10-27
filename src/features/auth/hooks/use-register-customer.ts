import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { registerCustomer } from "@/features/auth/services/auth.service"

export function useRegisterCustomer(onError: (error: Error) => void) {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: registerCustomer,
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => navigate("/thanh-vien?act=login", {
      replace: true,
      state: { message: "Đăng ký thành công. Vui lòng đăng nhập để tiếp tục mua sắm." },
    }),
    onError,
  })
}
