import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AnalyticsData {
  revenue: { month: string; amount: number; }[];
  expenses: { category: string; amount: number; color: string; }[];
  cashFlow: { month: string; income: number; expenses: number; }[];
  metrics: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    monthlyGrowth: number;
  };
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('6months');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    revenue: [],
    expenses: [],
    cashFlow: [],
    metrics: {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      profitMargin: 0,
      monthlyGrowth: 0
    }
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    
    // Mock data - in real implementation, this would fetch from Supabase
    const mockData: AnalyticsData = {
      revenue: [
        { month: 'Jul', amount: 125000 },
        { month: 'Aug', amount: 142000 },
        { month: 'Sep', amount: 138000 },
        { month: 'Oct', amount: 155000 },
        { month: 'Nov', amount: 167000 },
        { month: 'Dec', amount: 180000 }
      ],
      expenses: [
        { category: 'Business Operations', amount: 45000, color: '#8884d8' },
        { category: 'Marketing', amount: 25000, color: '#82ca9d' },
        { category: 'Technology', amount: 18000, color: '#ffc658' },
        { category: 'Travel', amount: 15000, color: '#ff7300' },
        { category: 'Other', amount: 12000, color: '#8dd1e1' }
      ],
      cashFlow: [
        { month: 'Jul', income: 125000, expenses: 95000 },
        { month: 'Aug', income: 142000, expenses: 105000 },
        { month: 'Sep', income: 138000, expenses: 98000 },
        { month: 'Oct', income: 155000, expenses: 115000 },
        { month: 'Nov', income: 167000, expenses: 120000 },
        { month: 'Dec', income: 180000, expenses: 125000 }
      ],
      metrics: {
        totalRevenue: 967000,
        totalExpenses: 658000,
        netProfit: 309000,
        profitMargin: 31.96,
        monthlyGrowth: 7.8
      }
    };

    setTimeout(() => {
      setAnalytics(mockData);
      setLoading(false);
    }, 1000);
  };

  const exportReport = () => {
    // In real implementation, this would generate and download a PDF/Excel report
    console.log('Exporting analytics report...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold gradient-text">Business Analytics</h2>
          <p className="text-muted-foreground">Comprehensive financial insights and performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
              <SelectItem value="2years">Last 2 Years</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-elegant">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-success to-success/80 rounded-full flex items-center justify-center">
                <DollarSign className="text-white" size={24} />
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success">
                +{analytics.metrics.monthlyGrowth}%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-success mb-1">
              ₱{analytics.metrics.totalRevenue.toLocaleString()}
            </h3>
            <p className="text-muted-foreground text-sm">Total Revenue</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}