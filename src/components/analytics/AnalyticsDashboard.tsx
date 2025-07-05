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

        <Card className="card-elegant">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-destructive to-destructive/80 rounded-full flex items-center justify-center">
                <TrendingDown className="text-white" size={24} />
              </div>
              <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                Expenses
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-destructive mb-1">
              ₱{analytics.metrics.totalExpenses.toLocaleString()}
            </h3>
            <p className="text-muted-foreground text-sm">Total Expenses</p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center">
                <TrendingUp className="text-white" size={24} />
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Net Profit
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-primary mb-1">
              ₱{analytics.metrics.netProfit.toLocaleString()}
            </h3>
            <p className="text-muted-foreground text-sm">Net Profit</p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-secondary to-secondary-light rounded-full flex items-center justify-center">
                <Target className="text-white" size={24} />
              </div>
              <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                Margin
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-secondary mb-1">
              {analytics.metrics.profitMargin.toFixed(1)}%
            </h3>
            <p className="text-muted-foreground text-sm">Profit Margin</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>Revenue Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₱${Number(value).toLocaleString()}`, 'Revenue']} />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary) / 0.3)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5 text-secondary" />
              <span>Expense Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.expenses}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {analytics.expenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₱${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Analysis */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Cash Flow Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analytics.cashFlow}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₱${Number(value).toLocaleString()}`} />
              <Bar dataKey="income" fill="hsl(var(--success))" name="Income" />
              <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Revenue Growth</span>
              <Badge variant="secondary" className="bg-success/10 text-success">
                +{analytics.metrics.monthlyGrowth}%
              </Badge>
            </div>
            <Progress value={analytics.metrics.monthlyGrowth * 10} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Profit Margin</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {analytics.metrics.profitMargin.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={analytics.metrics.profitMargin} className="h-2" />
            
            <div className="mt-4 p-4 bg-accent/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Key Recommendations</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Revenue growth is strong at +{analytics.metrics.monthlyGrowth}%</li>
                <li>• Consider optimizing marketing spend for better ROI</li>
                <li>• Technology investments showing positive returns</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>Goal Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Monthly Revenue Target</span>
                <span className="text-sm text-muted-foreground">₱200,000</span>
              </div>
              <Progress value={90} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">₱180,000 achieved (90%)</p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Profit Margin Goal</span>
                <span className="text-sm text-muted-foreground">35%</span>
              </div>
              <Progress value={91} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">32% achieved (91%)</p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Expense Control</span>
                <span className="text-sm text-muted-foreground">≤70%</span>
              </div>
              <Progress value={69} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">68% of revenue (Good)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}