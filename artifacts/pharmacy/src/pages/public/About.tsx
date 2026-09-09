import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Stethoscope, ShieldCheck, Heart, Award, ArrowRight } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar />

      <section className="py-16 bg-muted/40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Empowering Modern Pharmacies Everywhere
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Medi-SaaS was engineered from the ground up to solve real-world pharmacy challenges: speed at the checkout counter, batch compliance, and multi-staff security.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Our Mission</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pharmacies are the healthcare frontline of every community. Yet many pharmacy owners remain trapped in legacy offline point-of-sale systems that lack multi-user permission controls, batch tracking, or cloud access.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our mission is to deliver a secure, accessible, cloud-native Pharmacy SaaS platform that combines keyboard-first speed with enterprise tenant security.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-card border border-border shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground">Tenant Isolated Security</h4>
                  <p className="text-xs text-muted-foreground">Enforced strictly at the backend layer</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground">Keyboard-First Design</h4>
                  <p className="text-xs text-muted-foreground">Engineered for fast counter transactions</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center space-y-4">
            <h3 className="text-xl font-bold text-foreground">Join the Cloud Pharmacy Revolution</h3>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Ready to streamline your billing, inventory, and staff roles? Start your 14-day free trial today.
            </p>
            <Link href="/register">
              <Button size="lg" className="font-bold gap-2">
                Start Free Trial Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
