import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Building, Plus, ShieldCheck, AlertTriangle, CheckCircle, Search } from "lucide-react";

export default function Pharmacies() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    planId: "professional",
  });

  // Fetch Pharmacies
  const { data: pharmacies, isLoading } = useQuery({
    queryKey: ["/api/saas/pharmacies"],
    queryFn: async () => {
      const token = localStorage.getItem("pharmacy_token");
      const res = await fetch("/api/saas/pharmacies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch pharmacies");
      return res.json();
    },
  });

  const createPharmacyMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const token = localStorage.getItem("pharmacy_token");
      const res = await fetch("/api/saas/pharmacies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to onboard pharmacy");
      return result;
    },
    onSuccess: () => {
      toast({ title: "Pharmacy Onboarded", description: "New pharmacy and admin user created." });
      queryClient.invalidateQueries({ queryKey: ["/api/saas/pharmacies"] });
      setOpenModal(false);
      setForm({ name: "", address: "", phone: "", email: "", adminName: "", adminEmail: "", adminPassword: "", planId: "professional" });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const token = localStorage.getItem("pharmacy_token");
      const res = await fetch(`/api/saas/pharmacies/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({ title: "Status Updated", description: `Pharmacy status set to ${variables.status}.` });
      queryClient.invalidateQueries({ queryKey: ["/api/saas/pharmacies"] });
    },
  });

  const filtered = pharmacies?.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.adminEmail?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPharmacyMutation.mutate(form);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" /> Pharmacy Tenants Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage registered pharmacies, onboard new stores, and toggle active/suspended status.
          </p>
        </div>

        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogTrigger asChild>
            <Button className="font-bold gap-2">
              <Plus className="h-4 w-4" /> Create / Onboard Pharmacy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Onboard New Pharmacy</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-foreground">Pharmacy Name</label>
                <Input
                  required
                  placeholder="City Care Pharmacy"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Phone</label>
                  <Input
                    placeholder="+977-9800000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Address</label>
                  <Input
                    placeholder="Kathmandu"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border space-y-3">
                <div className="text-xs font-bold text-foreground uppercase tracking-wider">Pharmacy Admin User</div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Admin Full Name</label>
                  <Input
                    required
                    placeholder="Dr. Rajesh Kumar"
                    value={form.adminName}
                    onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Admin Email (Login Username)</label>
                  <Input
                    required
                    type="email"
                    placeholder="rajesh@pharmacy.com"
                    value={form.adminEmail}
                    onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Temporary Password</label>
                  <Input
                    required
                    type="password"
                    placeholder="Set temporary password"
                    value={form.adminPassword}
                    onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPharmacyMutation.isPending} className="font-bold">
                  {createPharmacyMutation.isPending ? "Onboarding..." : "Create Pharmacy"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Bar */}
      <div className="max-w-sm relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search pharmacy by name or admin..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Pharmacies Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 font-semibold text-muted-foreground border-b border-border">
            <tr>
              <th className="p-3.5">Pharmacy Name</th>
              <th className="p-3.5">Admin Username</th>
              <th className="p-3.5">Plan</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Created</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  Loading pharmacy tenants...
                </td>
              </tr>
            ) : filtered?.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No pharmacies found.
                </td>
              </tr>
            ) : (
              filtered?.map((p: any) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5 font-bold text-foreground">
                    <div>{p.name}</div>
                    <div className="text-xs text-muted-foreground font-normal">{p.address || "No address"}</div>
                  </td>
                  <td className="p-3.5 text-muted-foreground font-mono text-xs">{p.adminEmail}</td>
                  <td className="p-3.5 font-medium">{p.planName}</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        p.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-rose-500/10 text-rose-600"
                      }`}
                    >
                      {p.status === "ACTIVE" ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-xs text-muted-foreground">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-right">
                    {p.status === "ACTIVE" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatusMutation.mutate({ id: p.id, status: "SUSPENDED" })}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 text-xs font-semibold"
                      >
                        Suspend Access
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatusMutation.mutate({ id: p.id, status: "ACTIVE" })}
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 text-xs font-semibold"
                      >
                        Activate Pharmacy
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
