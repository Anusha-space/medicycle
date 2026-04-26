import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Search, ShoppingCart, AlertTriangle, Store } from "lucide-react";

interface Medicine {
  id: number;
  name: string;
  batch: string;
  expiry_date: string;
  quantity: number;
  price: number;
  discount_percent: number;
  status: string;
  pharmacy_name: string;
  pharmacy_phone: string;
}

const BuyerDashboard = () => {
  const { token } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filtered, setFiltered] = useState<Medicine[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState<number | null>(null);

  const fetchMedicines = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/medicines");
      const data = await res.json();
      setMedicines(data);
      setFiltered(data);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load medicines.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedicines(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(medicines.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.pharmacy_name?.toLowerCase().includes(q)
    ));
  }, [search, medicines]);

  const handleOrder = async (medicine: Medicine) => {
    setOrdering(medicine.id);
    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          medicine_id: medicine.id,
          quantity: 1,
          total_price: medicine.price * (1 - medicine.discount_percent / 100)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast({ title: "Order Placed!", description: `Successfully ordered ${medicine.name}` });
      fetchMedicines();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setOrdering(null);
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
        <div>
          <h1 className="text-2xl font-bold">Browse Medicines</h1>
          <p className="text-muted-foreground">Find discounted near-expiry medicines from verified pharmacies</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by medicine name or pharmacy..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold">{medicines.length}</p>
              <p className="text-xs text-muted-foreground">Available Medicines</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-orange-500">
                {medicines.filter(m => getDaysToExpiry(m.expiry_date) <= 30).length}
              </p>
              <p className="text-xs text-muted-foreground">Expiring Soon (40% off)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-green-500">
                {medicines.filter(m => m.discount_percent > 0).length}
              </p>
              <p className="text-xs text-muted-foreground">Discounted Medicines</p>
            </CardContent>
          </Card>
        </div>

        {/* Medicine Cards */}
        {loading ? (
          <p className="text-muted-foreground">Loading medicines...</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
            <Store className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="font-medium">No medicines found</p>
            <p className="text-sm text-muted-foreground">Try a different search term</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((med) => (
              <Card key={med.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{med.name}</CardTitle>
                    {med.discount_percent > 0 && (
                      <Badge className="bg-green-500">{med.discount_percent}% OFF</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Store className="h-3 w-3" />
                    {med.pharmacy_name || "Pharmacy"}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    {getExpiryBadge(med.expiry_date)}
                    <span className="text-xs text-muted-foreground">Qty: {med.quantity}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold">
                        ₹{(med.price * (1 - med.discount_percent / 100)).toFixed(2)}
                      </span>
                      {med.discount_percent > 0 && (
                        <span className="ml-2 text-sm text-muted-foreground line-through">₹{med.price}</span>
                      )}
                    </div>
                  </div>

                  {med.discount_percent > 0 && (
                    <div className="flex items-center gap-1 text-xs text-orange-500">
                      <AlertTriangle className="h-3 w-3" /> Near expiry — verified safe to use
                    </div>
                  )}

                  <Button
                    className="w-full gap-2"
                    onClick={() => handleOrder(med)}
                    disabled={ordering === med.id}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {ordering === med.id ? "Placing Order..." : "Order Now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BuyerDashboard;