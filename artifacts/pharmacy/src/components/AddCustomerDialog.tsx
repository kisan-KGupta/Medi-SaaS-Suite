import { useState } from "react";
import { useCreateCustomer, getListCustomersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Props { open: boolean; onClose: () => void; }

const EMPTY = { name: "", phone: "", email: "", address: "" };

export default function AddCustomerDialog({ open, onClose }: Props) {
  const [f, setF] = useState(EMPTY);
  const create = useCreateCustomer();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) {
      toast({ title: "Customer name is required", variant: "destructive" });
      return;
    }
    create.mutate({
      data: {
        name: f.name.trim(),
        phone: f.phone || undefined,
        email: f.email || undefined,
        address: f.address || undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
        toast({ title: "Customer added successfully" });
        setF(EMPTY);
        onClose();
      },
      onError: (err: any) => toast({ title: "Failed to add customer", description: err?.data?.error ?? "Error", variant: "destructive" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Customer Name <span className="text-destructive">*</span></Label>
            <Input value={f.name} onChange={set("name")} placeholder="e.g. Sita Tharu" autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={f.phone} onChange={set("phone")} placeholder="e.g. 9800000000" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={f.email} onChange={set("email")} placeholder="Optional" />
          </div>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input value={f.address} onChange={set("address")} placeholder="e.g. Butwal-10, Rupandehi" />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Adding..." : "Add Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
