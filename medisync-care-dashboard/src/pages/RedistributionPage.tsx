import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Brain, MapPin, TrendingUp, Send } from "lucide-react";

const expiringMedicines = [
  { name: "Amoxicillin 250mg", batch: "B-20242", expiry: "2026-05-20", qty: 200 },
  { name: "Cetirizine 10mg", batch: "B-20245", expiry: "2026-05-30", qty: 150 },
  { name: "Ibuprofen 400mg", batch: "B-20243", expiry: "2026-04-01", qty: 80 },
];

const hospitalSuggestions = [
  { hospital: "City General Hospital", distance: "3.2 km", demand: "High", suggestedQty: 120, match: 94 },
  { hospital: "St. Mary's Medical Center", distance: "5.8 km", demand: "Medium", suggestedQty: 80, match: 87 },
  { hospital: "Regional Community Hospital", distance: "8.1 km", demand: "High", suggestedQty: 150, match: 82 },
  { hospital: "Sunrise Healthcare", distance: "12.4 km", demand: "Low", suggestedQty: 40, match: 71 },
];

const RedistributionPage = () => (
  <DashboardLayout>
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground">AI Redistribution</h1>
      <p className="text-sm text-muted-foreground">Smart matching of near-expiry medicines with hospitals.</p>
    </div>

    {/* Expiring Medicines */}
    <div className="mb-8 rounded-xl border bg-card shadow-card">
      <div className="border-b px-5 py-4">
        <h3 className="font-semibold text-card-foreground">Medicines Expiring Within 3 Months</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50">
            <th className="px-5 py-3 text-left font-medium text-muted-foreground">Medicine</th>
            <th className="px-5 py-3 text-left font-medium text-muted-foreground">Batch</th>
            <th className="px-5 py-3 text-left font-medium text-muted-foreground">Expiry</th>
            <th className="px-5 py-3 text-left font-medium text-muted-foreground">Qty</th>
          </tr></thead>
          <tbody>
            {expiringMedicines.map((m) => (
              <tr key={m.batch} className="border-b last:border-0">
                <td className="px-5 py-3 font-medium text-card-foreground">{m.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{m.batch}</td>
                <td className="px-5 py-3 text-warning font-medium">{m.expiry}</td>
                <td className="px-5 py-3 text-muted-foreground">{m.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* AI Hospital Suggestions */}
    <div className="mb-4 flex items-center gap-2">
      <Brain className="h-5 w-5 text-primary" />
      <h3 className="text-lg font-semibold text-foreground">AI-Suggested Hospitals</h3>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      {hospitalSuggestions.map((h) => (
        <div key={h.hospital} className="rounded-xl border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-start justify-between">
            <h4 className="font-semibold text-card-foreground">{h.hospital}</h4>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{h.match}% match</span>
          </div>
          <div className="mb-4 grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{h.distance}</div>
            <div className="flex items-center gap-1.5 text-muted-foreground"><TrendingUp className="h-3.5 w-3.5" />{h.demand} demand</div>
            <div className="text-muted-foreground">Qty: <span className="font-medium text-card-foreground">{h.suggestedQty}</span></div>
          </div>
          <Button size="sm" className="w-full gap-2"><Send className="h-3.5 w-3.5" /> Send Redistribution Request</Button>
        </div>
      ))}
    </div>
  </DashboardLayout>
);

export default RedistributionPage;
