import { useListSuppliers } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { Plus, Building2, Phone, Mail } from "lucide-react";

export default function Suppliers() {
  const { data: suppliers, isLoading } = useListSuppliers();

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Suppliers</h1>
        <Button size="sm" className="shrink-0">
          <Plus className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Add Supplier</span>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[140px]">Name</TableHead>
              <TableHead className="min-w-[120px] hidden sm:table-cell">Contact Person</TableHead>
              <TableHead className="min-w-[150px] hidden md:table-cell">Contact Info</TableHead>
              <TableHead className="text-right min-w-[120px]">Total Purchases</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : suppliers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No suppliers found.</TableCell>
              </TableRow>
            ) : (
              suppliers?.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <div className="font-medium">{supplier.name}</div>
                        <div className="text-xs text-muted-foreground sm:hidden">{supplier.contactPerson}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{supplier.contactPerson || "—"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="space-y-1">
                      {supplier.phone && (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span>{supplier.phone}</span>
                        </div>
                      )}
                      {supplier.email && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span>{supplier.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(supplier.totalPurchases || 0)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
