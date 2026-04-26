import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle, Plus, Clock, CheckCircle, Building2, Trash2 } from "lucide-react";

interface UrgentRequest {
  id: number;
  hospital_id: number;
  hospital_name: string;
  hospital_phone: string;
  medicine_name: string;
  quantity: number;
  deadline: string;
  notes: string;
  status: string;
  created_at: string;
}

const UrgentRequestsPage = () => {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState<UrgentRequest[]>([]);
  const [myRequests, setMyRequests] = useState<UrgentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fulfilling, setFulfilling] = useState<number | null>(null);
  const [form, setForm] = useState({
    medicine_name: "", quantity: "", deadline: "", notes: ""
  });

  const isHospital = user?.role === "hospital" || user?.role === "admin";
  const isPharmacy = user?.role === "pharmacy" || user?.role === "admin";

  const fetchRequests = async () => {
    try {
      // All open requests (for pharmacies)
      const res = await fetch("http://localhost:5000/api/urgent", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRequests(data);

      // My requests (for hospitals)
      if (isHospital) {
        const myRes = await fetch("http://localhost:5000/api/urgent/my", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const myData = await myRes.json();
        setMyRequests(myData);
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load requests.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/urgent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          quantity: parseInt(form.quantity)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast({ title: "Urgent Request Posted!", description: "Pharmacies will be notified." });
      setDialogOpen(false);
      setForm({ medicine_name: "", quantity: "", deadline: "", notes: "" });
      fetchRequests();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleFulfil = async (id: number) => {
    setFulfilling(id);
    try {
      const res = await fetch(`http://localhost:5000/api/urgent/${id}/fulfil`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast({ title: "Marked as Fulfilled!", description: "The hospital has been helped." });
      fetchRequests();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setFulfilling(null);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/urgent/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast({ title: "Request Cancelled." });
      fetchRequests();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const getDeadlineBadge = (deadline: string) => {
    const hours = Math.floor((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60));
    if (hours < 0) return <Badge variant="destructive">Overdue</Badge>;
    if (hours <= 6) return <Badge variant="destructive">Due in {hours}h</Badge>;
    if (hours <= 24) return <Badge className="bg-orange-500">Due in {hours}h</Badge>;
    const days = Math.floor(hours / 24);
    return <Badge className="bg-yellow-500">Due in {days}d</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              Urgent Requests
            </h1>
            <p className="text-muted-foreground">
              {isHospital ? "Post urgent medicine needs" : "Help hospitals in need"}
            </p>
          </div>
          {isHospital && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Plus className="h-4 w-4" /> Post Urgent Need
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Post Urgent Medicine Request</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePost} className="space-y-4 mt-2">
                  <div>
                    <Label>Medicine Name</Label>
                    <Input placeholder="e.g. Insulin 100IU" className="mt-1"
                      value={form.medicine_name}
                      onChange={(e) => setForm({ ...form, medicine_name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Quantity Needed</Label>
                    <Input type="number" placeholder="e.g. 50" className="mt-1"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                  </div>
                  <div>
                    <Label>Deadline</Label>
                    <Input type="datetime-local" className="mt-1"
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                  </div>
                  <div>
                    <Label>Additional Notes</Label>
                    <Input placeholder="Any specific requirements..." className="mt-1"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                  <Button type="submit" variant="destructive" className="w-full">
                    Post Urgent Request
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Hospital's own requests */}
        {isHospital && myRequests.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">My Requests</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {myRequests.map((req) => (
                <Card key={req.id} className="border-red-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{req.medicine_name}</CardTitle>
                      <Badge variant={req.status === 'fulfilled' ? 'default' : req.status === 'cancelled' ? 'secondary' : 'destructive'}>
                        {req.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">Qty needed: {req.quantity}</p>
                    {getDeadlineBadge(req.deadline)}
                    {req.notes && <p className="text-xs text-muted-foreground">{req.notes}</p>}
                    {req.status === 'open' && (
                      <Button variant="outline" size="sm" className="w-full gap-2 text-destructive"
                        onClick={() => handleCancel(req.id)}>
                        <Trash2 className="h-3 w-3" /> Cancel Request
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All open requests */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            {isPharmacy ? "Open Requests — Can You Help?" : "All Open Requests"}
          </h2>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
              <p className="font-medium">No urgent requests right now</p>
              <p className="text-sm text-muted-foreground">All hospitals are well stocked!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {requests.map((req) => (
                <Card key={req.id} className="border-red-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base text-red-600">{req.medicine_name}</CardTitle>
                      {getDeadlineBadge(req.deadline)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      {req.hospital_name}
                      {req.hospital_phone && ` · ${req.hospital_phone}`}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Needs {req.quantity} units</span>
                    </div>
                    {req.notes && (
                      <p className="text-xs text-muted-foreground bg-muted rounded p-2">{req.notes}</p>
                    )}
                    {isPharmacy && (
                      <Button
                        className="w-full gap-2 bg-red-500 hover:bg-red-600"
                        onClick={() => handleFulfil(req.id)}
                        disabled={fulfilling === req.id}
                      >
                        <CheckCircle className="h-4 w-4" />
                        {fulfilling === req.id ? "Processing..." : "I Can Fulfil This"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UrgentRequestsPage;