import DashboardLayout from "@/components/DashboardLayout";
import { Package, AlertTriangle, Brain, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const overviewCards = [
  { title: "Total Medicines", value: "12,458", icon: Package, color: "bg-accent text-accent-foreground" },
  { title: "Nearing Expiry", value: "342", icon: AlertTriangle, color: "bg-warning/10 text-warning" },
  { title: "AI Suggestions", value: "28", icon: Brain, color: "bg-primary/10 text-primary" },
  { title: "Disposal Requests", value: "5", icon: Trash2, color: "bg-destructive/10 text-destructive" },
];

const monthlyData = [
  { month: "Jan", used: 4200, wasted: 300 },
  { month: "Feb", used: 3800, wasted: 250 },
  { month: "Mar", used: 4500, wasted: 200 },
  { month: "Apr", used: 4100, wasted: 180 },
  { month: "May", used: 4700, wasted: 150 },
  { month: "Jun", used: 5100, wasted: 120 },
];

const expiryRisk = [
  { name: "Safe", value: 75, color: "hsl(152, 55%, 45%)" },
  { name: "Expiring Soon", value: 18, color: "hsl(38, 92%, 55%)" },
  { name: "Urgent", value: 7, color: "hsl(0, 72%, 55%)" },
];

const medicines = [
  { name: "Paracetamol 500mg", batch: "B-20241", expiry: "2026-08-15", qty: 500, status: "Normal" },
  { name: "Amoxicillin 250mg", batch: "B-20242", expiry: "2026-05-20", qty: 200, status: "Expiring Soon" },
  { name: "Ibuprofen 400mg", batch: "B-20243", expiry: "2026-04-01", qty: 80, status: "Urgent" },
  { name: "Metformin 500mg", batch: "B-20244", expiry: "2027-01-10", qty: 1200, status: "Normal" },
  { name: "Cetirizine 10mg", batch: "B-20245", expiry: "2026-05-30", qty: 150, status: "Expiring Soon" },
  { name: "Azithromycin 500mg", batch: "B-20246", expiry: "2026-03-25", qty: 45, status: "Urgent" },
];

const statusColor: Record<string, string> = {
  Normal: "bg-success/10 text-success",
  "Expiring Soon": "bg-warning/10 text-warning",
  Urgent: "bg-destructive/10 text-destructive",
};

const Dashboard = () => (
  <DashboardLayout>
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Welcome back! Here's your pharmacy overview on MediCycle.</p>
    </div>

    {/* Overview Cards */}
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {overviewCards.map((c) => (
        <div key={c.title} className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{c.title}</p>
              <p className="mt-1 text-2xl font-bold text-card-foreground">{c.value}</p>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Charts */}
    <div className="mb-8 grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border bg-card p-5 shadow-card">
        <h3 className="mb-4 font-semibold text-card-foreground">Monthly Medicine Usage</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="used" fill="hsl(210, 80%, 45%)" radius={[4,4,0,0]} name="Used" />
            <Bar dataKey="wasted" fill="hsl(0, 72%, 55%)" radius={[4,4,0,0]} name="Wasted" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-xl border bg-card p-5 shadow-card">
        <h3 className="mb-4 font-semibold text-card-foreground">Expiry Risk Analysis</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={expiryRisk} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
              {expiryRisk.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Medicine Table */}
    <div className="rounded-xl border bg-card shadow-card">
      <div className="border-b px-5 py-4">
        <h3 className="font-semibold text-card-foreground">Medicine Inventory</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Medicine Name</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Batch</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Expiry Date</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Qty</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((m) => (
              <tr key={m.batch} className="border-b last:border-0">
                <td className="px-5 py-3 font-medium text-card-foreground">{m.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{m.batch}</td>
                <td className="px-5 py-3 text-muted-foreground">{m.expiry}</td>
                <td className="px-5 py-3 text-muted-foreground">{m.qty}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[m.status]}`}>{m.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
);

export default Dashboard;
