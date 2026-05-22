import { useGetExpiryAlerts } from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

export default function Expiry() {
  const { data: alerts, isLoading } = useGetExpiryAlerts();

  if (isLoading) return <div className="p-8">Loading...</div>;

  const renderTable = (items: any[], emptyMsg: string, badgeColor: string) => (
    <div className="border rounded-md bg-card mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medicine</TableHead>
            <TableHead>Batch Number</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Days Left</TableHead>
            <TableHead className="text-right">Stock Qty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!items || items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">{emptyMsg}</TableCell>
            </TableRow>
          ) : (
            items.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.batchNumber}</TableCell>
                <TableCell>{formatDate(item.expiryDate)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={badgeColor}>
                    {item.daysUntilExpiry < 0 ? "Expired" : `${item.daysUntilExpiry} days`}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-primary">Expiry Management</h1>
      
      <Tabs defaultValue="expired" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger value="expired" className="data-[state=active]:border-b-2 data-[state=active]:border-destructive data-[state=active]:text-destructive rounded-none px-6 py-3">
            Expired ({alerts?.expired?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="30days" className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:text-amber-600 rounded-none px-6 py-3">
            Within 30 Days ({alerts?.within30?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="60days" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-6 py-3">
            Within 60 Days ({alerts?.within60?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="90days" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-6 py-3">
            Within 90 Days ({alerts?.within90?.length || 0})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="expired">
          {renderTable(alerts?.expired || [], "No expired medicines.", "bg-destructive text-white border-transparent")}
        </TabsContent>
        <TabsContent value="30days">
          {renderTable(alerts?.within30 || [], "No medicines expiring within 30 days.", "bg-amber-500 text-white border-transparent")}
        </TabsContent>
        <TabsContent value="60days">
          {renderTable(alerts?.within60 || [], "No medicines expiring within 60 days.", "bg-amber-200 text-amber-800 border-transparent")}
        </TabsContent>
        <TabsContent value="90days">
          {renderTable(alerts?.within90 || [], "No medicines expiring within 90 days.", "bg-green-100 text-green-800 border-transparent")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
