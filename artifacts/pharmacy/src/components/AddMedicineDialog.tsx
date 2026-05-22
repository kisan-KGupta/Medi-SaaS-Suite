import { useState } from "react";
import { useCreateMedicine, useListCategories, useListSuppliers, getListMedicinesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Props { open: boolean; onClose: () => void; }

const EMPTY = {
  name: "", genericName: "", brandName: "", batchNumber: "", barcode: "",
  expiryDate: "", quantity: "", purchasePrice: "", sellingPrice: "",
  vatPercent: "13", reorderLevel: "10", storageLocation: "",
  categoryId: "", supplierId: "",
};

export default function AddMedicineDialog({ open, onClose }: Props) {
  const [f, setF] = useState(EMPTY);
  const { data: categories } = useListCategories();
  const { data: suppliers } = useListSuppliers();
  const create = useCreateMedicine();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name || !f.genericName || !f.batchNumber || !f.expiryDate || !f.quantity || !f.purchasePrice || !f.sellingPrice) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    create.mutate({
      data: {
        name: f.name, genericName: f.genericName, brandName: f.brandName || undefined,
        batchNumber: f.batchNumber, barcode: f.barcode || undefined,
        expiryDate: f.expiryDate, quantity: Number(f.quantity),
        purchasePrice: Number(f.purchasePrice), sellingPrice: Number(f.sellingPrice),
        vatPercent: Number(f.vatPercent) || 0,
        reorderLevel: Number(f.reorderLevel) || 10,
        storageLocation: f.storageLocation || undefined,
        categoryId: f.categoryId ? Number(f.categoryId) : undefined,
        supplierId: f.supplierId ? Number(f.supplierId) : undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMedicinesQueryKey() });
        toast({ title: "Medicine added successfully" });
        setF(EMPTY);
        onClose();
      },
      onError: (err: any) => toast({ title: "Failed to add medicine", description: err?.data?.error ?? "Error", variant: "destructive" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Medicine</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input value={f.name} onChange={set("name")} placeholder="e.g. Paracetamol 500mg" />
            </div>
            <div className="space-y-1.5">
              <Label>Generic Name <span className="text-destructive">*</span></Label>
              <Input value={f.genericName} onChange={set("genericName")} placeholder="e.g. Paracetamol" />
            </div>
            <div className="space-y-1.5">
              <Label>Brand Name</Label>
              <Input value={f.brandName} onChange={set("brandName")} placeholder="Optional" />
            </div>
            <div className="space-y-1.5">
              <Label>Batch Number <span className="text-destructive">*</span></Label>
              <Input value={f.batchNumber} onChange={set("batchNumber")} placeholder="e.g. BT-2025-001" />
            </div>
            <div className="space-y-1.5">
              <Label>Expiry Date <span className="text-destructive">*</span></Label>
              <Input type="date" value={f.expiryDate} onChange={set("expiryDate")} />
            </div>
            <div className="space-y-1.5">
              <Label>Barcode</Label>
              <Input value={f.barcode} onChange={set("barcode")} placeholder="Optional" />
            </div>
            <div className="space-y-1.5">
              <Label>Stock Quantity <span className="text-destructive">*</span></Label>
              <Input type="number" min="0" value={f.quantity} onChange={set("quantity")} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Reorder Level</Label>
              <Input type="number" min="0" value={f.reorderLevel} onChange={set("reorderLevel")} />
            </div>
            <div className="space-y-1.5">
              <Label>Purchase Price (NPR) <span className="text-destructive">*</span></Label>
              <Input type="number" min="0" step="0.01" value={f.purchasePrice} onChange={set("purchasePrice")} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label>Selling Price (NPR) <span className="text-destructive">*</span></Label>
              <Input type="number" min="0" step="0.01" value={f.sellingPrice} onChange={set("sellingPrice")} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label>VAT %</Label>
              <Input type="number" min="0" step="0.1" value={f.vatPercent} onChange={set("vatPercent")} placeholder="13" />
            </div>
            <div className="space-y-1.5">
              <Label>Storage Location</Label>
              <Input value={f.storageLocation} onChange={set("storageLocation")} placeholder="e.g. Shelf A-3" />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={f.categoryId} onChange={set("categoryId")}
              >
                <option value="">Select category (optional)</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Supplier</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={f.supplierId} onChange={set("supplierId")}
              >
                <option value="">Select supplier (optional)</option>
                {suppliers?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Adding..." : "Add Medicine"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
