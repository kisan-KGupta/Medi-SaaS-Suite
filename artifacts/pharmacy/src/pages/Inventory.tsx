import { useState } from "react";
import { useListMedicines } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { Search, Plus } from "lucide-react";

export default function Inventory() {
  const [search, setSearch] = useState("");
  const { data: medicines, isLoading } = useListMedicines({ search });

  const getExpiryColor = (status: string) => {
    if (status === "expired") return "bg-destructive text-destructive-foreground";
    if (status === "expiring_soon") return "bg-amber-500 text-white";
    return "bg-green-500 text-white";
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Inventory</h1>
        <Button size="sm" className="shrink-0">
          <Plus className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Add Medicine</span>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search medicines..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[140px]">Name</TableHead>
              <TableHead className="min-w-[120px] hidden sm:table-cell">Generic Name</TableHead>
              <TableHead className="min-w-[90px] hidden md:table-cell">Batch</TableHead>
              <TableHead className="min-w-[130px]">Expiry</TableHead>
              <TableHead className="text-right min-w-[70px]">Stock</TableHead>
              <TableHead className="text-right min-w-[90px]">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : medicines?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No medicines found.</TableCell>
              </TableRow>
            ) : (
              medicines?.map((med) => (
                <TableRow key={med.id}>
                  <TableCell className="font-medium">
                    <div>{med.name}</div>
                    <div className="text-xs text-muted-foreground sm:hidden">{med.genericName}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden sm:table-cell">{med.genericName}</TableCell>
                  <TableCell className="hidden md:table-cell">{med.batchNumber}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm">{formatDate(med.expiryDate)}</span>
                      {med.expiryStatus && (
                        <Badge variant="outline" className={getExpiryColor(med.expiryStatus)}>
                          {med.expiryStatus.replace("_", " ")}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={med.quantity <= med.reorderLevel ? "text-amber-600 font-bold" : ""}>
                      {med.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(med.sellingPrice)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
