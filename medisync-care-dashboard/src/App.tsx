import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import InventoryPage from "./pages/InventoryPage";
import BuyerDashboard from "./pages/BuyerDashboard";
import OrdersPage from "./pages/OrdersPage";
import UrgentRequestsPage from "./pages/UrgentRequestsPage";
import AdminPanel from "./pages/AdminPanel";
import RedistributionPage from "./pages/RedistributionPage";
import WasteDisposalPage from "./pages/WasteDisposalPage";
import DonationsPage from "./pages/DonationsPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes - any logged in user */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

          {/* Pharmacy only */}
          <Route path="/inventory" element={<ProtectedRoute allowedRoles={["pharmacy", "admin"]}><InventoryPage /></ProtectedRoute>} />
          <Route path="/redistribution" element={<ProtectedRoute allowedRoles={["pharmacy", "admin"]}><RedistributionPage /></ProtectedRoute>} />
          <Route path="/waste-disposal" element={<ProtectedRoute allowedRoles={["pharmacy", "admin"]}><WasteDisposalPage /></ProtectedRoute>} />
          <Route path="/donations" element={<ProtectedRoute allowedRoles={["pharmacy", "admin"]}><DonationsPage /></ProtectedRoute>} />

          {/* Hospital/buyer only */}
          <Route path="/buyer" element={<ProtectedRoute allowedRoles={["hospital", "patient", "admin"]}><BuyerDashboard /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPanel /></ProtectedRoute>} />
           <Route path="/urgent" element={<ProtectedRoute><UrgentRequestsPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;