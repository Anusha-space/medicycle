import DashboardLayout from "@/components/DashboardLayout";
import { AlertTriangle, ShoppingBag, Clock, CheckCircle, Bell, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const typeIcon: Record<string, React.ReactNode> = {
  expiry:    <AlertTriangle className="h-5 w-5" />,
  urgent:    <AlertTriangle className="h-5 w-5" />,
  order:     <ShoppingBag className="h-5 w-5" />,
  fulfilled: <CheckCircle className="h-5 w-5" />,
};

const typeColor: Record<string, string> = {
  expiry:    "bg-yellow-100 text-yellow-700",
  urgent:    "bg-red-100 text-red-700",
  order:     "bg-blue-100 text-blue-700",
  fulfilled: "bg-green-100 text-green-700",
};

const priorityBadge: Record<string, string> = {
  high:   "bg-red-100 text-red-700 border border-red-300",
  medium: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  low:    "bg-green-100 text-green-700 border border-green-300",
};

const getTimeAgo = (time: string) => {
  const diff = Math.floor((new Date().getTime() - new Date(time).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationsPage = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setNotifications(data);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load notifications.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const highCount = notifications.filter(n => n.priority === "high").length;

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
            {highCount > 0 && (
              <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                {highCount} urgent
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time alerts for expiry, orders and urgent requests
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={fetchNotifications}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 rounded-xl border bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-16 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mb-3 opacity-30" />
          <p className="font-medium">You're all caught up!</p>
          <p className="text-sm text-muted-foreground">No notifications right now</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* High priority section */}
          {notifications.filter(n => n.priority === "high").length > 0 && (
            <div className="mb-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-500">
                🚨 Urgent
              </p>
              {notifications.filter(n => n.priority === "high").map((n) => (
                <NotificationCard key={n.id} n={n} />
              ))}
            </div>
          )}

          {/* Medium priority */}
          {notifications.filter(n => n.priority === "medium").length > 0 && (
            <div className="mb-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-yellow-500">
                ⚠️ Important
              </p>
              {notifications.filter(n => n.priority === "medium").map((n) => (
                <NotificationCard key={n.id} n={n} />
              ))}
            </div>
          )}

          {/* Low priority */}
          {notifications.filter(n => n.priority === "low").length > 0 && (
            <div className="mb-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                📋 Updates
              </p>
              {notifications.filter(n => n.priority === "low").map((n) => (
                <NotificationCard key={n.id} n={n} />
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

const NotificationCard = ({ n }: { n: Notification }) => (
  <div className={`mb-3 flex items-start gap-4 rounded-xl border bg-card p-4 shadow-card transition-all hover:shadow-md ${n.priority === "high" ? "border-red-200" : ""}`}>
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeColor[n.type] || "bg-gray-100 text-gray-700"}`}>
      {typeIcon[n.type] || <Bell className="h-5 w-5" />}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-sm font-semibold text-card-foreground">{n.title}</p>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityBadge[n.priority]}`}>
          {n.priority}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{n.description}</p>
    </div>
    <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
      <Clock className="h-3 w-3" />
      {getTimeAgo(n.time)}
    </span>
  </div>
);

export default NotificationsPage;