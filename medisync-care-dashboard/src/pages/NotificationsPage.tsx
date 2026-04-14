import DashboardLayout from "@/components/DashboardLayout";
import { AlertTriangle, Brain, Truck, Heart, Clock } from "lucide-react";

const notifications = [
  { type: "expiry", icon: AlertTriangle, color: "bg-warning/10 text-warning", title: "Expiry Alert", desc: "Amoxicillin 250mg (B-20242) expires in 76 days.", time: "2 hours ago" },
  { type: "expiry", icon: AlertTriangle, color: "bg-destructive/10 text-destructive", title: "Urgent Expiry", desc: "Ibuprofen 400mg (B-20243) expires in 27 days!", time: "3 hours ago" },
  { type: "ai", icon: Brain, color: "bg-primary/10 text-primary", title: "AI Match Found", desc: "City General Hospital has high demand for Amoxicillin – 94% match score.", time: "5 hours ago" },
  { type: "ai", icon: Brain, color: "bg-primary/10 text-primary", title: "Redistribution Opportunity", desc: "3 hospitals near you need Cetirizine 10mg. Review suggestions.", time: "8 hours ago" },
  { type: "waste", icon: Truck, color: "bg-success/10 text-success", title: "Pickup Completed", desc: "GreenMed Waste Solutions collected waste batch WD-001. Certificate generated.", time: "1 day ago" },
  { type: "waste", icon: Truck, color: "bg-info/10 text-info", title: "Pickup Approved", desc: "SafeDispose approved your waste disposal request WD-003.", time: "1 day ago" },
  { type: "donation", icon: Heart, color: "bg-success/10 text-success", title: "Donation Confirmed", desc: "Hope Foundation NGO received 100 units of Paracetamol 500mg.", time: "2 days ago" },
  { type: "donation", icon: Heart, color: "bg-success/10 text-success", title: "Receipt Generated", desc: "Donation receipt for DN-002 is ready for download.", time: "3 days ago" },
];

const NotificationsPage = () => (
  <DashboardLayout>
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
      <p className="text-sm text-muted-foreground">Stay updated on expiry alerts, AI matches, and more.</p>
    </div>

    <div className="space-y-3">
      {notifications.map((n, i) => (
        <div key={i} className="flex items-start gap-4 rounded-xl border bg-card p-4 shadow-card">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${n.color}`}>
            <n.icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-card-foreground">{n.title}</p>
            <p className="text-sm text-muted-foreground">{n.desc}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />{n.time}
          </span>
        </div>
      ))}
    </div>
  </DashboardLayout>
);

export default NotificationsPage;
