import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CreditCard, Check, Sparkles } from "lucide-react";

export default function Plans() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ["/api/saas/plans"],
    queryFn: async () => {
      const token = localStorage.getItem("pharmacy_token");
      const res = await fetch("/api/saas/plans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch plans");
      return res.json();
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" /> Subscription Plans Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure pricing tiers and features for pharmacy subscribers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-3 text-center py-8 text-muted-foreground">Loading plans...</div>
        ) : (
          plans?.map((plan: any) => (
            <div key={plan.id} className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {plan.id}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{plan.description}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-foreground">${plan.priceMonthly}</span>
                <span className="text-xs text-muted-foreground">/ month</span>
                <span className="text-xs text-emerald-600 font-semibold ml-2">(${plan.priceYearly}/yr)</span>
              </div>

              <div className="pt-3 border-t border-border space-y-2 text-xs">
                <div className="font-bold text-foreground uppercase tracking-wider">Features</div>
                <ul className="space-y-1">
                  {plan.features?.map((f: string) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
