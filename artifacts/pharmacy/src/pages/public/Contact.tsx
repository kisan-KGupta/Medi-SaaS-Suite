import { useState } from "react";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar />

      <section className="py-16 bg-muted/40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Get in Touch with Our SaaS Team
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about subscriptions, custom pharmacy setups, or technical support? We are here to help.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Contact Information</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Reach out directly or fill out the form and our SaaS support specialists will respond within 4 business hours.
              </p>
            </div>

            <div className="space-y-4 text-sm font-medium">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Email Support</div>
                  <div className="text-foreground font-semibold">support@medisaas.com</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Sales Hotline</div>
                  <div className="text-foreground font-semibold">+1 (800) 555-MEDISAAS</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Headquarters</div>
                  <div className="text-foreground font-semibold">Horizon Chowk, Butwal, Nepal</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-card border border-border shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                <h3 className="text-xl font-bold text-foreground">Message Received!</h3>
                <p className="text-sm text-muted-foreground">
                  Thank you for contacting Medi-SaaS. Our support team will get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-foreground mb-4">Send Us a Message</h3>
                <div>
                  <label className="text-xs font-semibold text-foreground">Your Name</label>
                  <Input required placeholder="Dr. Rajesh Kumar" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Email Address</label>
                  <Input required type="email" placeholder="rajesh@pharmacy.com" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Pharmacy Name</label>
                  <Input placeholder="City Care Pharmacy" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Message</label>
                  <Textarea required rows={4} placeholder="How can we help your pharmacy?" className="mt-1" />
                </div>
                <Button type="submit" className="w-full font-bold gap-2">
                  Send Message <Send className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
