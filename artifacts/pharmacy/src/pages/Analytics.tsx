import { useGetDashboardSummary, useGetSalesChart, useGetTopMedicines } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  Bar, BarChart,
} from "recharts";

export default function Analytics() {
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();
  const { data: chartData, isLoading: isChartLoading } = useGetSalesChart();
  const { data: topMedicines, isLoading: isTopMedicinesLoading } = useGetTopMedicines();

  if (isSummaryLoading || isChartLoading || isTopMedicinesLoading) {
    return <div className="p-8 text-muted-foreground">Loading analytics...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto pb-10">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Analytics</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{formatCurrency(summary?.monthlySales || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Profit (est.)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-green-600">
              {formatCurrency((summary?.monthlySales || 0) * 0.15)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{formatCurrency(summary?.inventoryValue || 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Sales Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px] md:h-[300px]">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickMargin={8} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `Rs.${v / 1000}k`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), ""]} />
                  <Area type="monotone" dataKey="sales" name="Sales" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSales)" />
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No chart data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Top Medicines by Revenue</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px] md:h-[300px]">
            {topMedicines && topMedicines.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topMedicines} layout="vertical" margin={{ top: 0, right: 10, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                  <XAxis type="number" tickFormatter={(v) => `Rs.${v / 1000}k`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), "Revenue"]} />
                  <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
