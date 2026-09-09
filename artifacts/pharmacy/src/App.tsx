import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";

// Public Marketing Pages
import Home from "@/pages/public/Home";
import Features from "@/pages/public/Features";
import Pricing from "@/pages/public/Pricing";
import About from "@/pages/public/About";
import Contact from "@/pages/public/Contact";
import FAQ from "@/pages/public/FAQ";
import Onboarding from "@/pages/public/Onboarding";

// Auth & App Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Billing from "@/pages/Billing";
import Inventory from "@/pages/Inventory";
import Expiry from "@/pages/Expiry";
import Sales from "@/pages/Sales";
import Purchases from "@/pages/Purchases";
import Suppliers from "@/pages/Suppliers";
import Customers from "@/pages/Customers";
import Analytics from "@/pages/Analytics";

// Settings Pages
import PharmacySettings from "@/pages/settings/PharmacySettings";
import StaffManagement from "@/pages/settings/StaffManagement";
import RolesPermissions from "@/pages/settings/RolesPermissions";

// SaaS Super Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import Pharmacies from "@/pages/admin/Pharmacies";
import Plans from "@/pages/admin/Plans";
import Subscriptions from "@/pages/admin/Subscriptions";

import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <span className="text-sm font-medium text-muted-foreground">Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <AppLayout>
      <Component {...rest} />
    </AppLayout>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Marketing Site Routes */}
      <Route path="/" component={Home} />
      <Route path="/features" component={Features} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/faq" component={FAQ} />
      <Route path="/register" component={Onboarding} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/login" component={Login} />

      {/* Authenticated Pharmacy Application Routes */}
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/app">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/billing">
        <ProtectedRoute component={Billing} />
      </Route>
      <Route path="/inventory">
        <ProtectedRoute component={Inventory} />
      </Route>
      <Route path="/expiry">
        <ProtectedRoute component={Expiry} />
      </Route>
      <Route path="/sales">
        <ProtectedRoute component={Sales} />
      </Route>
      <Route path="/purchases">
        <ProtectedRoute component={Purchases} />
      </Route>
      <Route path="/suppliers">
        <ProtectedRoute component={Suppliers} />
      </Route>
      <Route path="/customers">
        <ProtectedRoute component={Customers} />
      </Route>
      <Route path="/analytics">
        <ProtectedRoute component={Analytics} />
      </Route>

      {/* Settings Routes */}
      <Route path="/settings/pharmacy">
        <ProtectedRoute component={PharmacySettings} />
      </Route>
      <Route path="/settings/staff">
        <ProtectedRoute component={StaffManagement} />
      </Route>
      <Route path="/settings/roles">
        <ProtectedRoute component={RolesPermissions} />
      </Route>

      {/* SaaS Super Admin Routes */}
      <Route path="/admin/dashboard">
        <ProtectedRoute component={AdminDashboard} />
      </Route>
      <Route path="/admin/pharmacies">
        <ProtectedRoute component={Pharmacies} />
      </Route>
      <Route path="/admin/plans">
        <ProtectedRoute component={Plans} />
      </Route>
      <Route path="/admin/subscriptions">
        <ProtectedRoute component={Subscriptions} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL ? import.meta.env.BASE_URL.replace(/\/$/, "") : ""}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
