import { Mail } from "@/pages/template/mail/components/mail"
import { accounts, mails } from "@/pages/template/mail/data"

export default function MailPage() {
  return <Mail accounts={accounts} mails={mails} navCollapsedSize={4} />
}
