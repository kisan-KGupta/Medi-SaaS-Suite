import {
  useGetDashboardSummary,
  useGetTopMedicines,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import {
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Package,
  PackageMinus,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor,
  sub,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
  sub?: string;
}) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-sm bg-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className={`text-2xl md:text-3xl font-bold tracking-tight truncate ${valueColor ?? "text-foreground"}`}>
              {value}
            </p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-3 ${iconBg}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertCard({
  title,
  count,
  icon: Icon,
  href,
  color,
  bg,
  border,
  label,
}: {
  title: string;
  count: number;
  icon: React.ElementType;
  href: string;
  color: string;
  bg: string;
  border: string;
  label: string;
}) {
  return (
    <Link href={href}>
      <Card className={`cursor-pointer transition-all hover:shadow-md border ${border} ${count > 0 ? "" : "opacity-60"}`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
                <p className={`text-2xl font-bold ${color}`}>{count} <span className="text-sm font-medium">{label}</span></p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Dashboard() {
  const { data: summary } = useGetDashboardSummary();
  const { data: topMedicines } = useGetTopMedicines();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(summary?.todaySales || 0)}
          icon={DollarSign}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
          sub="NPR"
        />
        <StatCard
          title="Today's Profit"
          value={formatCurrency(summary?.todayProfit || 0)}
          icon={TrendingUp}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          valueColor="text-green-600"
          sub="NPR"
        />
        <StatCard
          title="Total Medicines"
          value={String(summary?.totalMedicines || 0)}
          icon={Package}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          sub="in inventory"
        />
        <StatCard
          title="Inventory Value"
          value={formatCurrency(summary?.inventoryValue || 0)}
          icon={ShoppingBag}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          sub="NPR at purchase price"
        />
      </div>

      {/* Alert row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <AlertCard
          title="Low Stock Items"
          count={summary?.lowStockCount || 0}
          icon={PackageMinus}
          href="/inventory"
          color="text-amber-600"
          bg="bg-amber-50"
          border="border-amber-100"
          label="items"
        />
        <AlertCard
          title="Expiring / Expired"
          count={(summary?.expiringCount || 0) + (summary?.expiredCount || 0)}
          icon={AlertTriangle}
          href="/expiry"
          color="text-red-500"
          bg="bg-red-50"
          border="border-red-100"
          label="items"
        />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly & Monthly stats */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Period Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <div className="text-xs text-muted-foreground">This Week</div>
                <div className="font-bold text-lg">{formatCurrency(summary?.weeklySales || 0)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">This Month</div>
                <div className="font-bold text-lg">{formatCurrency(summary?.monthlySales || 0)}</div>
              </div>
            </div>
            <div className="flex gap-3 text-sm">
              <div className="flex-1 bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-muted-foreground text-xs mb-1">Expiring Soon</div>
                <div className="font-bold text-amber-600">{summary?.expiringCount || 0}</div>
              </div>
              <div className="flex-1 bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-muted-foreground text-xs mb-1">Expired</div>
                <div className="font-bold text-destructive">{summary?.expiredCount || 0}</div>
              </div>
              <div className="flex-1 bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-muted-foreground text-xs mb-1">Low Stock</div>
                <div className="font-bold text-amber-500">{summary?.lowStockCount || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top medicines */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Top Selling Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            {(!topMedicines || topMedicines.length === 0) ? (
              <div className="text-sm text-muted-foreground text-center py-8">No sales data yet</div>
            ) : (
              <div className="space-y-3">
                {topMedicines.map((med, idx) => (
                  <div key={med.id} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">{med.name}</p>
                        <span className="text-sm font-bold shrink-0">{formatCurrency(med.revenue)}</span>
                      </div>
                      <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${Math.round((med.revenue / (topMedicines[0]?.revenue || 1)) * 100)}%`,
                            opacity: 0.7 + 0.3 * (1 - idx / topMedicines.length),
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{med.quantitySold} units sold</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
