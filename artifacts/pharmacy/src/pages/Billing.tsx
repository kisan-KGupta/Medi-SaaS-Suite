import { useState } from "react";
import {
  useListMedicines,
  useCreateSale,
  getListSalesQueryKey,
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { Search, Plus, Trash2, Printer, ListPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import Invoice from "@/components/Invoice";

interface CartItem {
  medicineId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  vatPercent: number;
  discount: number;
  maxQty: number;
}

export default function Billing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isCredit, setIsCredit] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showMedicineList, setShowMedicineList] = useState(false);

  const { data: medicines } = useListMedicines({ search: searchTerm });
  const createSale = useCreateSale();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addToCart = (med: any) => {
    if (med.quantity <= 0) {
      toast({ title: "Out of stock", variant: "destructive" });
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.medicineId === med.id);
      if (existing) {
        if (existing.quantity >= med.quantity) return prev;
        return prev.map((i) =>
          i.medicineId === med.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          medicineId: med.id,
          name: med.name,
          quantity: 1,
          unitPrice: med.sellingPrice,
          vatPercent: med.vatPercent || 0,
          discount: 0,
          maxQty: med.quantity,
        },
      ];
    });
  };

  const updateQty = (id: number, qty: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.medicineId === id
          ? { ...i, quantity: Math.min(Math.max(1, qty), i.maxQty) }
          : i
      )
    );
  };

  const remove = (id: number) =>
    setCart((prev) => prev.filter((i) => i.medicineId !== id));

  const subtotal = cart.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
  const vatAmount = cart.reduce(
    (acc, i) => acc + i.unitPrice * i.quantity * (i.vatPercent / 100),
    0
  );
  const total = subtotal + vatAmount - discountAmount;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    createSale.mutate(
      {
        data: {
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
          discountAmount,
          isCredit,
          items: cart.map((i) => ({
            medicineId: i.medicineId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            discount: i.discount,
            vatPercent: i.vatPercent,
          })),
        },
      },
      {
        onSuccess: (sale) => {
          queryClient.invalidateQueries({ queryKey: getListSalesQueryKey() });
          setLastSale(sale);
          setShowInvoice(true);
           setShowMedicineList(false);
          setCart([]);
          setCustomerName("");
          setCustomerPhone("");
          setDiscountAmount(0);
          setIsCredit(false);
          toast({ title: "Sale completed — invoice ready" });
        },
        onError: (err: any) => {
          toast({
            title: "Sale failed",
            description: err?.data?.error ?? "Something went wrong",
            variant: "destructive",
          });
        },
      }
    );
  };

  const CartPanel = (
    <div className="flex flex-col h-full">
       <div className="p-4 border-b font-bold text-lg flex items-center justify-between">
         <span>Current Bill</span>
         <div className="flex items-center gap-2">
           <Button
             size="icon"
             variant="outline"
             className="h-9 w-9 lg:hidden"
             onClick={() => setShowMedicineList(true)}
             aria-label="Search and add medicine"
             title="Search and add medicine"
           >
             <ListPlus className="w-4 h-4" />
           </Button>
           {lastSale && (
             <Button
               size="sm"
               variant="outline"
               className="gap-1.5 text-xs"
               onClick={() => setShowInvoice(true)}
             >
               <Printer className="w-3.5 h-3.5" />
               <span className="hidden sm:inline">Last Invoice</span>
             </Button>
           )}
         </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {cart.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10 text-sm">
            Search and add medicines to start a bill
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
              <div
                key={item.medicineId}
                className="flex items-center justify-between text-sm border-b pb-3"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {formatCurrency(item.unitPrice)} × {item.quantity}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-semibold text-sm">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                  <Input
                    type="number"
                    className="w-14 h-7 text-center text-xs"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQty(item.medicineId, parseInt(e.target.value) || 1)
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => remove(item.medicineId)}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t space-y-3 bg-muted/20">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Customer Name
            </label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Optional"
              className="h-8 mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Phone
            </label>
            <Input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Optional"
              className="h-8 mt-1"
            />
          </div>
        </div>

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Discount (NPR)</span>
            <Input
              type="number"
              className="w-24 h-7 text-right text-sm"
              value={discountAmount}
              min={0}
              onChange={(e) =>
                setDiscountAmount(Math.max(0, Number(e.target.value)))
              }
            />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">VAT</span>
            <span>{formatCurrency(vatAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="credit-toggle"
            checked={isCredit}
            onChange={(e) => setIsCredit(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="credit-toggle" className="text-sm cursor-pointer">
            Credit Sale
          </label>
        </div>

        <Button
          className="w-full h-11 text-base font-semibold gap-2"
          disabled={cart.length === 0 || createSale.isPending}
          onClick={handleCheckout}
        >
          <Printer className="w-4 h-4" />
          {createSale.isPending ? "Processing..." : "Complete & Print Invoice"}
        </Button>
      </div>
    </div>
  );

  const MedicinePanel = (
    <div className="flex flex-col gap-4 min-h-0 h-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search medicine... (Enter to add first)"
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && medicines && medicines.length > 0) {
                addToCart(medicines[0]);
                setSearchTerm("");
              }
            }}
          />
        </div>
      </div>

      <div className="border rounded-md flex-1 min-h-0 overflow-auto bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine</TableHead>
              <TableHead className="hidden sm:table-cell">Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medicines?.map((med) => (
              <TableRow
                key={med.id}
                className="cursor-pointer hover:bg-muted/40"
                onClick={() => addToCart(med)}
              >
                <TableCell>
                  <div className="font-medium text-sm">{med.name}</div>
                  <div className="text-xs text-muted-foreground">{med.genericName}</div>
                  <div className="text-xs text-muted-foreground sm:hidden">
                    Stock:{" "}
                    <span className={med.quantity <= med.reorderLevel ? "text-amber-600 font-bold" : ""}>
                      {med.quantity}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className={med.quantity <= med.reorderLevel ? "text-amber-600 font-bold" : ""}>
                    {med.quantity}
                  </span>
                </TableCell>
                <TableCell className="text-sm">{formatCurrency(med.sellingPrice)}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(med);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <>
      {showInvoice && lastSale && (
        <Invoice data={lastSale} onClose={() => setShowInvoice(false)} />
      )}

      {/* Mobile medicine search sheet */}
      {showMedicineList && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMedicineList(false)}
          />
          <div className="absolute inset-x-0 bottom-0 flex h-[92vh] flex-col rounded-t-2xl bg-card shadow-2xl">
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <span className="text-sm font-semibold">Search & Add Medicine</span>
              <button
                className="text-muted-foreground hover:text-foreground p-1"
                onClick={() => setShowMedicineList(false)}
                aria-label="Close medicine list"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden p-4">{MedicinePanel}</div>
          </div>
        </div>
      )}

      <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* Current bill — large left workspace */}
        <div className="flex lg:hidden flex-1 min-h-0 flex-col border rounded-md bg-card shadow-sm">
          {CartPanel}
        </div>
        <div className="hidden lg:flex flex-1 min-w-0 flex-col border rounded-md bg-card shadow-sm">
          {CartPanel}
        </div>

        {/* Medicine search — right column */}
        <div className="hidden lg:flex flex-col gap-4 min-h-0 lg:w-[400px] xl:w-[460px] shrink-0">
          {MedicinePanel}
        </div>
      </div>
    </>
  );
}
