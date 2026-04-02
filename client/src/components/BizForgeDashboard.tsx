import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  Zap,
  Palette,
  Globe,
  DollarSign,
  Megaphone,
  LogOut,
  Menu,
  X,
  Home,
  Settings,
} from "lucide-react";

interface BizForgeDashboardProps {
  children: React.ReactNode;
}

export default function BizForgeDashboard({ children }: BizForgeDashboardProps) {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">BizForge AI</h1>
          <p className="text-muted-foreground mb-8 text-sm sm:text-base">
            Build a business in minutes, scale forever.
          </p>
          <a href={getLoginUrl()}>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Sign In to Continue
            </Button>
          </a>
        </div>
      </div>
    );
  }

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/",
    },
    {
      id: "branding",
      label: "Branding Engine",
      icon: Palette,
      path: "/branding",
    },
    {
      id: "website",
      label: "Website Generator",
      icon: Globe,
      path: "/website",
    },
    {
      id: "pricing",
      label: "Pricing Calculator",
      icon: DollarSign,
      path: "/pricing",
    },
    {
      id: "leads",
      label: "Lead Generation",
      icon: Megaphone,
      path: "/leads",
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-foreground">BizForge</span>
            <span className="text-xs text-muted-foreground">AI</span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 hover:bg-muted rounded-lg transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar - Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-screen md:h-auto bg-card border-r border-border transition-all duration-300 flex flex-col z-50 md:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo Section - Desktop Only */}
        <div className="hidden md:flex p-4 border-b border-border items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-foreground">BizForge</span>
              <span className="text-xs text-muted-foreground">AI</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-border p-4 space-y-2">
          <button
            onClick={() => handleNavigation("/settings")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-left"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Logout</span>
          </button>
          {user && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Bar - Desktop Only */}
        <header className="hidden md:flex bg-card border-b border-border px-4 sm:px-6 py-4 items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
              {navigationItems.find((item) => item.path === location)?.label ||
                "BizForge AI"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Build your business concept with AI
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 ml-4 flex-shrink-0">
            {user && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            )}
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="p-3 sm:p-4 md:p-6 w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
