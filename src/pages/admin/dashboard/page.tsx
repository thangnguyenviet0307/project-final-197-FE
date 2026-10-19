import { BaseLayout } from "@/layout/admin/base-layout"
import { ChartAreaInteractive } from "@/pages/admin/dashboard/components/chart-area-interactive"
import { DataTable } from "@/pages/admin/dashboard/components/data-table"
import { SectionCards } from "@/pages/admin/dashboard/components/section-cards"

import data from "@/pages/admin/dashboard/data/data.json"
import pastPerformanceData from "@/pages/admin/dashboard/data/past-performance-data.json"
import keyPersonnelData from "@/pages/admin/dashboard/data/key-personnel-data.json"
import focusDocumentsData from "@/pages/admin/dashboard/data/focus-documents-data.json"

export default function Page() {
  return (
    <BaseLayout title="Dashboard" description="Welcome to your admin dashboard">
      <p role="status" className="mx-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm lg:mx-6">Demo dashboard: figures and charts are sample data, not live business results.</p>
      <div className="flex flex-col @container/main px-4 lg:px-6 gap-6">
        <SectionCards />
        <ChartAreaInteractive />
      </div>
      <div className="@container/main">
        <DataTable
          data={data}
          pastPerformanceData={pastPerformanceData}
          keyPersonnelData={keyPersonnelData}
          focusDocumentsData={focusDocumentsData}
        />
      </div>
    </BaseLayout>
  )
}
