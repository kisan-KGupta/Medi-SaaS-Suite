import { Link, useLocation } from "wouter";
import { useGetDashboardSummary } from "@workspace/api-client-react";
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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { data: summary } = useGetDashboardSummary();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Billing (POS)", href: "/billing", icon: ShoppingCart },
    { name: "Inventory", href: "/inventory", icon: Package },
    {
      name: "Expiry",
      href: "/expiry",
      icon: AlertTriangle,
      badge: summary?.expiringCount ? summary.expiringCount : null,
      badgeColor: "bg-amber-500",
    },
    { name: "Sales", href: "/sales", icon: History },
    { name: "Purchases", href: "/purchases", icon: Truck },
    { name: "Suppliers", href: "/suppliers", icon: Users },
    { name: "Customers", href: "/customers", icon: UsersRound },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-card transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight text-primary">
              Sanjay Medical
            </span>
          </div>
          <button
            className="rounded-md p-1 text-muted-foreground hover:bg-muted lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive =
                location === item.href ||
                (location === "/" && item.href === "/dashboard");
              return (
                <Link key={item.name} href={item.href} onClick={onClose}>
                  <div
                    className={cn(
                      "flex cursor-pointer items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span className="flex-1">{item.name}</span>
                    {item.badge ? (
                      <Badge
                        variant="secondary"
                        className={cn("ml-auto text-white", item.badgeColor)}
                      >
                        {item.badge}
                      </Badge>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
