import { useState } from "react";
import { useListCustomers } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";
import { Search, Plus, UserCircle } from "lucide-react";

export default function Customers() {
  const [search, setSearch] = useState("");
  const { data: customers, isLoading } = useListCustomers({ search });

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Customers</h1>
        <Button size="sm" className="shrink-0">
          <Plus className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Add Customer</span>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
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
              <TableHead className="min-w-[110px] hidden sm:table-cell">Contact</TableHead>
              <TableHead className="min-w-[110px] hidden md:table-cell">Member Since</TableHead>
              <TableHead className="text-right min-w-[120px]">Credit Balance</TableHead>
              <TableHead className="text-right min-w-[120px] hidden sm:table-cell">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : customers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No customers found.</TableCell>
              </TableRow>
            ) : (
              customers?.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-xs text-muted-foreground sm:hidden">{customer.phone || customer.email || ""}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{customer.phone || customer.email || "—"}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(customer.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <span className={customer.creditBalance > 0 ? "text-destructive font-bold" : ""}>
                      {formatCurrency(customer.creditBalance)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right hidden sm:table-cell">
                    {customer.creditBalance > 0 && (
                      <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary hover:text-white text-xs">
                        Record Payment
                      </Button>
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
