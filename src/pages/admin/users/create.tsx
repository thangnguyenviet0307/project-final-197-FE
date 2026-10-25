import { useNavigate } from "react-router-dom"
import { CreatePageLayout } from "@/components/create-page-layout"
import { UserForm } from "@/features/users/components/user-form"

export default function UserCreatePage() {
  const navigate = useNavigate()
  return <CreatePageLayout title="Thêm người dùng" backTo="/users" backLabel="Về danh sách người dùng">
    <UserForm onSaved={() => navigate("/users")} onCancel={() => navigate("/users")} />
  </CreatePageLayout>
}
