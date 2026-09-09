import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Zap,
  ShieldCheck,
  Package,
  Users,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Stethoscope,
  Clock,
  Key,
  Layers,
  Sparkles
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Next-Gen Cloud Pharmacy SaaS
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Modern Pharmacy Management, <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">Simplified.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Empower your pharmacy with lightning-fast keyboard-first POS billing, automatic inventory batch expiry alerts, granular staff permissions, and real-time cloud analytics.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold gap-2 shadow-lg shadow-primary/25">
                  Start 14-Day Free Trial <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base font-medium">
                  View Pricing Plans
                </Button>
              </Link>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> Setup in under 2 minutes</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> Isolated tenant security</span>
            </div>
          </div>

          {/* Interactive POS Product Preview Card */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-border/80 bg-card p-3 sm:p-5 shadow-2xl shadow-primary/10">
            <div className="rounded-xl border border-border bg-background/50 overflow-hidden">
              <div className="bg-muted px-4 py-3 border-b border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-semibold text-foreground">Medi-SaaS POS — Billing Dashboard</span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold text-[10px]">POS ACTIVE</span>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div className="p-4 rounded-lg bg-card border border-border space-y-3">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-muted-foreground">Medicine Search (Keyboard First)</span>
                      <span className="text-primary font-mono">Press [ENTER] to add</span>
                    </div>
                    <div className="p-3 rounded-md bg-muted/60 border border-input flex items-center justify-between text-sm font-medium">
                      <span>Paracetamol 500mg (Batch #PAR-2026-09)</span>
                      <span className="text-emerald-600 font-bold">$12.50</span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-muted/50 font-semibold text-muted-foreground border-b border-border">
                        <tr>
                          <th className="p-2.5">Item</th>
                          <th className="p-2.5">Qty</th>
                          <th className="p-2.5">Price</th>
                          <th className="p-2.5 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50 font-medium">
                        <tr>
                          <td className="p-2.5 font-semibold">Amoxicillin 250mg Capsule</td>
                          <td className="p-2.5">2</td>
                          <td className="p-2.5">$18.00</td>
                          <td className="p-2.5 text-right font-bold">$36.00</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-semibold">Cetirizine 10mg Tablets</td>
                          <td className="p-2.5">1</td>
                          <td className="p-2.5">$8.50</td>
                          <td className="p-2.5 text-right font-bold">$8.50</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-3">
                    <div className="text-xs font-semibold text-muted-foreground">Order Summary</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold">$44.50</span></div>
                      <div className="flex justify-between"><span>VAT (13%)</span><span className="font-semibold">$5.78</span></div>
                      <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-primary/20">
                        <span>Total Due</span>
                        <span>$50.28</span>
                      </div>
                    </div>
                    <Button className="w-full font-bold shadow-md shadow-primary/20">
                      Complete Checkout [Enter]
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Overview */}
      <section className="py-16 sm:py-24 bg-card/40 border-y border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything Your Pharmacy Needs to Thrive
            </h2>
            <p className="text-muted-foreground text-base">
              Built specifically for modern retail and wholesale pharmacies, with zero compromise on security or billing speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm space-y-4 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Keyboard-First POS Billing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Scan barcodes, search generic & brand names, adjust quantity, and complete cash or credit checkout in seconds without touching the mouse.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm space-y-4 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Batch & Expiry Management</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Never sell an expired medicine. Automated 30/60/90-day expiry alert thresholds keep stock compliant and prevent inventory loss.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm space-y-4 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Key className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Dynamic RBAC & Roles</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Create custom staff roles (Pharmacist, Cashier, Inventory Manager) with granular permissions for sales, purchases, medicine deletion, and reports.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm space-y-4 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Inventory & Purchase Tracking</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Log purchases from suppliers with invoice tracking. Automatic stock increments when receiving shipments and auto-decrement on sales.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm space-y-4 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Customer & Credit Ledgers</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Track customer purchase history and credit balances. Record partial or full credit payments with invoice generation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm space-y-4 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Multi-Tenant Cloud Security</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Strict backend tenant isolation ensures your pharmacy data, invoices, and sales reports remain 100% private and inaccessible to other pharmacies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-muted-foreground text-base">
              No software installations or complex server setups required. Access your pharmacy from any browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center shadow-lg shadow-primary/20">
                1
              </div>
              <h3 className="text-lg font-bold text-foreground">Create Your Pharmacy</h3>
              <p className="text-sm text-muted-foreground">
                Sign up with your store name, contact email, and address in less than 60 seconds.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center shadow-lg shadow-primary/20">
                2
              </div>
              <h3 className="text-lg font-bold text-foreground">Set Up Staff & Roles</h3>
              <p className="text-sm text-muted-foreground">
                Assign default roles (Pharmacy Admin, Pharmacist, Cashier) or define custom permission matrices.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center shadow-lg shadow-primary/20">
                3
              </div>
              <h3 className="text-lg font-bold text-foreground">Start Billing & Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Add your medicine stock, scan barcodes, and generate sales invoices effortlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Upgrade Your Pharmacy Operations?
          </h2>
          <p className="text-primary-foreground/85 text-base sm:text-lg max-w-2xl mx-auto">
            Join hundreds of pharmacy owners who trust Medi-SaaS for fast billing, inventory compliance, and multi-staff control.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="h-12 px-8 text-base font-bold gap-2">
                Start Free Trial Now <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
