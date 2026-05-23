import { useGetDashboardSummary, useGetSalesChart, useGetTopMedicines } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  Bar, BarChart, Cell, Legend, LineChart, Line,
} from "recharts";
import { TrendingUp, DollarSign, Package, ShoppingBag } from "lucide-react";

const TEAL = "hsl(173,75%,36%)";
const GREEN = "hsl(142,72%,42%)";
const BLUE = "hsl(210,89%,55%)";
const AMBER = "hsl(43,96%,52%)";
const PALETTE = [TEAL, BLUE, GREEN, AMBER, "hsl(27,96%,61%)", "hsl(260,80%,60%)"];

function StatCard({
  title, value, sub, icon: Icon, iconBg, iconColor, valueColor,
}: {
  title: string; value: string; sub?: string;
  icon: React.ElementType; iconBg: string; iconColor: string; valueColor?: string;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className={`text-2xl font-bold tracking-tight truncate ${valueColor ?? "text-foreground"}`}>{value}</p>
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-card shadow-lg px-4 py-3 text-sm space-y-1.5 min-w-[150px]">
      <p className="font-semibold text-foreground text-xs mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground text-xs">{p.name}</span>
          </div>
          <span className="font-medium text-xs">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-card shadow-lg px-4 py-3 text-sm min-w-[160px]">
      <p className="font-semibold text-xs mb-1.5 truncate max-w-[160px]">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground text-xs">{p.name}</span>
          <span className="font-bold text-xs">{p.dataKey === "revenue" ? formatCurrency(p.value) : `${p.value} units`}</span>
        </div>
      ))}
    </div>
  );
};

function shortDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Analytics() {
  const { data: summary, isLoading: sl } = useGetDashboardSummary();
  const { data: chartData, isLoading: cl } = useGetSalesChart();
  const { data: topMedicines, isLoading: tl } = useGetTopMedicines();

  const isLoading = sl || cl || tl;

  const formattedChart = chartData?.map(p => ({
    ...p,
    date: shortDate(p.date),
  })) ?? [];

  const totalRevenue = chartData?.reduce((s, p) => s + p.sales, 0) ?? 0;
  const totalProfit = chartData?.reduce((s, p) => s + p.profit, 0) ?? 0;
  const avgDaily = chartData?.length ? totalRevenue / chartData.length : 0;
  const peakDay = chartData?.reduce((best, p) => p.sales > best.sales ? p : best, { date: "", sales: 0, profit: 0 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground text-sm animate-pulse">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="30-Day Revenue"
          value={formatCurrency(totalRevenue)}
          sub="NPR"
          icon={DollarSign}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          title="30-Day Profit"
          value={formatCurrency(totalProfit)}
          sub="NPR"
          icon={TrendingUp}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          valueColor="text-green-600"
        />
        <StatCard
          title="Daily Average"
          value={formatCurrency(avgDaily)}
          sub="per day"
          icon={ShoppingBag}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Inventory Value"
          value={formatCurrency(summary?.inventoryValue || 0)}
          sub="at purchase price"
          icon={Package}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        />
      </div>

      {/* Sales + Profit area chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Revenue &amp; Profit — Last 30 Days
            </CardTitle>
            {peakDay?.date && (
              <p className="text-xs text-muted-foreground mt-1">
                Peak day: <span className="font-medium text-foreground">{shortDate(peakDay.date)}</span> — {formatCurrency(peakDay.sales)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: TEAL }} />
              <span className="text-muted-foreground">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: GREEN }} />
              <span className="text-muted-foreground">Profit</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[280px] md:h-[320px] px-2 pb-2">
          {formattedChart.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={TEAL} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GREEN} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickMargin={8}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v) => `${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sales" name="Revenue" stroke={TEAL} strokeWidth={2} fill="url(#gradSales)" dot={false} activeDot={{ r: 4, fill: TEAL }} />
                <Area type="monotone" dataKey="profit" name="Profit" stroke={GREEN} strokeWidth={2} fill="url(#gradProfit)" dot={false} activeDot={{ r: 4, fill: GREEN }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No sales data for the last 30 days</div>
          )}
        </CardContent>
      </Card>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        {/* Top medicines revenue bar chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Top Medicines by Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px] px-2 pb-2">
            {topMedicines && topMedicines.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topMedicines}
                  layout="vertical"
                  margin={{ top: 0, right: 12, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip content={<BarTooltip />} />
                  <Bar dataKey="revenue" name="Revenue" radius={[0, 6, 6, 0]} maxBarSize={20}>
                    {topMedicines.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Top medicines units sold + summary table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Units Sold Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            {topMedicines && topMedicines.length > 0 ? (
              <div className="space-y-3">
                {topMedicines.map((med, i) => {
                  const maxUnits = topMedicines[0]?.quantitySold || 1;
                  const pct = Math.round((med.quantitySold / maxUnits) * 100);
                  return (
                    <div key={med.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: PALETTE[i % PALETTE.length] }}
                          />
                          <span className="font-medium truncate">{med.name}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-2">
                          <span className="text-xs text-muted-foreground">{med.quantitySold} units</span>
                          <span className="text-xs font-semibold w-20 text-right">{formatCurrency(med.revenue)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: PALETTE[i % PALETTE.length] }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* totals */}
                <div className="pt-3 mt-3 border-t flex justify-between text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Total Units</div>
                    <div className="font-bold">{topMedicines.reduce((s, m) => s + m.quantitySold, 0)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Total Revenue</div>
                    <div className="font-bold">{formatCurrency(topMedicines.reduce((s, m) => s + m.revenue, 0))}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-[240px] items-center justify-center text-muted-foreground text-sm">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
