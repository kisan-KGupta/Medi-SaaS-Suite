import { useState } from "react";
import { useRecordCustomerPayment, getListCustomersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/format";

interface Props {
  open: boolean;
  onClose: () => void;
  customerId: number;
  customerName: string;
  creditBalance: number;
}

export default function RecordPaymentDialog({ open, onClose, customerId, customerName, creditBalance }: Props) {
  const [amount, setAmount] = useState("");
  const record = useRecordCustomerPayment();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    if (amt > creditBalance) {
      toast({ title: `Amount exceeds due balance (${formatCurrency(creditBalance)})`, variant: "destructive" });
      return;
    }
    record.mutate({ id: customerId, data: { amount: amt } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
        toast({ title: `Payment of ${formatCurrency(amt)} recorded for ${customerName}` });
        setAmount("");
        onClose();
      },
      onError: (err: any) => toast({ title: "Failed to record payment", description: err?.data?.error ?? "Error", variant: "destructive" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-md bg-muted/50 px-4 py-3 text-sm">
            <div className="font-medium">{customerName}</div>
            <div className="text-muted-foreground mt-0.5">
              Outstanding due: <span className="font-semibold text-destructive">{formatCurrency(creditBalance)}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Payment Amount (NPR) <span className="text-destructive">*</span></Label>
            <Input
              type="number"
              min="1"
              step="0.01"
              max={creditBalance}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Enter amount"
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={record.isPending}>
              {record.isPending ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
