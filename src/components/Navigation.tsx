import { Button } from "@/components/ui/button";
import { Heart, Home, DollarSign, Calendar, MessageCircle, Settings, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'memories', label: 'Memories', icon: Heart },
    { id: 'business', label: 'Business', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
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
            <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-display font-bold gradient-text">
              Together
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
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
                Welcome, {user.user_metadata?.first_name || user.email}
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}