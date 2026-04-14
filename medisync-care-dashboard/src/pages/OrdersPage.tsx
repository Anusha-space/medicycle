import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Clock, CheckCircle2, Truck } from "lucide-react";
import { useEffect, useState } from "react";

const statusIcon: Record<string, React.ReactNode> = {
  Pending: <Clock className="h-3.5 w-3.5" />,
  Confirmed: <CheckCircle2 className="h-3.5 w-3.5" />,
  Delivered: <Truck className="h-3.5 w-3.5" />,
};

const statusColor: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
  Confirmed: "bg-blue-100 text-blue-700 border-blue-300",
  Delivered: "bg-green-100 text-green-700 border-green-300",
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);

  // ✅ FETCH REAL DATA
  useEffect(() => {
    fetch("http://localhost:5000/api/orders")
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Track all medicine purchase orders.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Orders", value: orders.length, icon: ShoppingBag },
          {
            label: "Pending",
            value: orders.filter(o => o.status === "Pending").length,
            icon: Clock,
          },
          {
            label: "Delivered",
            value: orders.filter(o => o.status === "Delivered").length,
            icon: Truck,
          },
        ].map(c => (
          <div key={c.label} className="rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs">{c.label}</p>
                <p className="text-2xl font-bold">{c.value}</p>
              </div>
              <c.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border">
        <div className="border-b px-5 py-4">
          <h3 className="font-semibold">All Orders</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-5 py-3 text-left">Order ID</th>
                <th className="px-5 py-3 text-left">Medicine</th>
                <th className="px-5 py-3 text-left">Qty</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-6">
                    No orders yet
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="border-b">
                    <td className="px-5 py-3">#{o.id}</td>
                    <td className="px-5 py-3">{o.name}</td>
                    <td className="px-5 py-3">{o.quantity}</td>

                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${statusColor[o.status]}`}
                      >
                        {statusIcon[o.status]} {o.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrdersPage;