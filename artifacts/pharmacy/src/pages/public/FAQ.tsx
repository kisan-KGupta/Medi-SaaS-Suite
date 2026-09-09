import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { HelpCircle, ArrowRight } from "lucide-react";

export default function FAQ() {
  const faqs = [
    {
      q: "Is Medi-SaaS cloud-based or offline?",
      a: "Medi-SaaS is 100% cloud-based. You can securely log in from any web browser on desktop, tablet, or laptop. No local software installation or database setup is required."
    },
    {
      q: "Can multiple staff members use the software at the same time?",
      a: "Yes! Medi-SaaS supports concurrent multi-staff usage. Your pharmacy admin can create custom accounts for pharmacists, cashiers, and inventory managers with role-based permissions."
    },
    {
      q: "Can I create custom staff roles and restrict permissions?",
      a: "Absolutely. Our Dynamic Role-Based Access Control (RBAC) allows pharmacy admins to create custom roles (e.g. 'Senior Cashier' or 'Inventory Manager') and toggle granular permissions for sales, purchases, medicine deletion, and reports."
    },
    {
      q: "Is my pharmacy data isolated from other pharmacies?",
      a: "Yes. Tenant isolation is enforced strictly on the backend API layer. Database queries automatically bind to your authenticated pharmacy ID, guaranteeing that no other pharmacy can view or modify your data."
    },
    {
      q: "What happens when my trial or subscription expires?",
      a: "If your subscription expires, your account is placed in restricted mode where you can view subscription renewal options. Super Admin can manage or extend your status, and your data remains safely stored and preserved."
    },
    {
      q: "Does the POS support keyboard-first billing and barcode scanners?",
      a: "Yes! The POS interface is built specifically to minimize mouse usage. Scan barcodes or search medicine names, press [ENTER] to add to cart, enter quantity, and complete checkout seamlessly."
    },
    {
      q: "Can I manage batch numbers and medicine expiry dates?",
      a: "Yes. Every medicine entry includes batch numbers and expiry dates. The system automatically categorizes stock into 30, 60, and 90-day expiry alert buckets to prevent expired medicine sales."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar />

      <section className="py-16 bg-muted/40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Medi-SaaS features, multi-tenant security, and subscriptions.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-xl px-4 bg-card">
                <AccordionTrigger className="text-base font-bold text-foreground text-left py-4 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-16 text-center p-8 rounded-2xl bg-card border border-border space-y-4">
            <h3 className="text-xl font-bold text-foreground">Still Have Questions?</h3>
            <p className="text-sm text-muted-foreground">
              Our team is available to assist you with onboarding or custom feature requirements.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/contact">
                <Button variant="outline" className="font-semibold">
                  Contact Support
                </Button>
              </Link>
              <Link href="/register">
                <Button className="font-bold gap-2">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
