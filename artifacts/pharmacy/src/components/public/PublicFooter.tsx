import { Link } from "wouter";
import { Stethoscope, Shield, CheckCircle2, Heart } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card/50 text-muted-foreground text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <Stethoscope className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">Medi-SaaS</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cloud-based Pharmacy Management & Multi-tenant POS Suite. Streamline billing, inventory, sales, staff roles, and analytics from anywhere.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <Shield className="h-4 w-4" /> Tenant Isolated & Secure
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/features"><span className="hover:text-primary cursor-pointer">Fast POS & Billing</span></Link></li>
              <li><Link href="/features"><span className="hover:text-primary cursor-pointer">Inventory & Expiry Alerts</span></Link></li>
              <li><Link href="/features"><span className="hover:text-primary cursor-pointer">Dynamic RBAC & Roles</span></Link></li>
              <li><Link href="/pricing"><span className="hover:text-primary cursor-pointer">Subscription Plans</span></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about"><span className="hover:text-primary cursor-pointer">About Us</span></Link></li>
              <li><Link href="/faq"><span className="hover:text-primary cursor-pointer">Frequently Asked Questions</span></Link></li>
              <li><Link href="/contact"><span className="hover:text-primary cursor-pointer">Contact & Support</span></Link></li>
              <li><Link href="/login"><span className="hover:text-primary cursor-pointer">Pharmacy Portal Login</span></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">SaaS Security</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Multi-Tenant Backend Isolation</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> PostgreSQL Database Hosting</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Automated Daily Backups</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Role-Based Access Control</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Medi-SaaS Suite. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> for modern pharmacies worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
