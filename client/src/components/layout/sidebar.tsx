import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { 
  Calculator, 
  LayoutDashboard, 
  Users, 
  ListTodo, 
  FileText, 
  BarChart3,
  LogOut
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Tasks & Processes", href: "/tasks", icon: ListTodo },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-40 border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">TaxConsult Pro</h1>
            <p className="text-sm text-gray-500">Client Management</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium">
                {user ? getUserInitials(user.name) : "U"}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500">Tax Consultant</p>
            </div>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-gray-600"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
