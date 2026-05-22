import {
  useGetDashboardSummary,
  useGetTopMedicines,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Package,
  PackageMinus,
} from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();
  const { data: topMedicines } = useGetTopMedicines();

  if (isLoading)
    return <div className="p-8 text-muted-foreground">Loading dashboard...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Overview</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{formatCurrency(summary?.todaySales || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium">Today's Profit</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-green-600">{formatCurrency(summary?.todayProfit || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium">Total Medicines</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{summary?.totalMedicines || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium">Inventory Value</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{formatCurrency(summary?.inventoryValue || 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alert cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <Link href="/inventory">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-amber-700">Low Stock Items</CardTitle>
              <PackageMinus className="w-4 h-4 text-amber-600 shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{summary?.lowStockCount || 0}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/expiry">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-destructive/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-destructive">Expiring / Expired</CardTitle>
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {(summary?.expiringCount || 0) + (summary?.expiredCount || 0)} items
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Top medicines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Top Selling Medicines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topMedicines?.map((med) => (
              <div key={med.id} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{med.name}</p>
                  <p className="text-xs text-muted-foreground">Sold: {med.quantitySold}</p>
                </div>
                <div className="font-medium text-sm shrink-0">{formatCurrency(med.revenue)}</div>
              </div>
            ))}
            {(!topMedicines || topMedicines.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
