import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Plus, Search, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

interface Medicine {
  id: number;
  name: string;
  batch: string;
  qty: number;
  expiry: string;
  price: number;
}

const initialMedicines: Medicine[] = [
  { id: 1, name: "Paracetamol 500mg", batch: "B-20241", qty: 500, expiry: "2026-08-15", price: 45 },
  { id: 2, name: "Amoxicillin 250mg", batch: "B-20242", qty: 200, expiry: "2026-05-20", price: 120 },
  { id: 3, name: "Ibuprofen 400mg", batch: "B-20243", qty: 80, expiry: "2026-04-20", price: 30 },
  { id: 4, name: "Metformin 500mg", batch: "B-20244", qty: 1200, expiry: "2027-01-10", price: 65 },
  { id: 5, name: "Cetirizine 10mg", batch: "B-20245", qty: 150, expiry: "2026-05-30", price: 25 },
];

const getDaysToExpiry = (expiry: string) => Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

const InventoryPage = () => {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [batch, setBatch] = useState("");
  const [qty, setQty] = useState("");
  const [expiry, setExpiry] = useState("");
  const [price, setPrice] = useState("");
  const [editItem, setEditItem] = useState<Medicine | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const filtered = medicines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.batch.toLowerCase().includes(search.toLowerCase())
  );

  const validateAndAdd = () => {
    if (!name || !batch || !qty || !expiry || !price) {
      toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    if (parseInt(qty) <= 0) {
      toast({ title: "Validation Error", description: "Quantity must be greater than 0.", variant: "destructive" });
      return;
    }
    if (new Date(expiry) <= new Date()) {
      toast({ title: "Validation Error", description: "Expiry date must be in the future.", variant: "destructive" });
      return;
    }
    const newMed: Medicine = { id: Date.now(), name, batch, qty: parseInt(qty), expiry, price: parseFloat(price) };
    setMedicines(prev => [...prev, newMed]);
    setName(""); setBatch(""); setQty(""); setExpiry(""); setPrice("");
    toast({ title: "Medicine Added", description: `${name} has been added to inventory.` });
  };

  const handleDelete = (id: number) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
    toast({ title: "Deleted", description: "Medicine removed from inventory." });
  };

  const openEdit = (m: Medicine) => {
    setEditItem({ ...m });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!editItem) return;
    if (editItem.qty <= 0) {
      toast({ title: "Validation Error", description: "Quantity must be > 0.", variant: "destructive" });
      return;
    }
    setMedicines(prev => prev.map(m => m.id === editItem.id ? editItem : m));
    setEditOpen(false);
    toast({ title: "Updated", description: `${editItem.name} has been updated.` });
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
        <p className="text-sm text-muted-foreground">Add, track, and manage your medicine inventory.</p>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Add Form */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="mb-4 font-semibold text-card-foreground">Add Medicine</h3>
          <div className="space-y-4">
            <div><Label htmlFor="name">Medicine Name</Label><Input id="name" placeholder="e.g. Paracetamol 500mg" className="mt-1" value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label htmlFor="batch">Batch Number</Label><Input id="batch" placeholder="e.g. B-20250" className="mt-1" value={batch} onChange={e => setBatch(e.target.value)} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label htmlFor="qty">Quantity</Label><Input id="qty" type="number" placeholder="0" className="mt-1" value={qty} onChange={e => setQty(e.target.value)} /></div>
              <div><Label htmlFor="price">Price (₹)</Label><Input id="price" type="number" placeholder="0" className="mt-1" value={price} onChange={e => setPrice(e.target.value)} /></div>
              <div><Label htmlFor="expiry">Expiry Date</Label><Input id="expiry" type="date" className="mt-1" value={expiry} onChange={e => setExpiry(e.target.value)} /></div>
            </div>
            <Button className="w-full gap-2" onClick={validateAndAdd}><Plus className="h-4 w-4" /> Add Medicine</Button>
          </div>
        </div>

        {/* CSV Upload */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="mb-4 font-semibold text-card-foreground">Bulk Upload</h3>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
            <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="mb-1 text-sm font-medium text-card-foreground">Upload CSV File</p>
            <p className="mb-4 text-xs text-muted-foreground">Drag and drop or click to browse</p>
            <Button variant="outline" size="sm">Browse Files</Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-card">
        <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-semibold text-card-foreground">All Medicines</h3>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search medicines..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Batch</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Qty</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Price</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Expiry</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((m) => {
                const days = getDaysToExpiry(m.expiry);
                const urgent = days <= 30;
                const expiringSoon = days > 30 && days <= 90;
                return (
                  <tr key={m.id} className={`border-b last:border-0 ${urgent ? "bg-destructive/5" : ""}`}>
                    <td className="px-5 py-3 font-medium text-card-foreground">{m.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{m.batch}</td>
                    <td className="px-5 py-3 text-muted-foreground">{m.qty}</td>
                    <td className="px-5 py-3 text-muted-foreground">₹{m.price}</td>
                    <td className="px-5 py-3 text-muted-foreground">{m.expiry}</td>
                    <td className="px-5 py-3">
                      {urgent ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                          <AlertTriangle className="h-3 w-3" /> Urgent
                        </span>
                      ) : expiringSoon ? (
                        <span className="inline-flex rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">Expiring Soon</span>
                      ) : (
                        <span className="inline-flex rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">Normal</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(m)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(m.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Medicine</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div><Label>Name</Label><Input className="mt-1" value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })} /></div>
              <div><Label>Batch</Label><Input className="mt-1" value={editItem.batch} onChange={e => setEditItem({ ...editItem, batch: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Qty</Label><Input type="number" className="mt-1" value={editItem.qty} onChange={e => setEditItem({ ...editItem, qty: parseInt(e.target.value) || 0 })} /></div>
                <div><Label>Price</Label><Input type="number" className="mt-1" value={editItem.price} onChange={e => setEditItem({ ...editItem, price: parseFloat(e.target.value) || 0 })} /></div>
                <div><Label>Expiry</Label><Input type="date" className="mt-1" value={editItem.expiry} onChange={e => setEditItem({ ...editItem, expiry: e.target.value })} /></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default InventoryPage;
