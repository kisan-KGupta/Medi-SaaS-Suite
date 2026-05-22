import { useState } from "react";
import { useListSales, useGetSale, getGetSaleQueryKey } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Printer } from "lucide-react";
import Invoice from "@/components/Invoice";

function SaleInvoiceLoader({ saleId, onClose }: { saleId: number; onClose: () => void }) {
  const { data: sale, isLoading } = useGetSale(saleId, {
    query: { queryKey: getGetSaleQueryKey(saleId) },
  });

  if (isLoading || !sale) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 text-center">Loading invoice...</div>
      </div>
    );
  }

  return <Invoice data={sale} onClose={onClose} />;
}

export default function Sales() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [printSaleId, setPrintSaleId] = useState<number | null>(null);

  const { data: sales, isLoading } = useListSales(
    { startDate: startDate || undefined, endDate: endDate || undefined },
    { query: { queryKey: ["listSales", startDate, endDate] as any } }
  );

  return (
    <>
      {printSaleId !== null && (
        <SaleInvoiceLoader saleId={printSaleId} onClose={() => setPrintSaleId(null)} />
      )}

      <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Sales History</h1>

        {/* Date filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-36 md:w-40"
            />
          </div>
          <span className="text-muted-foreground text-sm">to</span>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-36 md:w-40"
            />
          </div>
          {(startDate || endDate) && (
            <Button variant="ghost" size="sm" onClick={() => { setStartDate(""); setEndDate(""); }}>
              Clear
            </Button>
          )}
        </div>

        <div className="overflow-x-auto rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Bill No.</TableHead>
                <TableHead className="min-w-[100px]">Date</TableHead>
                <TableHead className="min-w-[120px] hidden sm:table-cell">Customer</TableHead>
                <TableHead className="text-right min-w-[100px]">Total (NPR)</TableHead>
                <TableHead className="text-center min-w-[80px]">Status</TableHead>
                <TableHead className="text-center min-w-[70px]">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : !sales?.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No sales found for the selected period.
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-mono text-xs font-medium">
                      <div>{sale.billNumber}</div>
                      <div className="text-muted-foreground sm:hidden">{sale.customerName || "Walk-in"}</div>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(sale.saleDate)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {sale.customerName ? (
                        <div>
                          <div className="font-medium">{sale.customerName}</div>
                          {sale.customerPhone && <div className="text-xs text-muted-foreground">{sale.customerPhone}</div>}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-sm">Walk-in</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(sale.totalAmount)}</TableCell>
                    <TableCell className="text-center">
                      {sale.isCredit ? (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-xs">Credit</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">Paid</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1 text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-2"
                        onClick={() => setPrintSaleId(sale.id)}
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Print</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
