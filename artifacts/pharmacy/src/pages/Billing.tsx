import { useState } from "react";
import { 
  useListMedicines,
  useCreateSale
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { Search, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SaleItemInput } from "@workspace/api-client-react/src/generated/api.schemas";

interface CartItem extends SaleItemInput {
  name: string;
  maxQty: number;
}

export default function Billing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isCredit, setIsCredit] = useState(false);
  
  const { data: medicines } = useListMedicines({ search: searchTerm });
  const createSale = useCreateSale();
  const { toast } = useToast();

  const addToCart = (med: any) => {
    if (med.quantity <= 0) {
      toast({ title: "Out of stock", variant: "destructive" });
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(i => i.medicineId === med.id);
      if (existing) {
        if (existing.quantity >= med.quantity) return prev;
        return prev.map(i => i.medicineId === med.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        medicineId: med.id,
        name: med.name,
        quantity: 1,
        unitPrice: med.sellingPrice,
        vatPercent: med.vatPercent || 0,
        discount: 0,
        maxQty: med.quantity
      }];
    });
  };

  const updateQty = (id: number, qty: number) => {
    setCart(prev => prev.map(i => {
      if (i.medicineId === id) {
        return { ...i, quantity: Math.min(Math.max(1, qty), i.maxQty) };
      }
      return i;
    }));
  };

  const remove = (id: number) => {
    setCart(prev => prev.filter(i => i.medicineId !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const vatAmount = cart.reduce((acc, item) => acc + ((item.unitPrice * item.quantity) * (item.vatPercent || 0) / 100), 0);
  const total = subtotal + vatAmount - discountAmount;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    createSale.mutate({
      data: {
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        discountAmount,
        isCredit,
        items: cart.map(i => ({
          medicineId: i.medicineId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discount: i.discount,
          vatPercent: i.vatPercent
        }))
      }
    }, {
      onSuccess: () => {
        toast({ title: "Sale completed successfully" });
        setCart([]);
        setCustomerName("");
        setCustomerPhone("");
        setDiscountAmount(0);
        setIsCredit(false);
      },
      onError: (err) => {
        toast({ title: "Sale failed", description: err.error, variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Search & Products */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search medicine by name or barcode... (Press Enter to add first result)" 
            className="pl-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && medicines && medicines.length > 0) {
                addToCart(medicines[0]);
                setSearchTerm("");
              }
            }}
          />
        </div>
        
        <div className="border rounded-md flex-1 overflow-auto bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicines?.map(med => (
                <TableRow key={med.id}>
                  <TableCell>
                    <div className="font-medium">{med.name}</div>
                    <div className="text-xs text-muted-foreground">{med.genericName}</div>
                  </TableCell>
                  <TableCell>
                    <span className={med.quantity <= med.reorderLevel ? "text-amber-600 font-bold" : ""}>
                      {med.quantity}
                    </span>
                  </TableCell>
                  <TableCell>{formatCurrency(med.sellingPrice)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => addToCart(med)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="w-full lg:w-[400px] flex flex-col border rounded-md bg-card shadow-sm">
        <div className="p-4 border-b font-bold text-lg">Current Bill</div>
        
        <div className="flex-1 overflow-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground mt-10">Cart is empty</div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.medicineId} className="flex items-center justify-between text-sm">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-muted-foreground">{formatCurrency(item.unitPrice)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      className="w-16 h-8 text-center" 
                      value={item.quantity}
                      onChange={e => updateQty(item.medicineId, parseInt(e.target.value) || 1)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => remove(item.medicineId)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t space-y-4 bg-muted/20">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium">Customer Name</label>
              <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Optional" className="h-8" />
            </div>
            <div>
              <label className="text-xs font-medium">Phone</label>
              <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Optional" className="h-8" />
            </div>
          </div>

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Discount</span>
              <Input 
                type="number" 
                className="w-24 h-7 text-right" 
                value={discountAmount}
                onChange={e => setDiscountAmount(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VAT</span>
              <span>{formatCurrency(vatAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          <Button 
            className="w-full h-12 text-lg" 
            disabled={cart.length === 0 || createSale.isPending}
            onClick={handleCheckout}
          >
            {createSale.isPending ? "Processing..." : "Complete Sale"}
          </Button>
        </div>
      </div>
    </div>
  );
}
