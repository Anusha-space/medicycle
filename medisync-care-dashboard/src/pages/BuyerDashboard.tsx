import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

const getDaysToExpiry = (expiry: string) => {
  const date = new Date(expiry); // handles ISO format
  const diff = date.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
const BuyerDashboard = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [expiryFilter, setExpiryFilter] = useState("all");
  const [medicines, setMedicines] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  // ✅ FETCH FROM BACKEND
  useEffect(() => {
    fetch("http://localhost:5000/api/medicines")
      .then((res) => res.json())
      .then((data) => {
        setMedicines(data);

        const qty: any = {};
        data.forEach((m: any) => {
          qty[m.id] = 1;
        });
        setQuantities(qty);
      });
  }, []);

  // ✅ FILTERING
  let filtered = medicines.filter((m: any) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  if (expiryFilter === "30")
    filtered = filtered.filter(
      (m: any) => getDaysToExpiry(m.expiry_date) <= 30
    );
  else if (expiryFilter === "90")
    filtered = filtered.filter(
      (m: any) => getDaysToExpiry(m.expiry_date) <= 90
    );
  else if (expiryFilter === "180")
    filtered = filtered.filter(
      (m: any) => getDaysToExpiry(m.expiry_date) <= 180
    );

  if (sortBy === "price-asc")
    filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === "price-desc")
    filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === "expiry")
    filtered.sort(
      (a, b) =>
        getDaysToExpiry(a.expiry_date) -
        getDaysToExpiry(b.expiry_date)
    );

  // ✅ QUANTITY HANDLERS
  const increaseQty = (id: number, maxQty: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.min((prev[id] || 1) + 1, maxQty),
    }));
  };

  const decreaseQty = (id: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || 1) - 1, 1),
    }));
  };

  // ✅ PLACE ORDER
  const addToCart = async (medicineId: number) => {
    const quantity = quantities[medicineId] || 1;

    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medicine_id: medicineId,
          quantity: quantity,
        }),
      });

      await res.json();
      alert("Order placed successfully!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error placing order");
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Buyer Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Browse and purchase near-expiry medicines.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search medicines..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={expiryFilter} onValueChange={setExpiryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Expiry range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Expiry</SelectItem>
            <SelectItem value="30">Within 30 days</SelectItem>
            <SelectItem value="90">Within 90 days</SelectItem>
            <SelectItem value="180">Within 180 days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="price-asc">
              Price: Low → High
            </SelectItem>
            <SelectItem value="price-desc">
              Price: High → Low
            </SelectItem>
            <SelectItem value="expiry">
              Expiry: Soonest
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center p-10 border rounded-xl">
          No medicines found
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((m: any) => {
            const days = getDaysToExpiry(m.expiry_date);
            const urgent = days <= 30;

            return (
              <div
                key={m.id}
                className={`rounded-xl border p-5 ${
                  urgent ? "border-red-500 bg-red-50 shadow-md" : ""
                }`}
              >
                <h3 className="font-semibold">{m.name}</h3>

                <p>₹{m.price}/unit</p>
                <p>Expires: {m.expiry_date}</p>
                <p>Available: {m.quantity}</p>

                {/* Quantity */}
                <div className="flex items-center gap-2 my-3">
                  <button
                    onClick={() => decreaseQty(m.id)}
                    className="px-2 border"
                  >
                    -
                  </button>
                  <span>{quantities[m.id] || 1}</span>
                  <button
                    onClick={() => increaseQty(m.id, m.quantity)}
                    className="px-2 border"
                  >
                    +
                  </button>
                </div>

                {/* Order */}
                <Button
                  onClick={() => addToCart(m.id)}
                  className="w-full"
                >
                  Add to Cart
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default BuyerDashboard;