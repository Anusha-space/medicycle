import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Package, AlertTriangle, ShoppingCart, Users, Clock, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/context/AuthContext";

interface Stats {
  totalMedicines: number;
  expiringCount: number;
  totalOrders: number;
  pendingOrders: number;
  openUrgentRequests: number;
  totalUsers: number;
}

interface Medicine {
  id: number;
  name: string;
  batch: string;
  expiry_date: string;
  quantity: number;
  discount_percent: number;
  status: string;
}

const Dashboard = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalMedicines: 0,
    expiringCount: 0,
    totalOrders: 0,
    pendingOrders: 0,
    openUrgentRequests: 0,
    totalUsers: 0,
  });
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  const getDaysToExpiry = (expiry: string) => {
    return Math.floor((new Date(expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatus = (expiry: string) => {
    const days = getDaysToExpiry(expiry);
    if (days <= 30) return "Urgent";
    if (days <= 90) return "Expiring Soon";
    return "Normal";
  };

  const statusColor: Record<string, string> = {
    Normal: "bg-green-100 text-green-700",
    "Expiring Soon": "bg-yellow-100 text-yellow-700",
    Urgent: "bg-red-100 text-red-700",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch medicines
        const medRes = await fetch("http://localhost:5000/api/medicines", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const medData = await medRes.json();

        // Fetch my orders
        const ordRes = await fetch("http://localhost:5000/api/orders/my", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const ordData = await ordRes.json();

        // Fetch urgent requests
        const urgRes = await fetch("http://localhost:5000/api/urgent", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const urgData = await urgRes.json();

        // If pharmacy, fetch my medicines
        let myMeds = medData;
        if (user?.role === "pharmacy") {
          const myMedRes = await fetch("http://localhost:5000/api/medicines/my", {
            headers: { Authorization: `Bearer ${token}` }
          });
          myMeds = await myMedRes.json();
        }

        setMedicines(myMeds.slice(0, 6));

        const expiring = medData.filter((m: Medicine) => getDaysToExpiry(m.expiry_date) <= 90).length;
        const pending = Array.isArray(ordData) ? ordData.filter((o: any) => o.status === "Pending").length : 0;

        setStats({
          totalMedicines: user?.role === "pharmacy" ? myMeds.length : medData.length,
          expiringCount: expiring,
          totalOrders: Array.isArray(ordData) ? ordData.length : 0,
          pendingOrders: pending,
          openUrgentRequests: Array.isArray(urgData) ? urgData.length : 0,
          totalUsers: 0,
        });

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Build pie chart from real data
  const urgent = medicines.filter(m => getStatus(m.expiry_date) === "Urgent").length;
  const expiringSoon = medicines.filter(m => getStatus(m.expiry_date) === "Expiring Soon").length;
  const safe = medicines.filter(m => getStatus(m.expiry_date) === "Normal").length;

  const expiryRisk = [
    { name: "Safe", value: safe || 0, color: "hsl(152, 55%, 45%)" },
    { name: "Expiring Soon", value: expiringSoon || 0, color: "hsl(38, 92%, 55%)" },
    { name: "Urgent", value: urgent || 0, color: "hsl(0, 72%, 55%)" },
  ].filter(e => e.value > 0);

  const overviewCards = [
    {
      title: user?.role === "pharmacy" ? "My Medicines" : "Available Medicines",
      value: loading ? "..." : stats.totalMedicines.toString(),
      icon: Package,
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: "Expiring in 90 days",
      value: loading ? "..." : stats.expiringCount.toString(),
      icon: AlertTriangle,
      color: "bg-yellow-100 text-yellow-700"
    },
    {
      title: user?.role === "pharmacy" ? "Open Urgent Requests" : "My Orders",
      value: loading ? "..." : (user?.role === "pharmacy" ? stats.openUrgentRequests : stats.totalOrders).toString(),
      icon: user?.role === "pharmacy" ? AlertTriangle : ShoppingCart,
      color: "bg-red-100 text-red-700"
    },
    {
      title: "Pending Orders",
      value: loading ? "..." : stats.pendingOrders.toString(),
      icon: Clock,
      color: "bg-purple-100 text-purple-700"
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-sm text-muted-foreground capitalize">
          {user?.role} Dashboard — MediCycle
        </p>
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
          <h3 className="mb-4 font-semibold text-card-foreground">Expiry Risk Analysis</h3>
          {expiryRisk.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              No medicine data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={expiryRisk} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                  dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {expiryRisk.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Urgent requests summary */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-4 font-semibold text-card-foreground">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Open Urgent Requests</span>
              </div>
              <span className="font-bold text-red-500">{stats.openUrgentRequests}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Pending Orders</span>
              </div>
              <span className="font-bold text-yellow-500">{stats.pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Medicines Expiring Soon</span>
              </div>
              <span className="font-bold text-blue-500">{stats.expiringCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Total Orders Placed</span>
              </div>
              <span className="font-bold text-green-500">{stats.totalOrders}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Medicine Table */}
      <div className="rounded-xl border bg-card shadow-card">
        <div className="border-b px-5 py-4">
          <h3 className="font-semibold text-card-foreground">
            {user?.role === "pharmacy" ? "My Listed Medicines" : "Available Medicines"}
          </h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : medicines.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No medicines found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Medicine Name</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Batch</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Expiry Date</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Qty</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Discount</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((m) => (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="px-5 py-3 font-medium text-card-foreground">{m.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{m.batch || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{new Date(m.expiry_date).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-muted-foreground">{m.quantity}</td>
                    <td className="px-5 py-3 text-green-600 font-medium">
                      {m.discount_percent > 0 ? `${m.discount_percent}% OFF` : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[getStatus(m.expiry_date)]}`}>
                        {getStatus(m.expiry_date)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;