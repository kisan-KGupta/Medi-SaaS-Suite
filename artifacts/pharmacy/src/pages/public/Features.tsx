import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Package,
  AlertTriangle,
  Users,
  ShieldCheck,
  BarChart3,
  Receipt,
  Truck,
  UserCheck,
  Lock,
  ArrowRight
} from "lucide-react";

export default function Features() {
  const featureList = [
    {
      icon: Zap,
      title: "Keyboard-First POS Billing",
      description: "Designed for high-volume counter billing. Search medicines by name, generic formulation, or barcode. Instantly adjust quantities with [ENTER] key workflows.",
      details: ["Barcode scanner auto-detection", "Discount & VAT rate calculations", "Instant print-ready thermal bills", "Credit sale ledger integration"]
    },
    {
      icon: Package,
      title: "Inventory & Batch Control",
      description: "Complete visibility into your medicine inventory with real-time stock counting, reorder level alerts, and batch number tracking.",
      details: ["Real-time quantity updates", "Reorder level notifications", "Generic & Brand name classification", "Category management"]
    },
    {
      icon: AlertTriangle,
      title: "Expiry Alert System",
      description: "Prevent non-compliant sales and financial loss with multi-tier expiry monitoring grouped by 30, 60, and 90 days threshold alerts.",
      details: ["Automatic 30/60/90 day grouping", "Expired medicine quarantine alerts", "Batch number tracking", "Supplier return preparation"]
    },
    {
      icon: Lock,
      title: "Dynamic Roles & Permissions",
      description: "Configure dynamic database-driven staff roles without code changes. Assign granular permissions per module for complete staff authorization control.",
      details: ["System default roles (Admin, Pharmacist, Cashier)", "Custom role creation", "Granular CRUD permissions", "Backend security enforcement"]
    },
    {
      icon: Truck,
      title: "Purchase & Supplier Ledger",
      description: "Log incoming medicine shipments from suppliers, verify supplier invoice numbers, and auto-increment stock levels seamlessly.",
      details: ["Supplier contact directory", "Purchase order logging", "Stock auto-incrementation", "Invoice audit history"]
    },
    {
      icon: Users,
      title: "Customer & Credit Accounting",
      description: "Maintain customer profiles, purchase history, and credit balances. Record partial payments with receipt tracking.",
      details: ["Customer contact profiles", "Credit balance tracking", "Payment history ledger", "Outstanding balance alerts"]
    },
    {
      icon: BarChart3,
      title: "Analytics & Financial Reports",
      description: "Real-time dashboard reporting showing daily sales, estimated profit margins, top-selling medicines, and total inventory valuations.",
      details: ["30-day daily sales trend charts", "Top 10 fast-moving medicines", "Estimated profit calculations", "Inventory valuation metrics"]
    },
    {
      icon: ShieldCheck,
      title: "Multi-Tenant Cloud SaaS",
      description: "Your pharmacy operates in a dedicated, tenant-isolated cloud environment. Data is encrypted and isolated on managed PostgreSQL database infrastructure.",
      details: ["100% backend tenant isolation", "Zero cross-tenant data leak guarantee", "Daily automated cloud backups", "Browser access from any device"]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar />

      <section className="py-16 bg-muted/40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Enterprise Pharmacy Features
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover how Medi-SaaS simplifies retail and wholesale pharmacy operations with built-in speed, accuracy, and compliance.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {featureList.map((feat) => (
              <div key={feat.title} className="p-8 rounded-2xl bg-card border border-border shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <feat.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
                <div className="pt-2 border-t border-border/60">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-foreground">
                    {feat.details.map((item) => (
                      <li key={item} className="flex items-center gap-1.5 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl font-extrabold">Transform Your Pharmacy Operations Today</h2>
          <p className="text-primary-foreground/85 max-w-xl mx-auto">
            Experience the speed and efficiency of Medi-SaaS with a 14-day free trial.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="h-12 px-8 font-bold gap-2">
              Get Started Free <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
