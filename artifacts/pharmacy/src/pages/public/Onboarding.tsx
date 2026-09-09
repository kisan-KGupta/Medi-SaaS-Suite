import { useState } from "react";
import { Link, useLocation } from "wouter";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import {
  User,
  Building,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Stethoscope,
  ShieldCheck,
  Sparkles
} from "lucide-react";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const searchParams = new URLSearchParams(window.location.search);
  const initialPlan = searchParams.get("plan") || "professional";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    adminName: "",
    email: "",
    password: "",
    pharmacyName: "",
    address: "",
    phone: "",
    planId: initialPlan,
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setErrorMsg("");
    if (step === 1) {
      if (!formData.adminName || !formData.email || !formData.password) {
        setErrorMsg("Please fill in all account fields.");
        return;
      }
      if (formData.password.length < 6) {
        setErrorMsg("Password must be at least 6 characters.");
        return;
      }
    } else if (step === 2) {
      if (!formData.pharmacyName || !formData.phone) {
        setErrorMsg("Please enter your pharmacy name and phone number.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleRegister = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/public/register-pharmacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Automatically log in with received token
      if (data.token) {
        login(data.token);
        setStep(4);
      } else {
        setStep(4);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar />

      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Progress Bar Header */}
        <div className="mb-10 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> 14-Day Free Trial Onboarding
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
            Set Up Your Pharmacy Account
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete the 4 quick steps below to activate your pharmacy SaaS workspace.
          </p>

          {/* Stepper Steps */}
          <div className="pt-6 max-w-xl mx-auto flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />

            {[
              { num: 1, label: "Account", icon: User },
              { num: 2, label: "Pharmacy", icon: Building },
              { num: 3, label: "Plan", icon: CreditCard },
              { num: 4, label: "Complete", icon: CheckCircle2 },
            ].map((s) => {
              const isDone = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/20"
                        : "bg-card border border-border text-muted-foreground"
                    }`}
                  >
                    <s.icon className="h-4 w-4" />
                  </div>
                  <span className={`text-xs mt-2 font-medium ${isCurrent ? "text-primary font-bold" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container Card */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-lg">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-600">
              {errorMsg}
            </div>
          )}

          {/* Step 1: Account Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground">Step 1: Admin Account Details</h3>
                <p className="text-xs text-muted-foreground">This will be your primary administrator account for managing staff and pharmacy settings.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground">Full Name</label>
                  <Input
                    required
                    placeholder="e.g. Dr. Sanjay Sharma"
                    value={formData.adminName}
                    onChange={(e) => handleChange("adminName", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Email Address (Username)</label>
                  <Input
                    required
                    type="email"
                    placeholder="sanjay@pharmacy.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Password</label>
                  <Input
                    required
                    type="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={handleNext} className="font-bold gap-2">
                  Continue to Pharmacy Setup <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Pharmacy Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground">Step 2: Pharmacy Information</h3>
                <p className="text-xs text-muted-foreground">Enter your pharmacy store information for sales invoice receipts.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground">Pharmacy / Store Name</label>
                  <Input
                    required
                    placeholder="e.g. Sanjay Medical Pharmacy"
                    value={formData.pharmacyName}
                    onChange={(e) => handleChange("pharmacyName", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Address</label>
                  <Input
                    placeholder="Horizon Chowk, Butwal, Nepal"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Phone Number</label>
                  <Input
                    required
                    placeholder="+977 9800000000"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={handleNext} className="font-bold gap-2">
                  Select Subscription Plan <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Choose Plan */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground">Step 3: Select Your Subscription Plan</h3>
                <p className="text-xs text-muted-foreground">Select a plan for your 14-day trial. You can change plans anytime.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "starter", name: "Starter", price: "$24/mo", desc: "Small retail pharmacy" },
                  { id: "professional", name: "Professional", price: "$49/mo", desc: "Busy pharmacy + full RBAC" },
                  { id: "business", name: "Business", price: "$79/mo", desc: "Multi-location & enterprise" },
                ].map((plan) => {
                  const isSelected = formData.planId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => handleChange("planId", plan.id)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                          : "border-border bg-card hover:border-border/80"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-foreground text-sm">{plan.name}</h4>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="text-xl font-extrabold text-foreground mt-2">{plan.price}</div>
                      <div className="text-xs text-muted-foreground mt-1">{plan.desc}</div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={handleRegister} disabled={loading} className="font-bold gap-2 shadow-lg shadow-primary/30">
                  {loading ? "Activating Pharmacy..." : "Create My Pharmacy & Start Trial"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Completion & Direct Access */}
          {step === 4 && (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-foreground">Pharmacy Setup Complete!</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Welcome to Medi-SaaS, <strong>{formData.pharmacyName}</strong>! Your 14-day trial has been activated.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground inline-block">
                <div className="flex items-center gap-2 justify-center font-medium">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" /> Dedicated Tenant ID Provisioned & Secured
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <Button
                  size="lg"
                  onClick={() => setLocation("/dashboard")}
                  className="font-bold px-8 gap-2 shadow-lg shadow-primary/30"
                >
                  Enter Pharmacy Application <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
