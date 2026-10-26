"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { BaseLayout } from "@/layout/admin/base-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Bell, Mail, MessageSquare } from "lucide-react"

const notificationsFormSchema = z.object({
  emailSecurity: z.boolean(),
  emailUpdates: z.boolean(),
  emailMarketing: z.boolean(),
  pushMessages: z.boolean(),
  pushMentions: z.boolean(),
  pushTasks: z.boolean(),
  emailFrequency: z.string(),
  quietHoursStart: z.string(),
  quietHoursEnd: z.string(),
  channelEmail: z.boolean(),
  channelPush: z.boolean(),
  channelSms: z.boolean(),
  // New notification table fields
  orderUpdatesEmail: z.boolean(),
  orderUpdatesBrowser: z.boolean(),
  orderUpdatesApp: z.boolean(),
  invoiceRemindersEmail: z.boolean(),
  invoiceRemindersBrowser: z.boolean(),
  invoiceRemindersApp: z.boolean(),
  promotionalOffersEmail: z.boolean(),
  promotionalOffersBrowser: z.boolean(),
  promotionalOffersApp: z.boolean(),
  systemMaintenanceEmail: z.boolean(),
  systemMaintenanceBrowser: z.boolean(),
  systemMaintenanceApp: z.boolean(),
  notificationTiming: z.string(),
})

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

export default function NotificationSettings() {
  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailSecurity: false,
      emailUpdates: true,
      emailMarketing: false,
      pushMessages: true,
      pushMentions: true,
      pushTasks: false,
      emailFrequency: "instant",
      quietHoursStart: "22:00",
      quietHoursEnd: "06:00",
      channelEmail: true,
      channelPush: true,
      channelSms: false,
      // New notification table defaults
      orderUpdatesEmail: true,
      orderUpdatesBrowser: true,
      orderUpdatesApp: true,
      invoiceRemindersEmail: true,
      invoiceRemindersBrowser: false,
      invoiceRemindersApp: true,
      promotionalOffersEmail: false,
      promotionalOffersBrowser: true,
      promotionalOffersApp: false,
      systemMaintenanceEmail: true,
      systemMaintenanceBrowser: true,
      systemMaintenanceApp: false,
      notificationTiming: "online",
    },
  })

  function onSubmit(data: NotificationsFormValues) {
    console.log("Notifications settings submitted:", data)
    // Here you would typically save the settings
  }

  return (
    <BaseLayout>
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        <div>
          <h1 className="text-3xl font-bold">Thông báo</h1>
          <p className="text-muted-foreground">
            Cấu hình cách nhận thông báo.
          </p>
        </div>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông báo qua email</CardTitle>
                <CardDescription>
                  Chọn các thông báo bạn muốn nhận qua email.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <FieldGroup className="flex flex-col gap-4">
                  <Controller
                    control={form.control}
                    name="emailSecurity"
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        orientation="horizontal"
                      >
                        <Checkbox
                          id="notifications-email-security"
                          aria-invalid={fieldState.invalid}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FieldContent>
                          <FieldLabel htmlFor="notifications-email-security">
                            Cảnh báo bảo mật
                          </FieldLabel>
                          <FieldDescription>
                            Nhận thông báo khi tài khoản có sự kiện bảo mật.
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="emailUpdates"
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        orientation="horizontal"
                      >
                        <Checkbox
                          id="notifications-email-updates"
                          aria-invalid={fieldState.invalid}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FieldContent>
                          <FieldLabel htmlFor="notifications-email-updates">
                            Cập nhật sản phẩm
                          </FieldLabel>
                          <FieldDescription>
                            Nhận cập nhật về tính năng và cải tiến mới.
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="emailMarketing"
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        orientation="horizontal"
                      >
                        <Checkbox
                          id="notifications-email-marketing"
                          aria-invalid={fieldState.invalid}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FieldContent>
                          <FieldLabel htmlFor="notifications-email-marketing">
                            Email tiếp thị
                          </FieldLabel>
                          <FieldDescription>
                            Nhận email về ưu đãi và khuyến mãi mới nhất.
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    )}
                  />
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông báo đẩy</CardTitle>
                <CardDescription>
                  Cấu hình thông báo đẩy trên trình duyệt và điện thoại.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <FieldGroup className="flex flex-col gap-4">
                  <Controller
                    control={form.control}
                    name="pushMessages"
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        orientation="horizontal"
                      >
                        <Checkbox
                          id="notifications-push-messages"
                          aria-invalid={fieldState.invalid}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FieldContent>
                          <FieldLabel htmlFor="notifications-push-messages">
                            Tin nhắn mới
                          </FieldLabel>
                          <FieldDescription>
                            Nhận thông báo khi có tin nhắn mới.
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="pushMentions"
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        orientation="horizontal"
                      >
                        <Checkbox
                          id="notifications-push-mentions"
                          aria-invalid={fieldState.invalid}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FieldContent>
                          <FieldLabel htmlFor="notifications-push-mentions">
                            Lượt nhắc đến
                          </FieldLabel>
                          <FieldDescription>
                            Nhận thông báo khi có người nhắc đến bạn.
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="pushTasks"
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        orientation="horizontal"
                      >
                        <Checkbox
                          id="notifications-push-tasks"
                          aria-invalid={fieldState.invalid}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FieldContent>
                          <FieldLabel htmlFor="notifications-push-tasks">
                            Cập nhật công việc
                          </FieldLabel>
                          <FieldDescription>
                            Nhận thông báo về phân công và cập nhật công việc.
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    )}
                  />
                </FieldGroup>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Tần suất thông báo</CardTitle>
              <CardDescription>
                Điều chỉnh tần suất nhận thông báo.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                control={form.control}
                name="emailFrequency"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="notifications-email-frequency">
                      Tần suất email
                    </FieldLabel>
                    <Select
                      items={{
                        instant: "Ngay lập tức",
                        hourly: "Tổng hợp hằng giờ",
                        daily: "Tổng hợp hằng ngày",
                        weekly: "Tổng hợp hằng tuần",
                        never: "Không bao giờ",
                      }}
                      name={field.name}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger
                        id="notifications-email-frequency"
                        aria-invalid={fieldState.invalid}
                        className="w-full"
                      >
                        <SelectValue placeholder="Chọn tần suất" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="instant">Ngay lập tức</SelectItem>
                          <SelectItem value="hourly">Tổng hợp hằng giờ</SelectItem>
                          <SelectItem value="daily">Tổng hợp hằng ngày</SelectItem>
                          <SelectItem value="weekly">Tổng hợp hằng tuần</SelectItem>
                          <SelectItem value="never">Không bao giờ</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field>
                <FieldLabel htmlFor="notifications-quiet-hours-start">
                  Giờ yên lặng
                </FieldLabel>
                <div className="flex gap-2">
                  <Controller
                    control={form.control}
                    name="quietHoursStart"
                    render={({ field, fieldState }) => (
                      <Select
                        items={{
                          "22:00": "10:00 PM",
                          "23:00": "11:00 PM",
                          "00:00": "12:00 AM",
                        }}
                        name={field.name}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger
                          id="notifications-quiet-hours-start"
                          aria-invalid={fieldState.invalid}
                          className="w-50"
                        >
                          <SelectValue placeholder="Bắt đầu" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="22:00">10:00 PM</SelectItem>
                            <SelectItem value="23:00">11:00 PM</SelectItem>
                            <SelectItem value="00:00">12:00 AM</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <span className="self-center">to</span>
                  <Controller
                    control={form.control}
                    name="quietHoursEnd"
                    render={({ field, fieldState }) => (
                      <Select
                        items={{
                          "06:00": "6:00 AM",
                          "07:00": "7:00 AM",
                          "08:00": "8:00 AM",
                        }}
                        name={field.name}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger
                          id="notifications-quiet-hours-end"
                          aria-invalid={fieldState.invalid}
                          className="w-50"
                        >
                          <SelectValue placeholder="Kết thúc" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="06:00">6:00 AM</SelectItem>
                            <SelectItem value="07:00">7:00 AM</SelectItem>
                            <SelectItem value="08:00">8:00 AM</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tùy chọn thông báo</CardTitle>
              <CardDescription>
                Cần được trình duyệt cho phép để hiển thị thông báo.{" "}
                <Button variant="link" className="p-0 h-auto text-primary">
                  Yêu cầu cấp quyền
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">LOẠI</TableHead>
                      <TableHead className="text-center">EMAIL</TableHead>
                      <TableHead className="text-center">TRÌNH DUYỆT</TableHead>
                      <TableHead className="text-center">ỨNG DỤNG</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        Cập nhật đơn hàng
                      </TableCell>
                      <TableCell className="text-center">
                        <Controller
                          control={form.control}
                          name="orderUpdatesEmail"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} orientation="horizontal" className="justify-center">
                              <Checkbox
                                id="notifications-order-updates-email"
                                aria-label="Cập nhật đơn hàng: email"
                                aria-invalid={fieldState.invalid}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </Field>
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Controller
                          control={form.control}
                          name="orderUpdatesBrowser"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} orientation="horizontal" className="justify-center">
                              <Checkbox
                                id="notifications-order-updates-browser"
                                aria-label="Cập nhật đơn hàng: trình duyệt"
                                aria-invalid={fieldState.invalid}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </Field>
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Controller
                          control={form.control}
                          name="orderUpdatesApp"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} orientation="horizontal" className="justify-center">
                              <Checkbox
                                id="notifications-order-updates-app"
                                aria-label="Cập nhật đơn hàng: ứng dụng"
                                aria-invalid={fieldState.invalid}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </Field>
                          )}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Nhắc nhở hóa đơn
                      </TableCell>
                      <TableCell className="text-center">
                        <Controller
                          control={form.control}
                          name="invoiceRemindersEmail"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} orientation="horizontal" className="justify-center">
                              <Checkbox
                                id="notifications-invoice-reminders-email"
                                aria-label="Nhắc nhở hóa đơn: email"
                                aria-invalid={fieldState.invalid}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </Field>
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Controller
                          control={form.control}
                          name="invoiceRemindersBrowser"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} orientation="horizontal" className="justify-center">
                              <Checkbox
                                id="notifications-invoice-reminders-browser"
                                aria-label="Nhắc nhở hóa đơn: trình duyệt"
                                aria-invalid={fieldState.invalid}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </Field>
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Controller
                          control={form.control}
                          name="invoiceRemindersApp"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} orientation="horizontal" className="justify-center">
                              <Checkbox
                                id="notifications-invoice-reminders-app"
                                aria-label="Nhắc nhở hóa đơn: ứng dụng"
                                aria-invalid={fieldState.invalid}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </Field>
                          )}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Ưu đãi khuyến mãi
                      </TableCell>
                      <TableCell className="text-center">
                        <Controller
                          control={form.control}
                          name="promotionalOffersEmail"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} orientation="horizontal" className="justify-center">
                              <Checkbox
                                id="notifications-promotional-offers-email"
                                aria-label="Ưu đãi khuyến mãi: email"
                                aria-invalid={fieldState.invalid}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </Field>
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Controller
                          control={form.control}
                          name="promotionalOffersBrowser"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} orientation="horizontal" className="justify-center">
                              <Checkbox
                                id="notifications-promotional-offers-browser"
                                aria-label="Ưu đãi khuyến mãi: trình duyệt"
                                aria-invalid={fieldState.invalid}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </Field>
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Controller
                          control={form.control}
                          name="promotionalOffersApp"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} orientation="horizontal" className="justify-center">
                              <Checkbox
                                id="notifications-promotional-offers-app"
                                aria-label="Ưu đãi khuyến mãi: ứng dụng"
                                aria-invalid={fieldState.invalid}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </Field>
                          )}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Bảo trì hệ thống
                      </TableCell>
                      <TableCell className="text-center">
                        <Controller
                          control={form.control}
                          name="systemMaintenanceEmail"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} orientation="horizontal" className="justify-center">
                              <Checkbox
                                id="notifications-system-maintenance-email"
                                aria-label="Bảo trì hệ thống: email"
                                aria-invalid={fieldState.invalid}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </Field>
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Controller
                          control={form.control}
                          name="systemMaintenanceBrowser"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} orientation="horizontal" className="justify-center">
                              <Checkbox
                                id="notifications-system-maintenance-browser"
                                aria-label="Bảo trì hệ thống: trình duyệt"
                                aria-invalid={fieldState.invalid}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </Field>
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Controller
                          control={form.control}
                          name="systemMaintenanceApp"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} orientation="horizontal" className="justify-center">
                              <Checkbox
                                id="notifications-system-maintenance-app"
                                aria-label="Bảo trì hệ thống: ứng dụng"
                                aria-invalid={fieldState.invalid}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </Field>
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="flex flex-col gap-4">
                  <Controller
                    control={form.control}
                    name="notificationTiming"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="notifications-notification-timing">
                          Bạn muốn nhận thông báo khi nào?
                        </FieldLabel>
                        <Select
                          items={{
                            online: "Chỉ khi tôi trực tuyến",
                            always: "Luôn luôn",
                            never: "Không bao giờ",
                          }}
                          name={field.name}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger
                            id="notifications-notification-timing"
                            aria-invalid={fieldState.invalid}
                            className="w-full max-w-sm"
                          >
                            <SelectValue placeholder="Chọn thời điểm" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="online">
                                Chỉ khi tôi trực tuyến
                              </SelectItem>
                              <SelectItem value="always">Luôn luôn</SelectItem>
                              <SelectItem value="never">Không bao giờ</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kênh thông báo</CardTitle>
              <CardDescription>
                Chọn kênh nhận thông báo cho từng loại cảnh báo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="flex flex-col gap-4">
                <Controller
                  control={form.control}
                  name="channelEmail"
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      orientation="horizontal"
                      className="justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="size-5 text-muted-foreground" />
                        <div>
                          <FieldLabel
                            htmlFor="notifications-channel-email"
                            className="font-medium mb-1"
                          >
                            Email
                          </FieldLabel>
                          <div className="text-sm text-muted-foreground">
                            Nhận thông báo qua email
                          </div>
                        </div>
                      </div>

                      <Checkbox
                        id="notifications-channel-email"
                        aria-invalid={fieldState.invalid}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Field>
                  )}
                />
                <Separator />
                <Controller
                  control={form.control}
                  name="channelPush"
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      orientation="horizontal"
                      className="justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Bell className="size-5 text-muted-foreground" />
                        <div>
                          <FieldLabel
                            htmlFor="notifications-channel-push"
                            className="font-medium mb-1"
                          >
                            Thông báo đẩy
                          </FieldLabel>
                          <div className="text-sm text-muted-foreground">
                            Nhận thông báo đẩy trên trình duyệt
                          </div>
                        </div>
                      </div>

                      <Checkbox
                        id="notifications-channel-push"
                        aria-invalid={fieldState.invalid}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Field>
                  )}
                />
                <Separator />
                <Controller
                  control={form.control}
                  name="channelSms"
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      orientation="horizontal"
                      className="justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="size-5 text-muted-foreground" />
                        <div>
                          <FieldLabel
                            htmlFor="notifications-channel-sms"
                            className="font-medium mb-1"
                          >
                            SMS
                          </FieldLabel>
                          <div className="text-sm text-muted-foreground">
                            Nhận thông báo qua SMS
                          </div>
                        </div>
                      </div>

                      <Checkbox
                        id="notifications-channel-sms"
                        aria-invalid={fieldState.invalid}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="submit" className="cursor-pointer">
              Lưu tùy chọn
            </Button>
            <Button variant="outline" type="reset" className="cursor-pointer">
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </BaseLayout>
  )
}
