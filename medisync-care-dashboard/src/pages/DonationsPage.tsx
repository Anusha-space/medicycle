import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Heart, Building2, MapPin, FileText } from "lucide-react";

const recipients = [
  { name: "Hope Foundation NGO", type: "NGO", location: "Downtown", needs: "Antibiotics, Pain Relief" },
  { name: "Rural Health Clinic", type: "Rural Clinic", location: "Greenville", needs: "General Medicines" },
  { name: "Govt. District Hospital", type: "Government", location: "Central", needs: "Chronic Care Medicines" },
  { name: "MedAid International", type: "NGO", location: "Westside", needs: "Pediatric Medicines" },
];

const typeStyle: Record<string, string> = {
  NGO: "bg-success/10 text-success",
  "Rural Clinic": "bg-primary/10 text-primary",
  Government: "bg-warning/10 text-warning",
};

const donationHistory = [
  { id: "DN-001", recipient: "Hope Foundation NGO", medicines: "Paracetamol 500mg (100 units)", date: "2026-02-20", receipt: true },
  { id: "DN-002", recipient: "Rural Health Clinic", medicines: "Cetirizine 10mg (50 units)", date: "2026-02-25", receipt: true },
  { id: "DN-003", recipient: "Govt. District Hospital", medicines: "Metformin 500mg (200 units)", date: "2026-03-01", receipt: false },
];

const DonationsPage = () => (
  <DashboardLayout>
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground">Medicine Donations</h1>
      <p className="text-sm text-muted-foreground">Donate usable medicines to NGOs, clinics, and hospitals in need.</p>
    </div>

    {/* Recipients */}
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Available Recipients</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {recipients.map((r) => (
          <div key={r.name} className="rounded-xl border bg-card p-5 shadow-card">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-card-foreground">{r.name}</h4>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeStyle[r.type]}`}>{r.type}</span>
            </div>
            <div className="mb-4 space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{r.location}</p>
              <p>Needs: {r.needs}</p>
            </div>
            <Button size="sm" className="w-full gap-2"><Heart className="h-3.5 w-3.5" /> Donate Medicines</Button>
          </div>
        ))}
      </div>
    </div>

    {/* History */}
    <div className="rounded-xl border bg-card shadow-card">
      <div className="border-b px-5 py-4">
        <h3 className="font-semibold text-card-foreground">Donation History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50">
            <th className="px-5 py-3 text-left font-medium text-muted-foreground">ID</th>
            <th className="px-5 py-3 text-left font-medium text-muted-foreground">Recipient</th>
            <th className="px-5 py-3 text-left font-medium text-muted-foreground">Medicines</th>
            <th className="px-5 py-3 text-left font-medium text-muted-foreground">Date</th>
            <th className="px-5 py-3 text-left font-medium text-muted-foreground">Receipt</th>
          </tr></thead>
          <tbody>
            {donationHistory.map((d) => (
              <tr key={d.id} className="border-b last:border-0">
                <td className="px-5 py-3 font-medium text-card-foreground">{d.id}</td>
                <td className="px-5 py-3 text-muted-foreground">{d.recipient}</td>
                <td className="px-5 py-3 text-muted-foreground">{d.medicines}</td>
                <td className="px-5 py-3 text-muted-foreground">{d.date}</td>
                <td className="px-5 py-3">
                  {d.receipt ? (
                    <Button variant="ghost" size="sm" className="gap-1 text-primary h-7 px-2"><FileText className="h-3.5 w-3.5" /> Download</Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Pending</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
);

export default DonationsPage;
