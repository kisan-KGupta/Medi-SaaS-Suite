import { useState } from "react";
import {
  useCreatePurchase, useListSuppliers, useListMedicines, getListPurchasesQueryKey, getListMedicinesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/format";
import { Plus, Trash2, Search } from "lucide-react";

interface PurchaseItem {
  medicineId: number;
  medicineName: string;
  quantity: number;
  purchasePrice: number;
  batchNumber: string;
  expiryDate: string;
}

interface Props { open: boolean; onClose: () => void; }

const today = () => new Date().toISOString().split("T")[0];

export default function NewPurchaseDialog({ open, onClose }: Props) {
  const [supplierId, setSupplierId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(today());
  const [medSearch, setMedSearch] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([]);

  const { data: suppliers } = useListSuppliers();
  const { data: medicines } = useListMedicines({ search: medSearch });
  const create = useCreatePurchase();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addMedicine = (med: any) => {
    if (items.find(i => i.medicineId === med.id)) return;
    setItems(prev => [...prev, {
      medicineId: med.id,
      medicineName: med.name,
      quantity: 1,
      purchasePrice: med.purchasePrice ?? 0,
      batchNumber: med.batchNumber ?? "",
      expiryDate: med.expiryDate ?? "",
    }]);
    setMedSearch("");
  };

  const updateItem = (idx: number, field: keyof PurchaseItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const total = items.reduce((sum, i) => sum + i.quantity * i.purchasePrice, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) { toast({ title: "Select a supplier", variant: "destructive" }); return; }
    if (!invoiceNumber.trim()) { toast({ title: "Invoice number is required", variant: "destructive" }); return; }
    if (items.length === 0) { toast({ title: "Add at least one medicine", variant: "destructive" }); return; }
    for (const item of items) {
      if (!item.batchNumber || !item.expiryDate) {
        toast({ title: `Fill batch and expiry for ${item.medicineName}`, variant: "destructive" }); return;
      }
    }

    create.mutate({
      data: {
        supplierId: Number(supplierId),
        invoiceNumber: invoiceNumber.trim(),
        purchaseDate,
        items: items.map(i => ({
          medicineId: i.medicineId,
          quantity: i.quantity,
          purchasePrice: i.purchasePrice,
          batchNumber: i.batchNumber,
          expiryDate: i.expiryDate,
        })),
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPurchasesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListMedicinesQueryKey() });
        toast({ title: "Purchase recorded and stock updated" });
        setSupplierId(""); setInvoiceNumber(""); setPurchaseDate(today()); setItems([]);
        onClose();
      },
      onError: (err: any) => toast({ title: "Failed to record purchase", description: err?.data?.error ?? "Error", variant: "destructive" }),
    });
  };

  const showMedicineResults = medSearch.length > 0 && medicines && medicines.length > 0;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Purchase</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Header fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Supplier <span className="text-destructive">*</span></Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={supplierId} onChange={e => setSupplierId(e.target.value)}
              >
                <option value="">Select supplier</option>
                {suppliers?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Invoice Number <span className="text-destructive">*</span></Label>
              <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="e.g. INV-2025-001" />
            </div>
            <div className="space-y-1.5">
              <Label>Purchase Date</Label>
              <Input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
            </div>
          </div>

          {/* Medicine search */}
          <div>
            <Label className="mb-1.5 block">Search & Add Medicines</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Type medicine name to search..."
                value={medSearch}
                onChange={e => setMedSearch(e.target.value)}
              />
            </div>
            {showMedicineResults && (
              <div className="border rounded-md mt-1 bg-card shadow-sm max-h-40 overflow-y-auto">
                {medicines!.filter(m => !items.find(i => i.medicineId === m.id)).map(med => (
                  <div
                    key={med.id}
                    className="flex items-center justify-between px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                    onClick={() => addMedicine(med)}
                  >
                    <div>
                      <span className="font-medium">{med.name}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{med.genericName}</span>
                    </div>
                    <Button type="button" size="sm" variant="ghost" className="h-6 gap-1 text-xs">
                      <Plus className="w-3 h-3" /> Add
                    </Button>
                  </div>
                ))}
                {medicines!.filter(m => !items.find(i => i.medicineId === m.id)).length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">All matching medicines already added</div>
                )}
              </div>
            )}
          </div>

          {/* Items table */}
          {items.length > 0 && (
            <div className="space-y-2">
              <Label>Purchase Items</Label>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium min-w-[130px]">Medicine</th>
                      <th className="px-3 py-2 text-left font-medium min-w-[70px]">Qty</th>
                      <th className="px-3 py-2 text-left font-medium min-w-[100px]">Price (NPR)</th>
                      <th className="px-3 py-2 text-left font-medium min-w-[110px]">Batch No.</th>
                      <th className="px-3 py-2 text-left font-medium min-w-[120px]">Expiry</th>
                      <th className="px-3 py-2 text-right font-medium min-w-[80px]">Amount</th>
                      <th className="px-2 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2 font-medium">{item.medicineName}</td>
                        <td className="px-3 py-2">
                          <Input
                            type="number" min="1" className="h-7 w-16 text-sm"
                            value={item.quantity}
                            onChange={e => updateItem(idx, "quantity", Number(e.target.value) || 1)}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number" min="0" step="0.01" className="h-7 w-24 text-sm"
                            value={item.purchasePrice}
                            onChange={e => updateItem(idx, "purchasePrice", Number(e.target.value))}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            className="h-7 w-28 text-sm"
                            value={item.batchNumber}
                            onChange={e => updateItem(idx, "batchNumber", e.target.value)}
                            placeholder="Batch No."
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="date" className="h-7 text-sm"
                            value={item.expiryDate}
                            onChange={e => updateItem(idx, "expiryDate", e.target.value)}
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          {formatCurrency(item.quantity * item.purchasePrice)}
                        </td>
                        <td className="px-2 py-2">
                          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(idx)}>
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/30 border-t">
                    <tr>
                      <td colSpan={5} className="px-3 py-2 text-right font-semibold text-sm">Total</td>
                      <td className="px-3 py-2 text-right font-bold">{formatCurrency(total)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {items.length === 0 && (
            <div className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
              Search and add medicines to this purchase
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={create.isPending || items.length === 0}>
              {create.isPending ? "Recording..." : `Record Purchase (${formatCurrency(total)})`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
