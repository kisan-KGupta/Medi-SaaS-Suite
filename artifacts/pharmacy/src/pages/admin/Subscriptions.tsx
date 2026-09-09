import { useQuery } from "@tanstack/react-query";
import { CreditCard, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function Subscriptions() {
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["/api/saas/subscriptions"],
    queryFn: async () => {
      const token = localStorage.getItem("pharmacy_token");
      const res = await fetch("/api/saas/subscriptions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch subscriptions");
      return res.json();
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" /> Active Subscriptions Audit
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View all pharmacy subscription statuses, renewal dates, and billing plans.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 font-semibold text-muted-foreground border-b border-border">
            <tr>
              <th className="p-3.5">Pharmacy Name</th>
              <th className="p-3.5">Plan Name</th>
              <th className="p-3.5">Monthly Price</th>
              <th className="p-3.5">Subscription Status</th>
              <th className="p-3.5">Start Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Loading subscriptions...
                </td>
              </tr>
            ) : subscriptions?.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No active subscriptions found.
                </td>
              </tr>
            ) : (
              subscriptions?.map((s: any) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5 font-bold text-foreground">{s.pharmacyName}</td>
                  <td className="p-3.5 font-medium">{s.planName}</td>
                  <td className="p-3.5 font-mono text-xs">${s.priceMonthly}/mo</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        s.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : s.status === "TRIAL"
                          ? "bg-sky-500/10 text-sky-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {s.status === "ACTIVE" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : s.status === "TRIAL" ? (
                        <Clock className="h-3 w-3" />
                      ) : (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-xs text-muted-foreground">
                    {new Date(s.startDate).toLocaleDateString()}
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
