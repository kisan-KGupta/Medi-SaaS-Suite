import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Building, ShieldCheck, CreditCard, AlertTriangle, ArrowRight, Plus } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["/api/saas/dashboard"],
    queryFn: async () => {
      const token = localStorage.getItem("pharmacy_token");
      const res = await fetch("/api/saas/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch SaaS stats");
      return res.json();
    },
  });

  const { data: pharmacies } = useQuery({
    queryKey: ["/api/saas/pharmacies"],
    queryFn: async () => {
      const token = localStorage.getItem("pharmacy_token");
      const res = await fetch("/api/saas/pharmacies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 text-xs font-bold border border-rose-500/20 mb-1">
            <ShieldCheck className="h-3.5 w-3.5" /> PLATFORM SUPER ADMIN
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            SaaS Platform Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor registered pharmacies, active subscriptions, and platform health.
          </p>
        </div>

        <Link href="/admin/pharmacies">
          <Button className="font-bold gap-2">
            <Plus className="h-4 w-4" /> Onboard New Pharmacy
          </Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold">
            <span>Total Pharmacies</span>
            <Building className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-extrabold text-foreground">{stats?.totalPharmacies ?? 0}</div>
          <p className="text-xs text-muted-foreground">Registered on platform</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold">
            <span>Active Pharmacies</span>
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{stats?.activePharmacies ?? 0}</div>
          <p className="text-xs text-muted-foreground">Normal operating status</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold">
            <span>Suspended</span>
            <AlertTriangle className="h-5 w-5 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600">{stats?.suspendedPharmacies ?? 0}</div>
          <p className="text-xs text-muted-foreground">Blocked access</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold">
            <span>Active Subscriptions</span>
            <CreditCard className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-3xl font-extrabold text-foreground">{stats?.activeSubscriptions ?? 0}</div>
          <p className="text-xs text-muted-foreground">Trial & Paid accounts</p>
        </div>
      </div>

      {/* Recent Pharmacies Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm space-y-4 p-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-lg font-bold text-foreground">Recent Pharmacies</h3>
          <Link href="/admin/pharmacies">
            <span className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer">
              View All Pharmacies <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 font-semibold text-muted-foreground border-b border-border">
            <tr>
              <th className="p-3">Pharmacy Name</th>
              <th className="p-3">Admin Email</th>
              <th className="p-3">Plan</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {pharmacies?.slice(0, 5).map((p: any) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="p-3 font-bold text-foreground">{p.name}</td>
                <td className="p-3 text-muted-foreground text-xs font-mono">{p.adminEmail}</td>
                <td className="p-3 font-medium text-xs">{p.planName}</td>
                <td className="p-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      p.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-rose-500/10 text-rose-600"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
