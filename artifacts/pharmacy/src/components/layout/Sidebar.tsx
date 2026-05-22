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
  Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
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
      badgeColor: "bg-amber-500"
    },
    { name: "Sales", href: "/sales", icon: History },
    { name: "Purchases", href: "/purchases", icon: Truck },
    { name: "Suppliers", href: "/suppliers", icon: Users },
    { name: "Customers", href: "/customers", icon: UsersRound },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  return (
    <div className="w-64 border-r bg-card flex flex-col h-screen fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b">
        <Stethoscope className="w-6 h-6 text-primary mr-2" />
        <span className="font-bold text-lg text-primary tracking-tight">Sanjay Medical</span>
      </div>
      
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-md cursor-pointer transition-colors text-sm font-medium",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 mr-3", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span className="flex-1">{item.name}</span>
                  {item.badge ? (
                    <Badge variant="secondary" className={cn("ml-auto", item.badgeColor, "text-white")}>
                      {item.badge}
                    </Badge>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
