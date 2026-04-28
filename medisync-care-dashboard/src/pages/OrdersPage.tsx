import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingBag, Clock, CheckCircle2, Truck, XCircle, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const statusIcon: Record<string, React.ReactNode> = {
  Pending:    <Clock className="h-3.5 w-3.5" />,
  Confirmed:  <CheckCircle2 className="h-3.5 w-3.5" />,
  Dispatched: <Package className="h-3.5 w-3.5" />,
  Delivered:  <Truck className="h-3.5 w-3.5" />,
  Cancelled:  <XCircle className="h-3.5 w-3.5" />,
};

const statusColor: Record<string, string> = {
  Pending:    "bg-yellow-100 text-yellow-700 border-yellow-300",
  Confirmed:  "bg-blue-100 text-blue-700 border-blue-300",
  Dispatched: "bg-purple-100 text-purple-700 border-purple-300",
  Delivered:  "bg-green-100 text-green-700 border-green-300",
  Cancelled:  "bg-red-100 text-red-700 border-red-300",
};

const OrdersPage = () => {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const isPharmacy = user?.role === "pharmacy" || user?.role === "admin";

  const fetchOrders = async () => {
    try {
      // Pharmacy/admin sees all orders, buyers see their own
      const url = isPharmacy
        ? "http://localhost:5000/api/orders"
        : "http://localhost:5000/api/orders/my";

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load orders.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusUpdate = async (orderId: number, status: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast({ title: "Status Updated!", description: `Order #${orderId} marked as ${status}` });
      fetchOrders();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  const summaryCards = [
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-blue-500" },
    { label: "Pending", value: orders.filter(o => o.status === "Pending").length, icon: Clock, color: "text-yellow-500" },
    { label: "Dispatched", value: orders.filter(o => o.status === "Dispatched").length, icon: Package, color: "text-purple-500" },
    { label: "Delivered", value: orders.filter(o => o.status === "Delivered").length, icon: Truck, color: "text-green-500" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">
          {isPharmacy ? "Manage and update all medicine orders" : "Track your medicine orders"}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map(c => (
          <div key={c.label} className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-bold">{loading ? "..." : c.value}</p>
              </div>
              <c.icon className={`h-6 w-6 ${c.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border bg-card shadow-card">
        <div className="border-b px-5 py-4">
          <h3 className="font-semibold">
            {isPharmacy ? "All Orders" : "My Orders"}
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Order ID</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Medicine</th>
                  {isPharmacy && <th className="px-5 py-3 text-left font-medium text-muted-foreground">Buyer</th>}
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Qty</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Total</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Status</th>
                  {isPharmacy && <th className="px-5 py-3 text-left font-medium text-muted-foreground">Update</th>}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-medium">#{o.id}</td>
                    <td className="px-5 py-3">{o.medicine_name || "—"}</td>
                    {isPharmacy && <td className="px-5 py-3 text-muted-foreground">{o.buyer_name || "—"}</td>}
                    <td className="px-5 py-3">{o.quantity}</td>
                    <td className="px-5 py-3 font-medium text-green-600">
                      {o.total_price ? `₹${parseFloat(o.total_price).toFixed(2)}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${statusColor[o.status] || "bg-gray-100 text-gray-700"}`}>
                        {statusIcon[o.status]} {o.status}
                      </span>
                    </td>
                    {isPharmacy && (
                      <td className="px-5 py-3">
                        <Select
                          value={o.status}
                          onValueChange={(val) => handleStatusUpdate(o.id, val)}
                          disabled={updating === o.id || o.status === "Delivered" || o.status === "Cancelled"}
                        >
                          <SelectTrigger className="h-8 w-36 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Confirmed">Confirmed</SelectItem>
                            <SelectItem value="Dispatched">Dispatched</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    )}
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

export default OrdersPage;