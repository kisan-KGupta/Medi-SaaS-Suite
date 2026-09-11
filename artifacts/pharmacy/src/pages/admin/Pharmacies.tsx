import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Building, Plus, ShieldCheck, AlertTriangle, CheckCircle, Search, Edit3, Image as ImageIcon } from "lucide-react";

export default function Pharmacies() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [editingPharmacy, setEditingPharmacy] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    logo: "",
    address: "",
    phone: "",
    email: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    planId: "professional",
  });

  const [editForm, setEditForm] = useState({
    id: 0,
    name: "",
    logo: "",
    address: "",
    phone: "",
    email: "",
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
      setForm({ name: "", logo: "", address: "", phone: "", email: "", adminName: "", adminEmail: "", adminPassword: "", planId: "professional" });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  const editPharmacyMutation = useMutation({
    mutationFn: async (data: typeof editForm) => {
      const token = localStorage.getItem("pharmacy_token");
      const res = await fetch(`/api/saas/pharmacies/${data.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          logo: data.logo,
          address: data.address,
          phone: data.phone,
          email: data.email,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update pharmacy");
      return result;
    },
    onSuccess: () => {
      toast({ title: "Pharmacy Updated", description: "Pharmacy details and logo updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/saas/pharmacies"] });
      setEditingPharmacy(null);
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

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editPharmacyMutation.mutate(editForm);
  };

  const openEditModal = (p: any) => {
    setEditForm({
      id: p.id,
      name: p.name || "",
      logo: p.logo || "",
      address: p.address || "",
      phone: p.phone || "",
      email: p.email || "",
    });
    setEditingPharmacy(p);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" /> Pharmacy Tenants Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage registered pharmacies, onboard new stores, update store logos, and toggle active/suspended status.
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

              <div>
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Pharmacy Logo URL</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Direct image link or data URL</span>
                </label>
                <Input
                  placeholder="https://example.com/logo.png"
                  value={form.logo}
                  onChange={(e) => setForm({ ...form, logo: e.target.value })}
                  className="mt-1 font-mono text-xs"
                />
                {form.logo && (
                  <div className="mt-2 flex items-center gap-2 p-2 border border-border rounded-lg bg-muted/40">
                    <img
                      src={form.logo}
                      alt="Logo preview"
                      className="h-9 w-9 object-contain rounded border border-border bg-white"
                      onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                    />
                    <span className="text-xs text-muted-foreground">Logo Preview</span>
                  </div>
                )}
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

      {/* Edit Pharmacy Modal */}
      <Dialog open={!!editingPharmacy} onOpenChange={(open) => !open && setEditingPharmacy(null)}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pharmacy Details</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground">Pharmacy Name</label>
              <Input
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Pharmacy Logo URL</span>
                <span className="text-[10px] text-muted-foreground font-normal">Direct image link or data URL</span>
              </label>
              <Input
                placeholder="https://example.com/logo.png"
                value={editForm.logo}
                onChange={(e) => setEditForm({ ...editForm, logo: e.target.value })}
                className="mt-1 font-mono text-xs"
              />
              {editForm.logo ? (
                <div className="mt-2 flex items-center gap-2 p-2 border border-border rounded-lg bg-muted/40">
                  <img
                    src={editForm.logo}
                    alt="Logo preview"
                    className="h-10 w-10 object-contain rounded border border-border bg-white"
                    onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                  />
                  <span className="text-xs text-muted-foreground">Logo Preview</span>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground mt-1">No logo set. A building icon will be used as default.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Phone</label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Address</label>
                <Input
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Pharmacy Email</label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingPharmacy(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editPharmacyMutation.isPending} className="font-bold">
                {editPharmacyMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
              <th className="p-3.5">Pharmacy</th>
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
                    <div className="flex items-center gap-3">
                      {p.logo ? (
                        <img
                          src={p.logo}
                          alt={p.name}
                          className="h-9 w-9 rounded-lg object-contain border border-border bg-white shadow-xs"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          <Building className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-foreground text-sm">{p.name}</div>
                        <div className="text-xs text-muted-foreground font-normal">{p.address || "No address"}</div>
                      </div>
                    </div>
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
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(p)}
                        className="h-8 px-2 text-xs gap-1 font-semibold text-muted-foreground hover:text-foreground"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </Button>
                      {p.status === "ACTIVE" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({ id: p.id, status: "SUSPENDED" })}
                          className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 text-xs font-semibold"
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({ id: p.id, status: "ACTIVE" })}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 text-xs font-semibold"
                        >
                          Activate
                        </Button>
                      )}
                    </div>
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
