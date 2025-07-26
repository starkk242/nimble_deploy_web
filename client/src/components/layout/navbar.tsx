import { Link, useLocation } from "wouter";
import { Server, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Dashboard", page: "dashboard" },
  { path: "/upload", label: "Deploy", page: "upload" },
  { path: "/servers", label: "My APIs", page: "servers" },
  { path: "/docs", label: "Documentation", page: "docs" },
];

export default function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-200 transition-all">
                <Server className="text-white" size={16} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Nimble Deploy</span>
            </Link>
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "text-gray-600 hover:text-gray-900 font-medium transition-colors",
                    location === item.path && "text-blue-600"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700 transition-colors">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="text-gray-600" size={16} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
