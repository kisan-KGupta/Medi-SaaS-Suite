import { useState } from "react";
import { useListSales, useGetSale, getGetSaleQueryKey } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Printer } from "lucide-react";
import Invoice from "@/components/Invoice";
import { useQueryClient } from "@tanstack/react-query";

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

      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Sales History</h1>
        </div>

        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-40"
              data-testid="input-start-date"
            />
          </div>
          <span className="text-muted-foreground">to</span>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-40"
              data-testid="input-end-date"
            />
          </div>
          {(startDate || endDate) && (
            <Button variant="ghost" size="sm" onClick={() => { setStartDate(""); setEndDate(""); }}>
              Clear
            </Button>
          )}
        </div>

        <div className="border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Total (NPR)</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Invoice</TableHead>
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
                sales.map(sale => (
                  <TableRow key={sale.id} data-testid={`row-sale-${sale.id}`}>
                    <TableCell className="font-mono font-medium text-xs">{sale.billNumber}</TableCell>
                    <TableCell>{formatDate(sale.saleDate)}</TableCell>
                    <TableCell>
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
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Credit</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                        onClick={() => setPrintSaleId(sale.id)}
                        data-testid={`button-print-${sale.id}`}
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print
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
