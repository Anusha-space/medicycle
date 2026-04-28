import { NavLink as RouterNavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, Trash2, Heart, Bell, Activity, LogOut,
  ChevronLeft, ChevronRight, ShoppingCart, ClipboardList, ShieldCheck,
  AlertTriangle, RefreshCw, User
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Role-based nav items
  const navItems = [
    // All roles
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["pharmacy", "hospital", "patient", "admin"] },
    { to: "/notifications", icon: Bell, label: "Notifications", roles: ["pharmacy", "hospital", "patient", "admin"] },
    { to: "/orders", icon: ClipboardList, label: "My Orders", roles: ["hospital", "patient", "admin"] },

    // Pharmacy only
    { to: "/inventory", icon: Package, label: "Inventory", roles: ["pharmacy", "admin"] },
    { to: "/redistribution", icon: RefreshCw, label: "Redistribution", roles: ["pharmacy", "admin"] },
    { to: "/waste-disposal", icon: Trash2, label: "Waste Disposal", roles: ["pharmacy", "admin"] },
    { to: "/donations", icon: Heart, label: "Donations", roles: ["pharmacy", "admin"] },

    // Hospital/patient only
    { to: "/buyer", icon: ShoppingCart, label: "Browse Medicines", roles: ["hospital", "patient", "admin"] },

    // Urgent requests - hospital posts, pharmacy fulfils
    { to: "/urgent", icon: AlertTriangle, label: "Urgent Requests", roles: ["pharmacy", "hospital", "admin"] },

    // Admin only
    { to: "/admin", icon: ShieldCheck, label: "Admin Panel", roles: ["admin"] },
  ];

  const visibleItems = navItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case "pharmacy": return "bg-blue-100 text-blue-700";
      case "hospital": return "bg-red-100 text-red-700";
      case "patient": return "bg-green-100 text-green-700";
      case "admin": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className={cn(
        "sticky top-0 flex h-screen flex-col border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}>
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="text-lg font-bold text-sidebar-foreground">MediCycle</span>}
        </div>

        {/* User info */}
        {!collapsed && user && (
          <div className="border-b border-sidebar-border px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-sidebar-foreground">{user.name}</p>
                <span className={cn("rounded px-1.5 py-0.5 text-xs font-medium capitalize", getRoleBadgeColor(user.role))}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <RouterNavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", item.to === "/urgent" && "text-red-500")} />
                {!collapsed && (
                  <span className={cn(item.to === "/urgent" && "text-red-500")}>
                    {item.label}
                  </span>
                )}
              </RouterNavLink>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-sidebar-border p-3 space-y-1">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            {collapsed
              ? <ChevronRight className="h-5 w-5" />
              : <><ChevronLeft className="h-5 w-5 shrink-0" /><span>Collapse</span></>
            }
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;