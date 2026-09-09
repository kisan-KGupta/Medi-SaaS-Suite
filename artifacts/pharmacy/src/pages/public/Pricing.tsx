import { useState } from "react";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ArrowRight, Shield } from "lucide-react";

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(true);

  const plans = [
    {
      id: "starter",
      name: "Starter",
      description: "Ideal for small independent retail pharmacies getting started with digital POS.",
      priceMonthly: 29,
      priceYearly: 24,
      features: [
        "1 Pharmacy Location",
        "Up to 3 Staff Accounts",
        "Fast POS & Thermal Billing",
        "Medicine Inventory & Stock Counts",
        "Basic Expiry Alert System",
        "Customer & Supplier Directory",
        "Standard Email Support"
      ],
      popular: false
    },
    {
      id: "professional",
      name: "Professional",
      description: "Best for growing busy pharmacies requiring full staff control and analytics.",
      priceMonthly: 59,
      priceYearly: 49,
      features: [
        "1 Pharmacy Location",
        "Unlimited Staff Accounts",
        "Dynamic Roles & Granular RBAC",
        "Keyboard-First Fast POS Billing",
        "Advanced Expiry (30/60/90 Days)",
        "Purchase Invoice & Supplier Ledger",
        "Customer Credit Balance Tracking",
        "Real-Time Sales & Profit Analytics",
        "Priority Support (24/7)"
      ],
      popular: true
    },
    {
      id: "business",
      name: "Business / Enterprise",
      description: "For high-volume pharmacies and pharmacy chains needing custom governance.",
      priceMonthly: 99,
      priceYearly: 79,
      features: [
        "Multiple Pharmacy Locations Ready",
        "Unlimited Staff & Roles",
        "Custom Permission Matrix",
        "Dedicated Account Manager",
        "Custom Thermal Receipt Branding",
        "Database Backup & Export Access",
        "SaaS Super Admin SLA Guarantee",
        "Custom Feature Request Pipeline"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar />

      <section className="py-16 bg-muted/40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary">
            Simple & Transparent Pricing
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Choose the Perfect Plan for Your Pharmacy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            All plans include full tenant data isolation, cloud database hosting, and a 14-day free trial.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-6 flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isYearly ? "text-foreground font-bold" : "text-muted-foreground"}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-14 h-8 rounded-full bg-primary/20 p-1 transition-colors focus:outline-none"
            >
              <div
                className={`w-6 h-6 rounded-full bg-primary transition-transform ${
                  isYearly ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-sm font-medium flex items-center gap-1.5 ${isYearly ? "text-foreground font-bold" : "text-muted-foreground"}`}>
              Yearly Billing
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">
                Save 20%
              </span>
            </span>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => {
              const price = isYearly ? plan.priceYearly : plan.priceMonthly;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-8 bg-card border flex flex-col justify-between transition-all ${
                    plan.popular
                      ? "border-primary shadow-xl ring-2 ring-primary/20"
                      : "border-border shadow-sm hover:border-border/80"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold tracking-wide flex items-center gap-1 shadow-md">
                      <Sparkles className="h-3.5 w-3.5" /> MOST POPULAR
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground mt-2 min-h-[36px]">{plan.description}</p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-foreground">${price}</span>
                      <span className="text-sm text-muted-foreground">/ month</span>
                      {isYearly && <span className="text-xs text-emerald-600 font-semibold ml-2">billed annually</span>}
                    </div>

                    <div className="pt-4 border-t border-border space-y-3">
                      <div className="text-xs font-bold text-foreground uppercase tracking-wider">Features included:</div>
                      <ul className="space-y-2 text-xs">
                        {plan.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-2 text-foreground font-medium">
                            <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-8 mt-6">
                    <Link href={`/register?plan=${plan.id}`}>
                      <Button
                        size="lg"
                        className={`w-full font-bold gap-2 ${
                          plan.popular ? "shadow-lg shadow-primary/25" : ""
                        }`}
                        variant={plan.popular ? "default" : "outline"}
                      >
                        Choose {plan.name} <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 p-6 rounded-xl bg-card border border-border flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-foreground flex items-center gap-2 justify-center md:justify-start">
                <Shield className="h-5 w-5 text-primary" /> Dedicated Pharmacy Security & Backups
              </h4>
              <p className="text-xs text-muted-foreground">
                All subscriptions come with isolated tenant security, SSL encryption, daily automated database backups, and zero lock-in contracts.
              </p>
            </div>
            <Link href="/contact">
              <Button variant="ghost" className="font-semibold text-xs text-primary hover:text-primary">
                Need a Custom Quote? Contact Sales →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
