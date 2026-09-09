import { Link, useLocation } from "wouter";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { useGetMe } from "@workspace/api-client-react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  AlertTriangle,
  History,
  Truck,
  Users,
  UsersRound,
  BarChart3,
  Stethoscope,
  Building,
  Shield,
  UserPlus,
  Crown,
  CreditCard,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { data: summary } = useGetDashboardSummary();
  const { data: user } = useGetMe();

  const isSuperAdmin = Boolean(user && (user as any).isSuperAdmin);
  const pharmacyName = (user as any)?.pharmacyName || "Sanjay Medical";
  const alertCount = (summary?.expiringCount ?? 0) + (summary?.expiredCount ?? 0);

  const navGroups = [
    {
      label: "Main",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Billing / POS", href: "/billing", icon: ShoppingCart },
      ],
    },
    {
      label: "Inventory",
      items: [
        { name: "Medicines", href: "/inventory", icon: Package },
        { name: "Expiry Alerts", href: "/expiry", icon: AlertTriangle, alertKey: "expiring" as const },
      ],
    },
    {
      label: "Transactions",
      items: [
        { name: "Sales History", href: "/sales", icon: History },
        { name: "Purchases", href: "/purchases", icon: Truck },
      ],
    },
    {
      label: "People",
      items: [
        { name: "Suppliers", href: "/suppliers", icon: Users },
        { name: "Customers", href: "/customers", icon: UsersRound },
      ],
    },
    {
      label: "Reports",
      items: [
        { name: "Analytics", href: "/analytics", icon: BarChart3 },
      ],
    },
    {
      label: "Settings",
      items: [
        { name: "Pharmacy Store", href: "/settings/pharmacy", icon: Building },
        { name: "Staff & Users", href: "/settings/staff", icon: UserPlus },
        { name: "Roles & Permissions", href: "/settings/roles", icon: Shield },
      ],
    },
  ];

  if (isSuperAdmin) {
    navGroups.unshift({
      label: "SaaS Super Admin",
      items: [
        { name: "Platform Overview", href: "/admin/dashboard", icon: Crown },
        { name: "Pharmacies", href: "/admin/pharmacies", icon: Building },
        { name: "Plans", href: "/admin/plans", icon: CreditCard },
        { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
      ],
    });
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col transition-transform duration-300 ease-in-out",
          "bg-[hsl(var(--sidebar))]",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/20">
              <Stethoscope className="h-4 w-4 text-primary" />
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold tracking-tight text-white leading-none truncate">
                {pharmacyName}
              </div>
              <div className="text-[10px] text-[hsl(var(--sidebar-foreground))]/50 leading-none mt-0.5">
                {isSuperAdmin ? "Super Admin Portal" : "Medi-SaaS Workspace"}
              </div>
            </div>
          </div>
          <button
            className="rounded-lg p-1.5 text-[hsl(var(--sidebar-foreground))]/50 hover:text-white hover:bg-white/10 lg:hidden transition-colors"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--sidebar-foreground))]/35 select-none">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location === item.href;
                  const badge = item.alertKey === "expiring" && alertCount > 0 ? alertCount : null;
                  return (
                    <Link key={item.name} href={item.href} onClick={onClose}>
                      <div
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                          isActive
                            ? "bg-primary/20 text-primary shadow-sm"
                            : "text-[hsl(var(--sidebar-foreground))]/70 hover:bg-white/8 hover:text-white"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-primary" : "text-[hsl(var(--sidebar-foreground))]/50"
                          )}
                        />
                        <span className="flex-1 leading-none">{item.name}</span>
                        {badge && (
                          <span className="min-w-[20px] h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center px-1.5">
                            {badge}
                          </span>
                        )}
                        {isActive && (
                          <div className="w-1 h-1 rounded-full bg-primary" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom footer */}
        <div className="px-5 py-4 border-t border-[hsl(var(--sidebar-border))] flex items-center justify-between">
          <div className="text-[10px] text-[hsl(var(--sidebar-foreground))]/40">
            Medi-SaaS Multi-Tenant Cloud
          </div>
          <Link href="/">
            <span className="text-[10px] font-semibold text-primary hover:underline cursor-pointer">
              Public Site →
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}
