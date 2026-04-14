import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Package, ShoppingBag, Store, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const allMedicines = [
  { id: 1, name: "Paracetamol 500mg", batch: "B-20241", expiry: "2026-08-15", qty: 500, seller: "MedPlus Pharmacy" },
  { id: 2, name: "Amoxicillin 250mg", batch: "B-20242", expiry: "2026-05-20", qty: 200, seller: "Apollo Pharmacy" },
  { id: 3, name: "Ibuprofen 400mg", batch: "B-20243", expiry: "2026-04-01", qty: 80, seller: "Wellness Pharma" },
  { id: 4, name: "Metformin 500mg", batch: "B-20244", expiry: "2027-01-10", qty: 1200, seller: "LifeCare Drugs" },
];

const allOrders = [
  { id: 1001, medicine: "Paracetamol 500mg", buyer: "City Hospital", total: 4500, status: "Delivered" },
  { id: 1002, medicine: "Amoxicillin 250mg", buyer: "Rural Clinic", total: 6000, status: "Confirmed" },
  { id: 1003, medicine: "Ibuprofen 400mg", buyer: "NGO HealthAid", total: 2400, status: "Pending" },
];

const initialPharmacies = [
  { id: 1, name: "MedPlus Pharmacy", email: "contact@medplus.com", status: "Approved" as const },
  { id: 2, name: "Apollo Pharmacy", email: "info@apollo.com", status: "Approved" as const },
  { id: 3, name: "Wellness Pharma", email: "hello@wellness.com", status: "Pending" as const },
  { id: 4, name: "LifeCare Drugs", email: "admin@lifecare.com", status: "Pending" as const },
  { id: 5, name: "QuickMed Store", email: "support@quickmed.com", status: "Rejected" as const },
];

const AdminPanel = () => {
  const [pharmacies, setPharmacies] = useState(initialPharmacies);

  const updateStatus = (id: number, status: "Approved" | "Rejected") => {
    setPharmacies(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    toast({ title: `Pharmacy ${status}`, description: `Pharmacy has been ${status.toLowerCase()}.` });
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">Manage medicines, orders, and pharmacy approvals.</p>
      </div>

      {/* Summary */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Medicines", value: allMedicines.length, icon: Package, color: "bg-primary/10 text-primary" },
          { label: "Total Orders", value: allOrders.length, icon: ShoppingBag, color: "bg-accent text-accent-foreground" },
          { label: "Pharmacies", value: pharmacies.length, icon: Store, color: "bg-success/10 text-success" },
          { label: "Pending Approvals", value: pharmacies.filter(p => p.status === "Pending").length, icon: ShieldCheck, color: "bg-warning/10 text-warning" },
        ].map(c => (
          <div key={c.label} className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{c.label}</p>
                <p className="mt-1 text-2xl font-bold text-card-foreground">{c.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="pharmacies">
        <TabsList>
          <TabsTrigger value="pharmacies">Pharmacy Approvals</TabsTrigger>
          <TabsTrigger value="medicines">Medicines</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="pharmacies" className="mt-4">
          <div className="rounded-xl border bg-card shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Actions</th>
                </tr></thead>
                <tbody>
                  {pharmacies.map(p => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="px-5 py-3 font-medium text-card-foreground">{p.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{p.email}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          p.status === "Approved" ? "bg-success/10 text-success" :
                          p.status === "Rejected" ? "bg-destructive/10 text-destructive" :
                          "bg-warning/10 text-warning"
                        }`}>{p.status}</span>
                      </td>
                      <td className="px-5 py-3">
                        {p.status === "Pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="gap-1 text-success border-success/30 hover:bg-success/10" onClick={() => updateStatus(p.id, "Approved")}>
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => updateStatus(p.id, "Rejected")}>
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="medicines" className="mt-4">
          <div className="rounded-xl border bg-card shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Medicine</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Batch</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Expiry</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Qty</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Seller</th>
                </tr></thead>
                <tbody>
                  {allMedicines.map(m => (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="px-5 py-3 font-medium text-card-foreground">{m.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{m.batch}</td>
                      <td className="px-5 py-3 text-muted-foreground">{m.expiry}</td>
                      <td className="px-5 py-3 text-muted-foreground">{m.qty}</td>
                      <td className="px-5 py-3 text-muted-foreground">{m.seller}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <div className="rounded-xl border bg-card shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Order ID</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Medicine</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Buyer</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Total (₹)</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Status</th>
                </tr></thead>
                <tbody>
                  {allOrders.map(o => (
                    <tr key={o.id} className="border-b last:border-0">
                      <td className="px-5 py-3 font-medium text-card-foreground">#{o.id}</td>
                      <td className="px-5 py-3 text-muted-foreground">{o.medicine}</td>
                      <td className="px-5 py-3 text-muted-foreground">{o.buyer}</td>
                      <td className="px-5 py-3 text-muted-foreground">₹{o.total.toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          o.status === "Delivered" ? "bg-success/10 text-success" :
                          o.status === "Confirmed" ? "bg-primary/10 text-primary" :
                          "bg-warning/10 text-warning"
                        }`}>{o.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AdminPanel;
