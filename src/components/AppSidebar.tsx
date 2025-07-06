import { useState } from "react";
import { useLocation } from "react-router-dom";
import { 
  Heart, 
  Home, 
  DollarSign, 
  Calendar, 
  MessageCircle, 
  Settings, 
  TrendingUp, 
  Users, 
  UserCheck, 
  Clock, 
  Package, 
  CheckCircle, 
  Receipt, 
  BarChart3, 
  Target, 
  Download, 
  Mail, 
  Upload, 
  Webhook, 
  Zap,
  Search,
  Database,
  Shield,
  Activity,
  Building2,
  Briefcase,
  CreditCard,
  FileText,
  Folder,
  PieChart,
  Bell
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { BusinessSelector } from "./business/BusinessSelector";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { state } = useSidebar();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const collapsed = state === "collapsed";

  // Navigation groups for better organization
  const navigationGroups = [
    {
      label: "Overview",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
      ]
    },
    {
      label: "Sales & CRM",
      items: [
        { id: 'sales', label: 'Sales Dashboard', icon: TrendingUp },
        { id: 'opportunities', label: 'Opportunities', icon: Target },
        { id: 'pipeline', label: 'Sales Pipeline', icon: TrendingUp },
        { id: 'quotes', label: 'Quotes', icon: FileText },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'leads', label: 'Leads', icon: UserCheck },
      ]
    },
    {
      label: "Human Resources",
      items: [
        { id: 'employees', label: 'Employees', icon: Users },
        { id: 'payroll', label: 'Payroll', icon: DollarSign },
        { id: 'leave', label: 'Leave Management', icon: Calendar },
        { id: 'reviews', label: 'Performance Reviews', icon: Target },
        { id: 'time-tracker', label: 'Time Tracker', icon: Clock },
      ]
    },
    {
      label: "Inventory & Projects",
      items: [
        { id: 'products', label: 'Product Catalog', icon: Package },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'projects', label: 'Projects', icon: Folder },
        { id: 'tasks', label: 'Tasks', icon: CheckCircle },
      ]
    },
    {
      label: "Financial Management",
      items: [
        { id: 'finance', label: 'Finance Dashboard', icon: PieChart },
        { id: 'budgets', label: 'Budget Management', icon: PieChart },
        { id: 'banking', label: 'Banking', icon: CreditCard },
        { id: 'assets', label: 'Assets', icon: Building2 },
        { id: 'debts', label: 'Debts', icon: CreditCard },
        { id: 'forecasting', label: 'Forecasting', icon: TrendingUp },
        { id: 'invoices', label: 'Invoices', icon: Receipt },
        { id: 'payments', label: 'Payments', icon: DollarSign },
      ]
    },
    {
      label: "Analytics & Reports",
      items: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'kpis', label: 'KPI Dashboard', icon: Target },
        { id: 'reports', label: 'Custom Reports', icon: FileText },
        { id: 'export', label: 'Data Export', icon: Download },
      ]
    },
    {
      label: "Integrations & Tools",
      items: [
        { id: 'emails', label: 'Email Templates', icon: Mail },
        { id: 'files', label: 'File Manager', icon: Upload },
        { id: 'webhooks', label: 'Webhooks', icon: Webhook },
        { id: 'integrations', label: 'Integrations', icon: Zap },
        { id: 'search', label: 'Global Search', icon: Search },
        { id: 'bulk', label: 'Bulk Operations', icon: Database },
      ]
    },
    {
      label: "Security & Performance",
      items: [
        { id: 'security', label: 'Advanced Security', icon: Shield },
        { id: 'performance', label: 'Performance Monitor', icon: Activity },
      ]
    },
    {
      label: "System & Alerts", 
      items: [
        { id: 'notifications', label: 'Notifications', icon: Bell },
      ]
    },
    {
      label: "Personal & Relationship",
      items: [
        { id: 'memories', label: 'Memory Gallery', icon: Heart },
        { id: 'mood', label: 'Mood Sharing', icon: Heart },
        { id: 'messages', label: 'Messages', icon: MessageCircle },
        { id: 'business', label: 'Business Hub', icon: Briefcase },
      ]
    },
    {
      label: "Management",
      items: [
        { id: 'business-manager', label: 'Business Manager', icon: Building2 },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  const isActive = (itemId: string) => activeTab === itemId;

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
  };

  return (
    <Sidebar className="border-r" collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-lg flex-shrink-0">
            <Heart className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate">MarcLyn</span>
              <span className="text-xs text-muted-foreground truncate">Business Hub</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        {/* Business Selector */}
        <div className="p-2 border-b">
          <BusinessSelector />
        </div>

        {/* Navigation Groups */}
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">
              {!collapsed && group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.id);
                  
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => onTabChange(item.id)}
                        isActive={active}
                        tooltip={collapsed ? item.label : undefined}
                        className="w-full justify-start"
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          {!collapsed && user && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.user_metadata?.first_name === 'Marc' 
                  ? 'Boss Marc' 
                  : user.user_metadata?.first_name === 'Lyn' 
                  ? 'Madam Lyn' 
                  : user.user_metadata?.first_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={handleSignOut}
            className="flex-shrink-0"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}