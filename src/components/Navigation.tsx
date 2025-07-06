import { Button } from "@/components/ui/button";
import { Heart, Home, DollarSign, Calendar, MessageCircle, Settings, LogOut, TrendingUp, Users, UserCheck, Clock, Package, CheckCircle, Receipt, BarChart3, Target, Download, Mail, Upload, Webhook, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { BusinessSelector } from "./business/BusinessSelector";
import MobileNavigation from "./MobileNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'leads', label: 'Leads', icon: UserCheck },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
    { id: 'leave', label: 'Leave', icon: Calendar },
    { id: 'reviews', label: 'Reviews', icon: TrendingUp },
    { id: 'time-tracker', label: 'Time Tracker', icon: Clock },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'banking', label: 'Banking', icon: DollarSign },
    { id: 'assets', label: 'Assets', icon: Home },
    { id: 'debts', label: 'Debts', icon: DollarSign },
    { id: 'forecasting', label: 'Forecasts', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'kpis', label: 'KPIs', icon: Target },
    { id: 'reports', label: 'Reports', icon: Calendar },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'emails', label: 'Email Templates', icon: Mail },
    { id: 'files', label: 'File Manager', icon: Upload },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'business-manager', label: 'Businesses', icon: Home },
    { id: 'projects', label: 'Projects', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'memories', label: 'Memories', icon: Heart },
    { id: 'mood', label: 'Mood', icon: Heart },
    { id: 'business', label: 'Business', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
  };

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-white p-1 rounded-lg">
              <img src="/lovable-uploads/3ae2e94d-ea70-4647-b5f1-5691b43b8b1d.png" alt="Silver Connect" className="h-8 w-8" />
            </div>
            <span className="ml-3 text-xl font-display font-bold gradient-text">
              Silver Connect
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <BusinessSelector />
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange(item.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user.user_metadata?.first_name === 'Marc' ? 'Boss Marc' : user.user_metadata?.first_name === 'Lyn' ? 'Madam Lyn' : user.user_metadata?.first_name || user.email}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <MobileNavigation activeTab={activeTab} onTabChange={onTabChange} />
        </div>
      </div>
    </nav>
  );
}