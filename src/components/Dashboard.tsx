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
import TransactionForm from "@/components/transactions/TransactionForm";
import TaskForm from "@/components/tasks/TaskForm";
import MemoryForm from "@/components/memories/MemoryForm";

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

  const quickActions = [
    { 
      label: "Financial Record", 
      icon: DollarSign, 
      gradient: "from-success to-success/80",
      description: "Business transactions PHP/AED"
    },
    { 
      label: "Archive Memory", 
      icon: Camera, 
      gradient: "from-secondary to-secondary-light",
      description: "Document important moments"
    },
    { 
      label: "Business Task", 
      icon: CheckSquare, 
      gradient: "from-primary to-primary-light",
      description: "Manage operations efficiently"
    },
    { 
      label: "Professional Message", 
      icon: MessageCircle, 
      gradient: "from-primary-lighter to-secondary-lighter",
      description: "Business communication"
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold gradient-text">
            {user?.user_metadata?.first_name === 'Marc' ? 'Welcome, Boss Marc' : user?.user_metadata?.first_name === 'Lyn' ? 'Good day, Madam Lyn' : `Welcome, ${user?.user_metadata?.first_name || 'Business Partner'}`}
          </h1>
          <p className="text-muted-foreground mt-2">
            Dubai & Philippines Business Operations Dashboard
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            🇵🇭 Philippines
          </Badge>
          <Badge variant="outline" className="border-secondary/30 text-secondary">
            🇦🇪 Dubai
          </Badge>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Partnership</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">₱ PHP / د.إ AED Records</p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memories</CardTitle>
            <Heart className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalMemories}</div>
            <p className="text-xs text-muted-foreground">Business milestones</p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Priority Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Require immediate action</p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-primary-lighter" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">Professional exchanges</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Execute business operations efficiently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TransactionForm 
              trigger={
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-success to-success/80 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Financial Record</p>
                    <p className="text-xs text-muted-foreground">Business transactions PHP/AED</p>
                  </div>
                </Button>
              }
            />
            <MemoryForm 
              trigger={
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-secondary to-secondary-light rounded-full flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Archive Memory</p>
                    <p className="text-xs text-muted-foreground">Document important moments</p>
                  </div>
                </Button>
              }
            />
            <TaskForm 
              trigger={
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center">
                    <CheckSquare className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Business Task</p>
                    <p className="text-xs text-muted-foreground">Manage operations efficiently</p>
                  </div>
                </Button>
              }
            />
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all duration-200"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-primary-lighter to-secondary-lighter rounded-full flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div className="text-center">
                <p className="font-medium">Professional Message</p>
                <p className="text-xs text-muted-foreground">Business communication</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Placeholder */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Business Operations</span>
          </CardTitle>
          <CardDescription>
            Latest activities across Dubai & Philippines ventures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Business operations will appear here once you begin tracking activities</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}