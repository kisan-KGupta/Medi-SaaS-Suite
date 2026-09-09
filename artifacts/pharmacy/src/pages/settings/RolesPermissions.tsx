import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, Edit2, Trash2, Lock, CheckCircle2 } from "lucide-react";

const MODULE_GROUPS: Record<string, { label: string; perms: { key: string; name: string }[] }> = {
  dashboard: {
    label: "Dashboard",
    perms: [{ key: "dashboard.view", name: "View Analytics & Dashboard Summary" }],
  },
  medicines: {
    label: "Medicines",
    perms: [
      { key: "medicine.view", name: "View Medicines List" },
      { key: "medicine.create", name: "Add New Medicine" },
      { key: "medicine.update", name: "Edit Prices & Info" },
      { key: "medicine.delete", name: "Delete Medicine" },
    ],
  },
  inventory: {
    label: "Inventory & Expiry",
    perms: [
      { key: "inventory.view", name: "View Expiry & Stock Levels" },
      { key: "inventory.adjust", name: "Manual Stock Adjustment" },
    ],
  },
  sales: {
    label: "Sales & POS",
    perms: [
      { key: "sale.view", name: "View Sales History" },
      { key: "sale.create", name: "Process POS Sales Checkout" },
      { key: "sale.cancel", name: "Cancel Sales" },
      { key: "sale.return", name: "Process Customer Returns" },
    ],
  },
  purchases: {
    label: "Purchases",
    perms: [
      { key: "purchase.view", name: "View Purchase Orders" },
      { key: "purchase.create", name: "Log Supplier Invoices" },
    ],
  },
  customers: {
    label: "Customers",
    perms: [
      { key: "customer.view", name: "View Customers & Balances" },
      { key: "customer.create", name: "Create Customer Profile" },
      { key: "customer.update", name: "Edit Details & Record Credit Payments" },
    ],
  },
  suppliers: {
    label: "Suppliers",
    perms: [
      { key: "supplier.view", name: "View Suppliers" },
      { key: "supplier.create", name: "Create Supplier Profile" },
    ],
  },
  reports: {
    label: "Analytics & Reports",
    perms: [{ key: "report.view", name: "View Sales & Profit Charts" }],
  },
  staff: {
    label: "Staff Users",
    perms: [
      { key: "staff.view", name: "View Staff Members" },
      { key: "staff.create", name: "Add Staff User" },
      { key: "staff.update", name: "Edit Staff User" },
    ],
  },
  settings: {
    label: "Settings",
    perms: [
      { key: "settings.view", name: "View Pharmacy Settings" },
      { key: "settings.update", name: "Edit Store Profile" },
    ],
  },
  roles: {
    label: "Roles & Permissions",
    perms: [
      { key: "role.view", name: "View Roles" },
      { key: "role.create", name: "Create Custom Role" },
      { key: "role.update", name: "Edit Role Permissions" },
      { key: "role.delete", name: "Delete Custom Role" },
    ],
  },
};

export default function RolesPermissions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [openModal, setOpenModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Fetch Roles
  const { data: roles, isLoading } = useQuery({
    queryKey: ["/api/roles"],
    queryFn: async () => {
      const token = localStorage.getItem("pharmacy_token");
      const res = await fetch("/api/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch roles");
      return res.json();
    },
  });

  const saveRoleMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("pharmacy_token");
      const url = editingRole ? `/api/roles/${editingRole.id}` : "/api/roles";
      const method = editingRole ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: roleName,
          description,
          permissionKeys: selectedKeys,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save role");
      return data;
    },
    onSuccess: () => {
      toast({
        title: editingRole ? "Role Updated" : "Role Created",
        description: `Role permissions for "${roleName}" saved successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      closeModal();
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("pharmacy_token");
      const res = await fetch(`/api/roles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete role");
      }
    },
    onSuccess: () => {
      toast({ title: "Role Deleted", description: "Role removed successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Cannot Delete", description: err.message });
    },
  });

  const openCreateModal = () => {
    setEditingRole(null);
    setRoleName("");
    setDescription("");
    setSelectedKeys([
      "dashboard.view",
      "medicine.view",
      "sale.view",
      "sale.create",
      "customer.view",
    ]);
    setOpenModal(true);
  };

  const openEditModal = (role: any) => {
    setEditingRole(role);
    setRoleName(role.name);
    setDescription(role.description || "");
    setSelectedKeys(role.permissions || []);
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setEditingRole(null);
  };

  const togglePermission = (key: string) => {
    if (selectedKeys.includes(key)) {
      setSelectedKeys(selectedKeys.filter((k) => k !== key));
    } else {
      setSelectedKeys([...selectedKeys, key]);
    }
  };

  const toggleAllModule = (moduleKey: string) => {
    const keysInModule = MODULE_GROUPS[moduleKey].perms.map((p) => p.key);
    const allSelected = keysInModule.every((k) => selectedKeys.includes(k));

    if (allSelected) {
      setSelectedKeys(selectedKeys.filter((k) => !keysInModule.includes(k)));
    } else {
      const union = new Set([...selectedKeys, ...keysInModule]);
      setSelectedKeys(Array.from(union));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> Roles & Permissions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create custom staff roles and define granular, database-driven permission matrices.
          </p>
        </div>

        <Button onClick={openCreateModal} className="font-bold gap-2">
          <Plus className="h-4 w-4" /> Create Custom Role
        </Button>
      </div>

      {/* Roles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-3 text-center py-8 text-muted-foreground">
            Loading roles...
          </div>
        ) : (
          roles?.map((role: any) => (
            <div
              key={role.id}
              className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between space-y-4 hover:border-primary/50 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    {role.name}
                  </h3>
                  {role.isSystem ? (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> SYSTEM
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-500/20">
                      CUSTOM
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground min-h-[32px]">
                  {role.description || "Custom pharmacy staff role"}
                </p>

                <div className="pt-3 border-t border-border/60 text-xs font-semibold text-foreground flex justify-between">
                  <span>Assigned Permissions:</span>
                  <span className="text-primary font-bold">{role.permissions?.length ?? 0} keys</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(role)}
                  className="font-medium gap-1.5"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit Permissions
                </Button>

                {!role.isSystem && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteRoleMutation.mutate(role.id)}
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Role Creation / Editing */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? `Edit Role: ${editingRole.name}` : "Create New Custom Role"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Role Name</label>
                <Input
                  required
                  placeholder="e.g. Senior Cashier"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  disabled={editingRole?.isSystem}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Description</label>
                <Input
                  placeholder="Role responsibilities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Permission Matrix */}
            <div className="space-y-4 pt-2 border-t border-border">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-foreground">Module Permission Matrix</h4>
                <span className="text-xs text-muted-foreground">
                  Selected: <strong className="text-primary">{selectedKeys.length}</strong> permissions
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(MODULE_GROUPS).map(([modKey, modGroup]) => {
                  const keysInModule = modGroup.perms.map((p) => p.key);
                  const allSelected = keysInModule.every((k) => selectedKeys.includes(k));

                  return (
                    <div key={modKey} className="p-4 rounded-xl bg-card border border-border space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-border">
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                          {modGroup.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleAllModule(modKey)}
                          className="text-[11px] text-primary hover:underline font-semibold"
                        >
                          {allSelected ? "Deselect All" : "Select All"}
                        </button>
                      </div>

                      <div className="space-y-2">
                        {modGroup.perms.map((p) => {
                          const isChecked = selectedKeys.includes(p.key);
                          return (
                            <label
                              key={p.key}
                              className="flex items-start gap-2.5 cursor-pointer text-xs font-medium hover:text-primary transition-colors"
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => togglePermission(p.key)}
                                className="mt-0.5"
                              />
                              <span className={isChecked ? "text-foreground font-semibold" : "text-muted-foreground"}>
                                {p.name}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                onClick={() => saveRoleMutation.mutate()}
                disabled={saveRoleMutation.isPending || !roleName}
                className="font-bold gap-2"
              >
                <CheckCircle2 className="h-4 w-4" /> Save Role & Permissions
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
