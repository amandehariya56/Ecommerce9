// src/components/layout/Sidebar.jsx
import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  User,
  Layers3,
  Users,
  ShieldCheck,
  BookOpenCheck,
  Settings,
  LogOut,
  ShoppingCart,
  BarChart3,
  FileText,
  Home,
  Store,
  Tag,
  UserCheck,
  Activity,
  TrendingUp,
  ShoppingBag,
  Grid3X3
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  // Dynamic navigation items based on user role
  const navigationItems = [
    {
      title: "Main",
      items: [
        {
          to: "/dashboard",
          icon: <LayoutDashboard size={20} />,
          label: "Dashboard",
          description: "Overview & Analytics"
        }
      ]
    },
    {
      title: "E-Commerce",
      items: [
        {
          to: "/categories",
          icon: <Grid3X3 size={20} />,
          label: "Categories",
          description: "Manage Categories"
        },
        {
          to: "/subcategories",
          icon: <Tag size={20} />,
          label: "Subcategories",
          description: "Manage Subcategories"
        },
        {
          to: "/products",
          icon: <ShoppingBag size={20} />,
          label: "Products",
          description: "Manage Products"
        }
      ]
    },
    {
      title: "User Management",
      items: [
        {
          to: "/users",
          icon: <Users size={20} />,
          label: "Users",
          description: "Manage Users"
        },
        {
          to: "/roles",
          icon: <ShieldCheck size={20} />,
          label: "Roles",
          description: "Manage Roles"
        }
      ]
    },
    {
      title: "Analytics",
      items: [
        {
          to: "/analytics",
          icon: <BarChart3 size={20} />,
          label: "Analytics",
          description: "Sales & Reports"
        },
        {
          to: "/orders",
          icon: <ShoppingCart size={20} />,
          label: "Orders",
          description: "Manage Orders"
        }
      ]
    }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col justify-between fixed left-0 top-0 shadow-2xl border-r border-purple-700/30">
      {/* Header with Beautiful Logo */}
      <div>
        <div className="flex items-center gap-3 px-6 py-6 border-b border-purple-700/30">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Store size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ShopHub
            </h1>
            <p className="text-xs text-purple-300">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 space-y-6">
          {navigationItems.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-3 px-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <SidebarLink
                    key={itemIndex}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    description={item.description}
                    isActive={location.pathname === item.to}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer - User Profile */}
      <div className="px-4 pb-6">
        <div className="bg-purple-800/30 rounded-xl p-4 border border-purple-700/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">
                {user?.name || user?.email || 'Admin User'}
              </h4>
              <p className="text-xs text-purple-300 truncate">
                {user?.email || 'admin@shophub.com'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-sm text-red-300 hover:text-red-100 hover:bg-red-500/20 px-3 py-2 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// Enhanced sidebar link with active state and tooltip
function SidebarLink({ to, icon, label, description, isActive }) {
  return (
    <Link
      to={to}
      className={`group flex items-center gap-3 text-sm px-3 py-3 rounded-xl transition-all duration-200 relative ${
        isActive
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
          : 'text-purple-200 hover:bg-purple-800/50 hover:text-white'
      }`}
      title={description}
    >
      <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <span className="font-medium">{label}</span>
        {description && (
          <p className="text-xs text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {description}
          </p>
        )}
      </div>
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
      )}
    </Link>
  );
}
