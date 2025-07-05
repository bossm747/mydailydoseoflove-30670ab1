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

  const quickActions = [
    { 
      label: "Add Transaction", 
      icon: DollarSign, 
      gradient: "from-success to-success/80",
      description: "Record income or expense"
    },
    { 
      label: "Create Memory", 
      icon: Camera, 
      gradient: "from-secondary to-secondary-light",
      description: "Save a special moment"
    },
    { 
      label: "Add Task", 
      icon: CheckSquare, 
      gradient: "from-primary to-primary-light",
      description: "Create business task"
    },
    { 
      label: "Send Message", 
      icon: MessageCircle, 
      gradient: "from-primary-lighter to-secondary-lighter",
      description: "Chat with your partner"
    },
  ];

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">Financial records</p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memories</CardTitle>
            <Heart className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalMemories}</div>
            <p className="text-xs text-muted-foreground">Shared moments</p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-primary-lighter" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">Conversations</p>
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
            Jump into your most common tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all duration-200"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.gradient} rounded-full flex items-center justify-center`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Placeholder */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>
            Latest updates from your shared workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Start using the app to see your activity here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}