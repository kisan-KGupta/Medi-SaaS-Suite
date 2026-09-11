import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useGetMe, customFetch } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Building, Save, ShieldCheck, Image as ImageIcon } from "lucide-react";
import { normalizeLogoUrl } from "../admin/Pharmacies";

export default function PharmacySettings() {
  const { toast } = useToast();
  const { data: user } = useGetMe();

  const [name, setName] = useState((user as any)?.pharmacyName || "Sanjay Medical Pharmacy");
  const [logo, setLogo] = useState("");
  const [address, setAddress] = useState("Horizon Chowk, Butwal, Nepal");
  const [phone, setPhone] = useState("+977 9800000000");
  const [email, setEmail] = useState("contact@sanjaymedical.com");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    customFetch<any>("/api/pharmacy/settings")
      .then((data) => {
        if (data) {
          if (data.name) setName(data.name);
          if (data.logo) setLogo(data.logo);
          if (data.address) setAddress(data.address);
          if (data.phone) setPhone(data.phone);
          if (data.email) setEmail(data.email);
        }
      })
      .catch((err) => console.error("Failed to load pharmacy settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const normalizedLogo = normalizeLogoUrl(logo);
      await customFetch("/api/pharmacy/settings", {
        method: "PATCH",
        body: JSON.stringify({ name, logo: normalizedLogo, address, phone, email }),
      });
      setLogo(normalizedLogo);
      toast({
        title: "Settings Saved",
        description: "Pharmacy store profile and logo updated successfully.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" /> Pharmacy Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your store information, contact details, and invoice receipt branding.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          <ShieldCheck className="h-4 w-4" /> Tenant Isolated & Active
        </div>
      </div>

      <div className="max-w-2xl bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground">Pharmacy Name</label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Pharmacy Logo URL</span>
              <span className="text-[10px] text-muted-foreground font-normal">Direct image URL or Base64 data</span>
            </label>
            <Input
              placeholder="https://example.com/logo.png"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              className="mt-1 font-mono text-xs"
            />
            {logo ? (
              <div className="mt-2 flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/40">
                <img
                  src={logo}
                  alt="Store Logo Preview"
                  className="h-12 w-12 object-contain rounded-lg border border-border bg-white p-1 shadow-xs"
                  onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                />
                <div>
                  <span className="text-xs font-bold text-foreground block">Logo Preview</span>
                  <span className="text-[11px] text-muted-foreground">This logo will appear on POS receipts and app headers.</span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground mt-1">
                No logo uploaded yet. Paste an image URL above to display your brand logo on receipts and headers.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Address</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Phone Number</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">Store Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <Button type="submit" disabled={saving} className="font-bold gap-2">
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
