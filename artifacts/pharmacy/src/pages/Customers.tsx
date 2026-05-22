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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Customers</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search customers..." 
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
              <TableHead>Contact</TableHead>
              <TableHead>Member Since</TableHead>
              <TableHead className="text-right">Credit Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">Loading...</TableCell>
              </TableRow>
            ) : customers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No customers found.</TableCell>
              </TableRow>
            ) : (
              customers?.map(customer => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.phone || customer.email || '-'}
                  </TableCell>
                  <TableCell>{formatDate(customer.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <span className={customer.creditBalance > 0 ? "text-destructive font-bold" : ""}>
                      {formatCurrency(customer.creditBalance)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {customer.creditBalance > 0 && (
                      <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary hover:text-white">
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
