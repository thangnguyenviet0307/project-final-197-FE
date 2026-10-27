"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { cn } from "@/utils/utils"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

const signupFormSchema = z
  .object({
    firstName: z.string().min(1, "Vui lòng nhập tên"),
    lastName: z.string().min(1, "Vui lòng nhập họ"),
    email: z.string().email("Địa chỉ email không hợp lệ"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    terms: z
      .boolean()
      .refine((val) => val === true, "You must agree to the terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match",
    path: ["confirmPassword"],
  })

type SignupFormValues = z.infer<typeof signupFormSchema>

export function SignupForm1({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  })

  function onSubmit(data: SignupFormValues) {
    console.log("Signup attempt:", data)
    // Here you would typically handle the signup
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create Account</CardTitle>
          <CardDescription>
            Enter your information to create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <FieldGroup className="grid gap-4">
                <FieldGroup className="grid grid-cols-2 gap-3">
                  <Controller
                    control={form.control}
                    name="firstName"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="signup-form-1-first-name">
                          Tên
                        </FieldLabel>

                        <Input
                          id="signup-form-1-first-name"
                          aria-invalid={fieldState.invalid}
                          placeholder="John"
                          {...field}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="lastName"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="signup-form-1-last-name">
                          Họ
                        </FieldLabel>

                        <Input
                          id="signup-form-1-last-name"
                          aria-invalid={fieldState.invalid}
                          placeholder="Doe"
                          {...field}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
                <Controller
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="signup-form-1-email">
                        Email
                      </FieldLabel>

                      <Input
                        id="signup-form-1-email"
                        aria-invalid={fieldState.invalid}
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="signup-form-1-password">
                        Mật khẩu
                      </FieldLabel>

                      <Input
                        id="signup-form-1-password"
                        aria-invalid={fieldState.invalid}
                        type="password"
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="confirmPassword"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="signup-form-1-confirm-password">
                        Confirm Password
                      </FieldLabel>

                      <Input
                        id="signup-form-1-confirm-password"
                        aria-invalid={fieldState.invalid}
                        type="password"
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="terms"
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      orientation="horizontal"
                    >
                      <Checkbox
                        id="signup-form-1-terms"
                        aria-invalid={fieldState.invalid}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5"
                      />
                      <FieldLabel
                        htmlFor="signup-form-1-terms"
                        className="text-sm"
                      >
                        I agree to the terms of service and privacy policy
                      </FieldLabel>
                    </Field>
                  )}
                />
                <Button type="submit" className="w-full cursor-pointer">
                  Create Account
                </Button>

                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Sign up with Google
                </Button>
              </FieldGroup>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a
                  href="/templates/dashboard/shadcn-dashboard-landing-template/auth/sign-in"
                  className="underline underline-offset-4"
                >
                  Đăng nhập
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Điều khoản sử dụng</a>{" "}
        and <a href="#">Chính sách bảo mật</a>.
      </div>
    </div>
  )
}
