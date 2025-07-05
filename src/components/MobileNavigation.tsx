import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, Home, DollarSign, Calendar, MessageCircle, Settings, Menu, LogOut, 
  TrendingUp, Users, UserCheck, Clock, Package, CheckCircle, Receipt, 
  BarChart3, Target, Download, Mail, Upload, Webhook, Zap
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { BusinessSelector } from "./business/BusinessSelector";

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function MobileNavigation({ activeTab, onTabChange }: MobileNavigationProps) {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const navSections = [
    {
      title: "Dashboard",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home }
      ]
    },
    {
      title: "Sales & CRM",
      items: [
        { id: 'sales', label: 'Sales', icon: TrendingUp },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'leads', label: 'Leads', icon: UserCheck }
      ]
    },
    {
      title: "HR & People",
      items: [
        { id: 'employees', label: 'Employees', icon: Users },
        { id: 'payroll', label: 'Payroll', icon: DollarSign },
        { id: 'leave', label: 'Leave', icon: Calendar },
        { id: 'reviews', label: 'Reviews', icon: TrendingUp },
        { id: 'time-tracker', label: 'Time Tracker', icon: Clock }
      ]
    },
    {
      title: "Inventory & Operations",
      items: [
        { id: 'products', label: 'Products', icon: Package },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'projects', label: 'Projects', icon: Calendar },
        { id: 'tasks', label: 'Tasks', icon: CheckCircle }
      ]
    },
    {
      title: "Financial",
      items: [
        { id: 'finance', label: 'Finance', icon: DollarSign },
        { id: 'banking', label: 'Banking', icon: DollarSign },
        { id: 'assets', label: 'Assets', icon: Home },
        { id: 'debts', label: 'Debts', icon: DollarSign },
        { id: 'forecasting', label: 'Forecasts', icon: Calendar },
        { id: 'invoices', label: 'Invoices', icon: Receipt },
        { id: 'payments', label: 'Payments', icon: DollarSign }
      ]
    },
    {
      title: "Analytics",
      items: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'kpis', label: 'KPIs', icon: Target },
        { id: 'reports', label: 'Reports', icon: Calendar },
        { id: 'export', label: 'Export', icon: Download }
      ]
    },
    {
      title: "Integrations",
      items: [
        { id: 'emails', label: 'Email Templates', icon: Mail },
        { id: 'files', label: 'File Manager', icon: Upload },
        { id: 'webhooks', label: 'Webhooks', icon: Webhook },
        { id: 'integrations', label: 'Integrations', icon: Zap }
      ]
    },
    {
      title: "Personal",
      items: [
        { id: 'memories', label: 'Memories', icon: Heart },
        { id: 'mood', label: 'Mood', icon: Heart },
        { id: 'business', label: 'Business', icon: Calendar },
        { id: 'messages', label: 'Messages', icon: MessageCircle }
      ]
    }
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
  };

  const handleNavigation = (tabId: string) => {
    onTabChange(tabId);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <SheetTitle className="text-left font-display gradient-text">
                MarcLyn Business Hub
              </SheetTitle>
              {user && (
                <p className="text-sm text-muted-foreground">
                  {user.user_metadata?.first_name === 'Marc' ? 'Boss Marc' : 
                   user.user_metadata?.first_name === 'Lyn' ? 'Madam Lyn' : 
                   user.user_metadata?.first_name || user.email}
                </p>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="px-6 pb-4">
          <BusinessSelector />
        </div>

        <Separator />

        <ScrollArea className="flex-1 px-6">
          <div className="py-4 space-y-6">
            {navSections.map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  {section.title}
                </h4>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => handleNavigation(item.id)}
                        className="w-full justify-start h-10"
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        <span>{item.label}</span>
                        {isActive && (
                          <Badge variant="secondary" className="ml-auto">
                            Active
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => handleNavigation('settings')}
              className="flex-1 justify-start"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}