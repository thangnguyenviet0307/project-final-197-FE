import { BaseLayout } from "@/layout/admin/base-layout"
import { MetricsOverview } from "@/pages/admin/dashboard-2/components/metrics-overview"
import { SalesChart } from "@/pages/admin/dashboard-2/components/sales-chart"
import { RecentTransactions } from "@/pages/admin/dashboard-2/components/recent-transactions"
import { CustomerInsights } from "@/pages/admin/dashboard-2/components/customer-insights"
import { QuickActions } from "@/pages/admin/dashboard-2/components/quick-actions"
import { RevenueBreakdown } from "@/pages/admin/dashboard-2/components/revenue-breakdown"

export default function Dashboard2() {
  return (
    <BaseLayout>
      <div className="flex flex-col flex-1 gap-6 px-6 pt-0">
        {/* Enhanced Header */}

        <div className="flex md:flex-row flex-col md:items-center justify-between gap-4 md:gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Business Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor your business performance and key metrics in real-time
            </p>
          </div>
          <QuickActions />
        </div>

        {/* Main Dashboard Grid */}
        <div className="flex flex-col @container/main gap-6">
          {/* Top Row - Key Metrics */}

          <MetricsOverview />

          {/* Second Row - Charts in 6-6 columns */}
          <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
            <SalesChart />
            <RevenueBreakdown />
          </div>

          <RecentTransactions />

          {/* Fourth Row - Customer Insights and Team Performance */}
          <CustomerInsights />
        </div>
      </div>
    </BaseLayout>
  )
}
