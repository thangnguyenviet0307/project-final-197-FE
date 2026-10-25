import { BaseLayout } from "@/layout/admin/base-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Zap, Globe, Database, Apple } from "lucide-react"
import {
  Github,
  Slack,
  Twitter,
  Chrome,
  Facebook,
  Instagram,
  Dribbble,
} from "@/components/icons/brand-icons"
import { useState } from "react"

export default function ConnectionSettings() {
  // Controlled state for switches
  const [appleConnected, setAppleConnected] = useState(true)
  const [googleConnected, setGoogleConnected] = useState(false)
  const [githubConnected, setGithubConnected] = useState(true)
  const [slackConnected, setSlackConnected] = useState(false)
  const [zapierConnected, setZapierConnected] = useState(true)
  const [webhooksConnected, setWebhooksConnected] = useState(false)
  const [dbConnected, setDbConnected] = useState(true)

  return (
    <BaseLayout>
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        <div>
          <h1 className="text-3xl font-bold">Kết nối</h1>
          <p className="text-muted-foreground">
            Kết nối tài khoản với các dịch vụ bên thứ ba.
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tài khoản đã kết nối</CardTitle>
              <CardDescription>
                Hiển thị nội dung từ tài khoản đã kết nối trên trang web
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Apple className="size-8" />
                    <div>
                      <div className="font-medium">Apple</div>
                      <div className="text-sm text-muted-foreground">
                        Lịch và danh bạ
                      </div>
                    </div>
                  </div>
                  <Switch
                    className="cursor-pointer"
                    checked={appleConnected}
                    onCheckedChange={setAppleConnected}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Chrome className="size-8" />
                    <div>
                      <div className="font-medium">Google</div>
                      <div className="text-sm text-muted-foreground">
                        Lịch và danh bạ
                      </div>
                    </div>
                  </div>
                  <Switch
                    className="cursor-pointer"
                    checked={googleConnected}
                    onCheckedChange={setGoogleConnected}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Github className="size-8" />
                    <div>
                      <div className="font-medium">Github</div>
                      <div className="text-sm text-muted-foreground">
                        Quản lý kho mã Git
                      </div>
                    </div>
                  </div>
                  <Switch
                    className="cursor-pointer"
                    checked={githubConnected}
                    onCheckedChange={setGithubConnected}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Slack className="size-8" />
                    <div>
                      <div className="font-medium">Slack</div>
                      <div className="text-sm text-muted-foreground">
                        Trao đổi thông tin
                      </div>
                    </div>
                  </div>
                  <Switch
                    className="cursor-pointer"
                    checked={slackConnected}
                    onCheckedChange={setSlackConnected}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tài khoản mạng xã hội</CardTitle>
              <CardDescription>
                Hiển thị nội dung từ tài khoản đã kết nối trên trang web
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Facebook className="size-8" />
                    <div>
                      <div className="font-medium">
                        Facebook
                        <Badge variant="outline" className="ml-2">
                          Chưa kết nối
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Chia sẻ cập nhật trên Facebook
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="cursor-pointer"
                  >
                    <Globe />
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Twitter className="size-8" />
                    <div>
                      <div className="font-medium">
                        Twitter
                        <Badge variant="secondary" className="ml-2">
                          connected
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Chia sẻ cập nhật trên Twitter
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="cursor-pointer text-destructive"
                  >
                    <Globe />
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Instagram className="size-8" />
                    <div>
                      <div className="font-medium">
                        Instagram
                        <Badge variant="secondary" className="ml-2">
                          connected
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Giữ kết nối trên Instagram
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="cursor-pointer text-destructive"
                  >
                    <Globe />
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Dribbble className="size-8" />
                    <div>
                      <div className="font-medium">
                        Dribbble
                        <Badge variant="outline" className="ml-2">
                          Chưa kết nối
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Giữ kết nối trên Dribbble
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="cursor-pointer"
                  >
                    <Globe />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tích hợp API</CardTitle>
              <CardDescription>
                Cấu hình kết nối API và webhook.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="size-8" />
                    <div>
                      <div className="font-medium">Zapier</div>
                      <div className="text-sm text-muted-foreground">
                        Tự động hóa quy trình với Zapier
                      </div>
                    </div>
                  </div>
                  <Switch
                    className="cursor-pointer"
                    checked={zapierConnected}
                    onCheckedChange={setZapierConnected}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="size-8" />
                    <div>
                      <div className="font-medium">Webhooks</div>
                      <div className="text-sm text-muted-foreground">
                        Cấu hình địa chỉ webhook tùy chỉnh
                      </div>
                    </div>
                  </div>
                  <Switch
                    className="cursor-pointer"
                    checked={webhooksConnected}
                    onCheckedChange={setWebhooksConnected}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="size-8" />
                    <div>
                      <div className="font-medium">Đồng bộ cơ sở dữ liệu</div>
                      <div className="text-sm text-muted-foreground">
                        Đồng bộ dữ liệu với cơ sở dữ liệu bên ngoài
                      </div>
                    </div>
                  </div>
                  <Switch
                    className="cursor-pointer"
                    checked={dbConnected}
                    onCheckedChange={setDbConnected}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Khóa API</CardTitle>
              <CardDescription>
                Quản lý khóa API và mã truy cập.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="font-medium">Khóa API môi trường thực tế</div>
                    <div className="text-sm text-muted-foreground font-mono">
                      sk_live_••••••••••••••••••••••••4234
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                    >
                      Tạo lại
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                    >
                      Sao chép
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="font-medium">Khóa API môi trường phát triển</div>
                    <div className="text-sm text-muted-foreground font-mono">
                      sk_test_••••••••••••••••••••••••5678
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                    >
                      Tạo lại
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                    >
                      Sao chép
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="pt-4">
                  <Button variant="outline" className="cursor-pointer">
                    Thêm khóa API mới
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BaseLayout>
  )
}
