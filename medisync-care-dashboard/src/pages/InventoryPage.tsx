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
import { Plus, Trash2, Package, AlertTriangle, Tag } from "lucide-react";

interface Medicine {
  id: number;
  name: string;
  batch: string;
  expiry_date: string;
  quantity: number;
  price: number;
  discount_percent: number;
  status: string;
}

const InventoryPage = () => {
  const { token } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", batch: "", expiry_date: "", quantity: "", price: ""
  });

  const fetchMyMedicines = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/medicines/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMedicines(data);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load medicines.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyMedicines(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/medicines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          quantity: parseInt(form.quantity),
          price: parseFloat(form.price)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast({
        title: "Medicine Listed!",
        description: `Auto discount applied: ${data.discount_percent}%`
      });
      setDialogOpen(false);
      setForm({ name: "", batch: "", expiry_date: "", quantity: "", price: "" });
      fetchMyMedicines();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/medicines/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast({ title: "Deleted", description: "Medicine removed from listing." });
      fetchMyMedicines();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const getDaysToExpiry = (expiry: string) => {
    return Math.floor((new Date(expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  const getExpiryBadge = (expiry: string) => {
    const days = getDaysToExpiry(expiry);
    if (days <= 30) return <Badge variant="destructive">Expires in {days}d</Badge>;
    if (days <= 60) return <Badge className="bg-orange-500">Expires in {days}d</Badge>;
    if (days <= 90) return <Badge className="bg-yellow-500">Expires in {days}d</Badge>;
    return <Badge variant="secondary">Expires in {days}d</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Inventory</h1>
            <p className="text-muted-foreground">Manage your listed medicines</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> List Medicine</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>List a New Medicine</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 mt-2">
                <div>
                  <Label>Medicine Name</Label>
                  <Input placeholder="e.g. Paracetamol 500mg" className="mt-1"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label>Batch Number</Label>
                  <Input placeholder="e.g. B1234" className="mt-1"
                    value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} />
                </div>
                <div>
                  <Label>Expiry Date</Label>
                  <Input type="date" className="mt-1"
                    value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Quantity</Label>
                    <Input type="number" placeholder="e.g. 100" className="mt-1"
                      value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                  </div>
                  <div>
                    <Label>Price (₹)</Label>
                    <Input type="number" placeholder="e.g. 50" className="mt-1"
                      value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Discount is auto-calculated based on expiry date
                </p>
                <Button type="submit" className="w-full">List Medicine</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : medicines.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="font-medium">No medicines listed yet</p>
            <p className="text-sm text-muted-foreground">Click "List Medicine" to add your first listing</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {medicines.map((med) => (
              <Card key={med.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{med.name}</CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(med.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {med.batch && <p className="text-xs text-muted-foreground">Batch: {med.batch}</p>}
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    {getExpiryBadge(med.expiry_date)}
                    {med.discount_percent > 0 && (
                      <Badge className="bg-green-500">{med.discount_percent}% OFF</Badge>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Qty: {med.quantity}</span>
                    <span className="font-medium">
                      ₹{(med.price * (1 - med.discount_percent / 100)).toFixed(2)}
                      {med.discount_percent > 0 && (
                        <span className="ml-1 text-xs text-muted-foreground line-through">₹{med.price}</span>
                      )}
                    </span>
                  </div>
                  {med.discount_percent > 0 && (
                    <div className="flex items-center gap-1 text-xs text-orange-500">
                      <AlertTriangle className="h-3 w-3" /> Near expiry — discount applied
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InventoryPage;