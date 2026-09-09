import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Shield, CheckCircle, XCircle } from "lucide-react";

export default function StaffManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    roleId: "",
  });

  // Fetch Users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const token = localStorage.getItem("pharmacy_token");
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch staff");
      return res.json();
    },
  });

  // Fetch Roles
  const { data: roles } = useQuery({
    queryKey: ["/api/roles"],
    queryFn: async () => {
      const token = localStorage.getItem("pharmacy_token");
      const res = await fetch("/api/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof form) => {
      const token = localStorage.getItem("pharmacy_token");
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      return data;
    },
    onSuccess: () => {
      toast({ title: "Staff Created", description: "New staff user added successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setOpenModal(false);
      setForm({ name: "", username: "", password: "", roleId: "" });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.password) return;
    createUserMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Users & Staff Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage pharmacy staff accounts and assign dynamic roles.
          </p>
        </div>

        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogTrigger asChild>
            <Button className="font-bold gap-2">
              <UserPlus className="h-4 w-4" /> Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-foreground">Full Name</label>
                <Input
                  required
                  placeholder="e.g. Anish Giri"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Username / Email</label>
                <Input
                  required
                  placeholder="anish@pharmacy.com"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Password</label>
                <Input
                  required
                  type="password"
                  placeholder="Temporary password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Assigned Role</label>
                <select
                  value={form.roleId}
                  onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a Role...</option>
                  {roles?.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending} className="font-bold">
                  {createUserMutation.isPending ? "Adding..." : "Add Staff"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Staff Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 font-semibold text-muted-foreground border-b border-border">
            <tr>
              <th className="p-3.5">Staff Name</th>
              <th className="p-3.5">Username</th>
              <th className="p-3.5">Assigned Role</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {usersLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Loading staff accounts...
                </td>
              </tr>
            ) : users?.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No staff members created yet.
                </td>
              </tr>
            ) : (
              users?.map((u: any) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5 font-bold text-foreground">{u.name}</td>
                  <td className="p-3.5 text-muted-foreground font-mono text-xs">{u.username}</td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      <Shield className="h-3 w-3" /> {u.roleName || "Staff"}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
                      <CheckCircle className="h-3 w-3" /> ACTIVE
                    </span>
                  </td>
                  <td className="p-3.5 text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
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
