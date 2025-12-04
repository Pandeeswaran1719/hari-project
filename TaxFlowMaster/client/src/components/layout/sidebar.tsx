import { Link, useLocation } from "wouter";
import { 
  Home, 
  Users, 
  CreditCard, 
  FileText, 
  Bell, 
  BarChart3,
  Settings as SettingsIcon,
  Calculator,
  IdCard
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const navigationItems = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/clients", label: "Clients", icon: Users },
  { path: "/kyc", label: "KYC & Credentials", icon: IdCard },
  { path: "/payments", label: "Fees & Payments", icon: CreditCard },
  { path: "/invoices", label: "Receipts & Invoices", icon: FileText },
  { path: "/reminders", label: "Due Dates & Reminders", icon: Bell },
  { path: "/reports", label: "Reports", icon: BarChart3 },
  { path: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar() {
  const [location] = useLocation();
  
  const { data: firmSettings } = useQuery({
    queryKey: ["/api/settings"],
  });

  return (
    <div className="w-64 bg-white dark:bg-card shadow-sm border-r border-border flex flex-col">
      {/* Logo & Firm Name */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Calculator className="text-primary-foreground text-lg" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">
              {firmSettings?.firmName || "CA Practice"}
            </h1>
            <p className="text-sm text-muted-foreground">CA Practice</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6">
        <div className="px-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-link ${
                  isActive ? "nav-link-active" : "nav-link-inactive"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <Users className="text-muted-foreground text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {firmSettings?.contactPerson || "CA Administrator"}
            </p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
