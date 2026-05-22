import { useState } from "react";
import { useListSales } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon } from "lucide-react";

export default function Sales() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: sales, isLoading } = useListSales({ startDate, endDate });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Sales History</h1>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <Input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="w-40" 
          />
        </div>
        <span className="text-muted-foreground">to</span>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <Input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            className="w-40" 
          />
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">Loading...</TableCell>
              </TableRow>
            ) : sales?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No sales found for the selected period.</TableCell>
              </TableRow>
            ) : (
              sales?.map(sale => (
                <TableRow key={sale.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{sale.billNumber}</TableCell>
                  <TableCell>{formatDate(sale.saleDate)}</TableCell>
                  <TableCell>
                    {sale.customerName ? (
                      <div>
                        <div>{sale.customerName}</div>
                        {sale.customerPhone && <div className="text-xs text-muted-foreground">{sale.customerPhone}</div>}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">Walk-in</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(sale.totalAmount)}</TableCell>
                  <TableCell className="text-center">
                    {sale.isCredit ? (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Credit</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
