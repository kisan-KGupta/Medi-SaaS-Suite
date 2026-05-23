import { useAuth } from "@/lib/auth";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Menu, ChevronDown } from "lucide-react";
import { useLocation } from "wouter";

const PAGE_NAMES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/billing": "Billing / POS",
  "/inventory": "Medicines",
  "/expiry": "Expiry Alerts",
  "/sales": "Sales History",
  "/purchases": "Purchases",
  "/suppliers": "Suppliers",
  "/customers": "Customers",
  "/analytics": "Analytics",
};

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: user } = useGetMe();
  const { logout } = useAuth();
  const logoutMutation = useLogout();
  const [location] = useLocation();

  const pageName = PAGE_NAMES[location] ?? "Sanjay Medical";

  const today = new Date().toLocaleDateString("en-NP", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => logout(),
      onError: () => logout(),
    });
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b bg-card/95 backdrop-blur-sm px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden lg:block">
          <h2 className="text-base font-semibold text-foreground leading-none">{pageName}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{today}</p>
        </div>
        <h2 className="text-base font-semibold text-foreground lg:hidden">{pageName}</h2>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 h-9 px-2.5 rounded-lg hover:bg-muted">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
              {initials}
            </div>
            <span className="hidden sm:inline text-sm font-medium">{user?.name || "User"}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="font-normal">
            <div className="text-sm font-semibold">{user?.name}</div>
            <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
