import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  CheckSquare, 
  Camera,
  MessageCircle,
  Users,
  PlusCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface DashboardStats {
  totalTransactions: number;
  totalMemories: number;
  pendingTasks: number;
  totalMessages: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTransactions: 0,
    totalMemories: 0,
    pendingTasks: 0,
    totalMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [transactionsRes, memoriesRes, tasksRes, messagesRes] = await Promise.all([
        supabase.from('transactions').select('id', { count: 'exact', head: true }),
        supabase.from('memories').select('id', { count: 'exact', head: true }),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalTransactions: transactionsRes.count || 0,
        totalMemories: memoriesRes.count || 0,
        pendingTasks: tasksRes.count || 0,
        totalMessages: messagesRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold gradient-text">
            Welcome Back, {user?.user_metadata?.first_name || 'Partner'}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening in your shared workspace
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-primary" />
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Connected
          </Badge>
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary to-secondary text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <img 
          src={heroImage} 
          alt="Together - Couple's Collaboration" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="relative container mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Together
              <Heart className="inline-block ml-3 text-secondary floating-heart" size={48} />
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Your shared digital workspace for managing business ventures and strengthening your relationship
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="coral">
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-16 relative z-10">
          <Card className="card-elegant text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gradient-to-r from-success to-success/80 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-success mb-2">$12,450</h3>
              <p className="text-muted-foreground">Monthly Income</p>
            </CardContent>
          </Card>

          <Card className="card-elegant text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">8/12</h3>
              <p className="text-muted-foreground">Tasks Completed</p>
            </CardContent>
          </Card>

          <Card className="card-elegant text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gradient-to-r from-secondary to-secondary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-secondary mb-2">847</h3>
              <p className="text-muted-foreground">Days Together</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feature Overview */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Everything you need</span> in one place
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage your finances, grow your business, and strengthen your relationship with tools designed for couples
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Financial Management */}
          <Card className="card-elegant group hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-success to-success/80 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="text-white" size={24} />
              </div>
              <CardTitle className="text-xl">Financial Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Track expenses, set budgets, and plan your financial future together
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Budgeting</Badge>
                <Badge variant="secondary">Analytics</Badge>
                <Badge variant="secondary">Goals</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Business Collaboration */}
          <Card className="card-elegant group hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-light rounded-lg flex items-center justify-center mb-4">
                <CheckSquare className="text-white" size={24} />
              </div>
              <CardTitle className="text-xl">Business Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Manage tasks, share documents, and grow your business ventures
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Tasks</Badge>
                <Badge variant="secondary">Documents</Badge>
                <Badge variant="secondary">Analytics</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Relationship Features */}
          <Card className="card-elegant group hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-secondary to-secondary-light rounded-lg flex items-center justify-center mb-4">
                <Heart className="text-white" size={24} />
              </div>
              <CardTitle className="text-xl">Relationship Hub</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Capture memories, plan dates, and strengthen your connection
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Memories</Badge>
                <Badge variant="secondary">Planning</Badge>
                <Badge variant="secondary">Messages</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Memory Gallery */}
          <Card className="card-elegant group hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-warning to-warning/80 rounded-lg flex items-center justify-center mb-4">
                <Camera className="text-white" size={24} />
              </div>
              <CardTitle className="text-xl">Memory Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Store and organize your precious moments and shared experiences
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Photos</Badge>
                <Badge variant="secondary">Videos</Badge>
                <Badge variant="secondary">Timeline</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Communication */}
          <Card className="card-elegant group hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-primary-lighter to-secondary-lighter rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="text-white" size={24} />
              </div>
              <CardTitle className="text-xl">Real-time Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Stay connected with instant messaging and voice notes
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Instant</Badge>
                <Badge variant="secondary">Voice</Badge>
                <Badge variant="secondary">Secure</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Getting Started */}
          <Card className="card-elegant group hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl gradient-text">Ready to start?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Join thousands of couples already using Together to build their dreams
              </p>
              <Button className="w-full" variant="elegant">
                Start Your Journey
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;