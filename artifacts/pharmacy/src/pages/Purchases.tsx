import { useState } from "react";
import { useListPurchases } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Purchases() {
  const { data: purchases, isLoading } = useListPurchases();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Purchases</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Purchase
        </Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">Loading...</TableCell>
              </TableRow>
            ) : purchases?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No purchases found.</TableCell>
              </TableRow>
            ) : (
              purchases?.map(purchase => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">{purchase.invoiceNumber}</TableCell>
                  <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
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
