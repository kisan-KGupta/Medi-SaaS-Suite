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
    if (status === 'expired') return 'bg-destructive text-destructive-foreground';
    if (status === 'expiring_soon') return 'bg-amber-500 text-white';
    return 'bg-green-500 text-white';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Inventory</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Medicine
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search medicines..." 
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Generic Name</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">Loading...</TableCell>
              </TableRow>
            ) : medicines?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">No medicines found.</TableCell>
              </TableRow>
            ) : (
              medicines?.map(med => (
                <TableRow key={med.id}>
                  <TableCell className="font-medium">{med.name}</TableCell>
                  <TableCell className="text-muted-foreground">{med.genericName}</TableCell>
                  <TableCell>{med.batchNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{formatDate(med.expiryDate)}</span>
                      {med.expiryStatus && (
                        <Badge variant="outline" className={getExpiryColor(med.expiryStatus)}>
                          {med.expiryStatus.replace('_', ' ')}
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
