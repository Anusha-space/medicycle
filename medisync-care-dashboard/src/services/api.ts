// API service file - placeholder endpoints ready for Node.js + Express backend integration
const API_BASE = "/api";

export interface Medicine {
  id: number;
  name: string;
  batch: string;
  expiry: string;
  quantity: number;
  price: number;
  seller?: string;
  status?: "Normal" | "Expiring Soon" | "Urgent";
}

export interface Order {
  id: number;
  medicineId: number;
  medicineName: string;
  buyer: string;
  seller: string;
  quantity: number;
  total: number;
  status: "Pending" | "Confirmed" | "Delivered";
  date: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "pharmacy" | "buyer" | "admin";
}

// Medicine APIs
export const getMedicines = async (): Promise<Medicine[]> => {
  // return fetch(`${API_BASE}/medicines`).then(r => r.json());
  return Promise.resolve([]);
};

export const addMedicine = async (medicine: Omit<Medicine, "id">): Promise<Medicine> => {
  // return fetch(`${API_BASE}/medicines`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(medicine) }).then(r => r.json());
  return Promise.resolve({ id: Date.now(), ...medicine });
};

export const updateMedicine = async (id: number, medicine: Partial<Medicine>): Promise<Medicine> => {
  // return fetch(`${API_BASE}/medicines/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(medicine) }).then(r => r.json());
  return Promise.resolve({ id, ...medicine } as Medicine);
};

export const deleteMedicine = async (id: number): Promise<void> => {
  // return fetch(`${API_BASE}/medicines/${id}`, { method: "DELETE" });
  return Promise.resolve();
};

// Order APIs
export const getOrders = async (): Promise<Order[]> => {
  // return fetch(`${API_BASE}/orders`).then(r => r.json());
  return Promise.resolve([]);
};

export const placeOrder = async (order: Omit<Order, "id">): Promise<Order> => {
  // return fetch(`${API_BASE}/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order) }).then(r => r.json());
  return Promise.resolve({ id: Date.now(), ...order });
};

// Auth APIs
export const login = async (email: string, password: string): Promise<User> => {
  // return fetch(`${API_BASE}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) }).then(r => r.json());
  return Promise.resolve({ id: 1, name: "Demo User", email, role: "pharmacy" });
};

export const signup = async (name: string, email: string, password: string, role: string): Promise<User> => {
  // return fetch(`${API_BASE}/auth/signup`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password, role }) }).then(r => r.json());
  return Promise.resolve({ id: 1, name, email, role: role as User["role"] });
};
