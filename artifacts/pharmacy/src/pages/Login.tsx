import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Stethoscope, ShieldCheck, TrendingUp, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [_, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({ data }, {
      onSuccess: (response) => {
        login(response.token);
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: err?.data?.error ?? "Please check your credentials.",
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between p-12"
        style={{ background: "linear-gradient(145deg, hsl(173,75%,28%) 0%, hsl(190,80%,20%) 100%)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Sanjay Medical</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
            Pharmacy<br />Management<br />Made Simple
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-sm">
            Manage inventory, billing, purchases, and analytics — all in one place for your pharmacy in Butwal.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { icon: Package, label: "Inventory", desc: "Track stock" },
              { icon: TrendingUp, label: "Analytics", desc: "Live reports" },
              { icon: ShieldCheck, label: "Billing", desc: "Fast POS" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <Icon className="w-5 h-5 text-white/80 mb-2" />
                <div className="text-white text-sm font-semibold">{label}</div>
                <div className="text-white/60 text-xs">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-white/40 text-sm">
          Horizon Chowk, Butwal, Rupandehi, Nepal
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary">
              <Stethoscope className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-primary font-bold text-xl">Sanjay Medical</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to your workspace to continue</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter username"
                        className="h-11 bg-card border-border focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        className="h-11 bg-card border-border focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold mt-2 shadow-md"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>

          <div className="rounded-xl border bg-card p-4 text-xs text-muted-foreground space-y-2">
            <div className="font-semibold text-foreground/60 uppercase tracking-wider text-[10px]">Demo credentials</div>
            <div className="flex items-center justify-between">
              <span>Admin</span>
              <span className="font-mono bg-muted px-2 py-0.5 rounded text-foreground">admin / admin123</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Cashier</span>
              <span className="font-mono bg-muted px-2 py-0.5 rounded text-foreground">cashier / cashier123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
