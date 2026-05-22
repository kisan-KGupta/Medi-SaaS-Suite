import { useAuth } from "@/lib/auth";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const { data: user } = useGetMe();
  const { logout } = useAuth();
  const logoutMutation = useLogout();
  const { toast } = useToast();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        logout();
      },
      onError: () => {
        // Even if server fails, clear local state
        logout();
      }
    });
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex-1">
        {/* Breadcrumbs or page title could go here */}
      </div>
      
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{user?.name || 'User'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
