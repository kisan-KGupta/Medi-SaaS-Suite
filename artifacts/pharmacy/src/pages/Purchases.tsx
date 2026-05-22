import { useState } from "react";
import { useListPurchases } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import NewPurchaseDialog from "@/components/NewPurchaseDialog";

export default function Purchases() {
  const [showNew, setShowNew] = useState(false);
  const { data: purchases, isLoading } = useListPurchases();

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <NewPurchaseDialog open={showNew} onClose={() => setShowNew(false)} />

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Purchases</h1>
        <Button size="sm" className="shrink-0" onClick={() => setShowNew(true)}>
          <Plus className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">New Purchase</span>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Invoice No.</TableHead>
              <TableHead className="min-w-[100px] hidden sm:table-cell">Date</TableHead>
              <TableHead className="min-w-[120px]">Supplier</TableHead>
              <TableHead className="text-right min-w-[110px]">Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : purchases?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No purchases found.</TableCell>
              </TableRow>
            ) : (
              purchases?.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium text-sm">
                    <div>{purchase.invoiceNumber}</div>
                    <div className="text-xs text-muted-foreground sm:hidden">{formatDate(purchase.purchaseDate)}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{formatDate(purchase.purchaseDate)}</TableCell>
                  <TableCell>{purchase.supplierName}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(purchase.totalAmount)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
