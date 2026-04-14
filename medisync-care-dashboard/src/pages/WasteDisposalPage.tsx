import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Trash2, Truck, CheckCircle2, FileText, Clock } from "lucide-react";

const wasteMedicines = [
  { name: "Expired Antibiotics Batch", batch: "B-20230", qty: 120, reason: "Expired" },
  { name: "Damaged Insulin Vials", batch: "B-20235", qty: 30, reason: "Damaged" },
  { name: "Recalled Cough Syrup", batch: "B-20238", qty: 60, reason: "Recalled" },
];

const disposalRequests = [
  { id: "WD-001", facility: "GreenMed Waste Solutions", date: "2026-02-28", status: "Certificate Generated" },
  { id: "WD-002", facility: "SafeDispose Pvt Ltd", date: "2026-03-01", status: "Collected" },
  { id: "WD-003", facility: "GreenMed Waste Solutions", date: "2026-03-03", status: "Approved" },
  { id: "WD-004", facility: "BioWaste Corp", date: "2026-03-05", status: "Request Sent" },
];

const statusConfig: Record<string, { icon: typeof Clock; style: string }> = {
  "Request Sent": { icon: Clock, style: "bg-muted text-muted-foreground" },
  "Approved": { icon: CheckCircle2, style: "bg-primary/10 text-primary" },
  "Collected": { icon: Truck, style: "bg-warning/10 text-warning" },
  "Certificate Generated": { icon: FileText, style: "bg-success/10 text-success" },
};

const WasteDisposalPage = () => (
  <DashboardLayout>
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground">Waste Disposal</h1>
      <p className="text-sm text-muted-foreground">Manage pharmaceutical waste disposal with full compliance tracking.</p>
    </div>

    {/* Waste medicines */}
    <div className="mb-8 rounded-xl border bg-card shadow-card">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h3 className="font-semibold text-card-foreground">Medicines for Disposal</h3>
        <Button size="sm" variant="destructive" className="gap-2"><Trash2 className="h-3.5 w-3.5" /> Request Pickup</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50">
            <th className="px-5 py-3 text-left font-medium text-muted-foreground">Medicine</th>
            <th className="px-5 py-3 text-left font-medium text-muted-foreground">Batch</th>
            <th className="px-5 py-3 text-left font-medium text-muted-foreground">Qty</th>
            <th className="px-5 py-3 text-left font-medium text-muted-foreground">Reason</th>
          </tr></thead>
          <tbody>
            {wasteMedicines.map((m) => (
              <tr key={m.batch} className="border-b last:border-0">
                <td className="px-5 py-3 font-medium text-card-foreground">{m.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{m.batch}</td>
                <td className="px-5 py-3 text-muted-foreground">{m.qty}</td>
                <td className="px-5 py-3"><span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">{m.reason}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Disposal Status */}
    <div className="rounded-xl border bg-card shadow-card">
      <div className="border-b px-5 py-4">
        <h3 className="font-semibold text-card-foreground">Disposal Request Tracking</h3>
      </div>
      <div className="divide-y">
        {disposalRequests.map((r) => {
          const cfg = statusConfig[r.status];
          const Icon = cfg.icon;
          return (
            <div key={r.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-card-foreground">{r.id} – {r.facility}</p>
                <p className="text-xs text-muted-foreground">{r.date}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.style}`}>
                <Icon className="h-3.5 w-3.5" />{r.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  </DashboardLayout>
);

export default WasteDisposalPage;
