import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Target, TrendingUp, TrendingDown, AlertCircle, BarChart3, Users, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface KPI {
  id: string;
  kpi_name: string;
  kpi_description: string;
  kpi_category: string;
  kpi_type: string;
  target_value: number;
  target_period: string;
  is_active: boolean;
  display_order: number;
  kpi_values?: KPIValue[];
  created_at: string;
}

interface KPIValue {
  id: string;
  actual_value: number;
  target_value: number;
  achievement_percentage: number;
  period_start: string;
  period_end: string;
  notes: string | null;
}

const KPI_CATEGORIES = [
  { value: 'revenue', label: 'Revenue', icon: DollarSign, color: 'text-green-600' },
  { value: 'growth', label: 'Growth', icon: TrendingUp, color: 'text-blue-600' },
  { value: 'efficiency', label: 'Efficiency', icon: BarChart3, color: 'text-purple-600' },
  { value: 'customer', label: 'Customer', icon: Users, color: 'text-orange-600' },
  { value: 'employee', label: 'Employee', icon: Users, color: 'text-indigo-600' },
  { value: 'financial', label: 'Financial', icon: DollarSign, color: 'text-emerald-600' },
  { value: 'operational', label: 'Operational', icon: Target, color: 'text-gray-600' }
];

export const KPIDashboard: React.FC = () => {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchKPIs();
    }
  }, [user, currentBusiness]);

  const fetchKPIs = async () => {
    try {
      let query = supabase
        .from('kpis')
        .select(`
          *,
          kpi_values!inner (
            actual_value,
            target_value,
            achievement_percentage,
            period_start,
            period_end,
            notes
          )
        `)
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (currentBusiness) {
        query = query.eq('business_id', currentBusiness.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get current period KPI values
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const kpisWithCurrentValues = (data as any[] || []).map((kpi: any) => ({
        ...kpi,
        kpi_values: kpi.kpi_values?.filter((value: any) => {
          const periodStart = new Date(value.period_start);
          const periodEnd = new Date(value.period_end);
          return periodStart >= startOfMonth && periodEnd <= endOfMonth;
        }) || []
      }));

      setKpis(kpisWithCurrentValues);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch KPIs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKPI = async (formData: FormData) => {
    try {
      const kpiData = {
        user_id: user!.id,
        business_id: currentBusiness?.id || null,
        kpi_name: formData.get('kpi_name') as string,
        kpi_description: formData.get('kpi_description') as string,
        kpi_category: formData.get('kpi_category') as string,
        kpi_type: formData.get('kpi_type') as string,
        target_value: parseFloat(formData.get('target_value') as string),
        target_period: formData.get('target_period') as string,
        calculation_method: formData.get('calculation_method') as string,
        display_order: kpis.length
      };

      const { error } = await supabase
        .from('kpis')
        .insert([kpiData]);

      if (error) throw error;

      toast({
        title: "KPI created",
        description: "New KPI has been created successfully.",
      });

      fetchKPIs();
      setIsFormOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getCategoryInfo = (category: string) => {
    return KPI_CATEGORIES.find(cat => cat.value === category) || KPI_CATEGORIES[0];
  };

  const getPerformanceColor = (percentage: number | null) => {
    if (!percentage) return 'text-gray-500';
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (percentage: number | null) => {
    if (!percentage) return AlertCircle;
    if (percentage >= 100) return TrendingUp;
    if (percentage >= 80) return TrendingUp;
    return TrendingDown;
  };

  const filteredKPIs = kpis.filter(kpi => 
    categoryFilter === 'all' || kpi.kpi_category === categoryFilter
  );

  if (loading) {
    return <div className="flex justify-center p-8">Loading KPIs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">KPI Dashboard</h1>
          <p className="text-muted-foreground">Track your key performance indicators</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add KPI
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New KPI</DialogTitle>
              <DialogDescription>
                Define a new key performance indicator to track
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateKPI(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="kpi_name">KPI Name *</Label>
                  <Input
                    id="kpi_name"
                    name="kpi_name"
                    required
                    placeholder="e.g., Monthly Revenue"
                  />
                </div>
                <div>
                  <Label htmlFor="kpi_category">Category *</Label>
                  <Select name="kpi_category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {KPI_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="kpi_description">Description</Label>
                <Textarea
                  id="kpi_description"
                  name="kpi_description"
                  placeholder="Describe what this KPI measures"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="kpi_type">Type *</Label>
                  <Select name="kpi_type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="numeric">Numeric</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="currency">Currency</SelectItem>
                      <SelectItem value="count">Count</SelectItem>
                      <SelectItem value="ratio">Ratio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="target_value">Target Value *</Label>
                  <Input
                    id="target_value"
                    name="target_value"
                    type="number"
                    step="0.01"
                    required
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="target_period">Period *</Label>
                  <Select name="target_period" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="calculation_method">Calculation Method *</Label>
                <Select name="calculation_method" required>
                  <SelectTrigger>
                    <SelectValue placeholder="How is this calculated?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="ratio">Ratio</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create KPI
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <Label>Category:</Label>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {KPI_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      {filteredKPIs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No KPIs found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start tracking your business performance with key indicators
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First KPI
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredKPIs.map((kpi) => {
            const categoryInfo = getCategoryInfo(kpi.kpi_category);
            const currentValue = kpi.kpi_values?.[0];
            const achievement = currentValue?.achievement_percentage || 0;
            const PerformanceIcon = getPerformanceIcon(achievement);
            
            return (
              <Card key={kpi.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{kpi.kpi_name}</CardTitle>
                      <CardDescription className="text-sm">
                        {kpi.kpi_description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <categoryInfo.icon className={`h-5 w-5 ${categoryInfo.color}`} />
                      <Badge variant="secondary">
                        {categoryInfo.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Current Performance</span>
                      <div className="flex items-center gap-1">
                        <PerformanceIcon className={`h-4 w-4 ${getPerformanceColor(achievement)}`} />
                        <span className={`font-bold ${getPerformanceColor(achievement)}`}>
                          {achievement ? `${achievement.toFixed(1)}%` : 'No data'}
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={Math.min(achievement || 0, 100)} 
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Current</div>
                      <div className="font-bold">
                        {currentValue?.actual_value?.toLocaleString() || '0'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Target</div>
                      <div className="font-bold">
                        {kpi.target_value?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground border-t pt-2">
                    Period: {kpi.target_period} | Type: {kpi.kpi_type}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};