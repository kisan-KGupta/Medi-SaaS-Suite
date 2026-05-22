import { useState } from "react";
import { useCreateSupplier, getListSuppliersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Props { open: boolean; onClose: () => void; }

const EMPTY = { name: "", contactPerson: "", phone: "", email: "", address: "" };

export default function AddSupplierDialog({ open, onClose }: Props) {
  const [f, setF] = useState(EMPTY);
  const create = useCreateSupplier();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) {
      toast({ title: "Supplier name is required", variant: "destructive" });
      return;
    }
    create.mutate({
      data: {
        name: f.name.trim(),
        contactPerson: f.contactPerson || undefined,
        phone: f.phone || undefined,
        email: f.email || undefined,
        address: f.address || undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSuppliersQueryKey() });
        toast({ title: "Supplier added successfully" });
        setF(EMPTY);
        onClose();
      },
      onError: (err: any) => toast({ title: "Failed to add supplier", description: err?.data?.error ?? "Error", variant: "destructive" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Supplier Name <span className="text-destructive">*</span></Label>
            <Input value={f.name} onChange={set("name")} placeholder="e.g. Himalayan Pharma Pvt. Ltd." autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>Contact Person</Label>
            <Input value={f.contactPerson} onChange={set("contactPerson")} placeholder="e.g. Ram Sharma" />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={f.phone} onChange={set("phone")} placeholder="e.g. 071-123456" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={f.email} onChange={set("email")} placeholder="e.g. supplier@email.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input value={f.address} onChange={set("address")} placeholder="e.g. New Road, Butwal" />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Adding..." : "Add Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
