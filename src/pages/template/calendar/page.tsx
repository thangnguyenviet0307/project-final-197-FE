import { BaseLayout } from "@/layout/admin/base-layout"
import { Calendar } from "@/pages/template/calendar/components/calendar"
import { events, eventDates } from "@/pages/template/calendar/data"

export default function CalendarPage() {
  return (
    <BaseLayout title="Lịch" description="Manage your schedule and events">
      <div className="px-4 lg:px-6">
        <Calendar events={events} eventDates={eventDates} />
      </div>
    </BaseLayout>
  )
}
