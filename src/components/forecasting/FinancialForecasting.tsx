import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Calculator, Calendar, Plus } from 'lucide-react';

interface Forecast {
  id: string;
  forecast_type: string; 
  forecast_period: string;
  base_amount: number;
  growth_rate?: number;
  category?: string;
  start_date: string;
  end_date: string;
  notes?: string;
}

const FORECAST_TYPES = [
  { value: 'income', label: 'Income Projection' },
  { value: 'expense', label: 'Expense Forecast' },
  { value: 'savings', label: 'Savings Growth' },
  { value: 'net_worth', label: 'Net Worth Projection' }
];

const PERIODS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

export default function FinancialForecasting() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchForecasts = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('financial_forecasts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching forecasts",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setForecasts(data || []);
      generateChartData(data || []);
    }
    setLoading(false);
  };

  const generateChartData = (forecasts: Forecast[]) => {
    const currentDate = new Date();
    const data = [];

    for (let i = 0; i < 12; i++) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthName = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      let income = 0, expenses = 0, savings = 0, netWorth = 0;

      forecasts.forEach(forecast => {
        const monthsFromStart = Math.floor((month.getTime() - new Date(forecast.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30));
        if (monthsFromStart >= 0) {
          const growthMultiplier = forecast.growth_rate ? Math.pow(1 + forecast.growth_rate, monthsFromStart / 12) : 1;
          const projectedAmount = forecast.base_amount * growthMultiplier;

          switch (forecast.forecast_type) {
            case 'income': income += projectedAmount; break;
            case 'expense': expenses += projectedAmount; break;
            case 'savings': savings += projectedAmount; break;
            case 'net_worth': netWorth += projectedAmount; break;
          }
        }
      });

      data.push({
        month: monthName,
        income,
        expenses,
        savings,
        netWorth: income - expenses + savings
      });
    }

    setChartData(data);
  };

  useEffect(() => {
    fetchForecasts();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const forecastData = {
      user_id: user.id,
      forecast_type: formData.get('forecast_type') as string,
      forecast_period: formData.get('forecast_period') as string,
      base_amount: parseFloat(formData.get('base_amount') as string),
      growth_rate: formData.get('growth_rate') ? parseFloat(formData.get('growth_rate') as string) / 100 : null,
      category: formData.get('category') as string || null,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      notes: formData.get('notes') as string || null
    };

    const { error } = await supabase
      .from('financial_forecasts')
      .insert([forecastData]);

    if (error) {
      toast({
        title: "Error creating forecast",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Forecast created",
        description: "Financial forecast has been created successfully.",
      });
      fetchForecasts();
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Forecasts</p>
                <p className="text-2xl font-bold">{forecasts.length}</p>
              </div>
              <Calculator className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Month Projection</p>
                <p className="text-2xl font-bold text-green-600">
                  ₱{chartData.length > 1 ? Math.round(chartData[1].netWorth).toLocaleString() : '0'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">12-Month Outlook</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₱{chartData.length > 0 ? Math.round(chartData[chartData.length - 1]?.netWorth || 0).toLocaleString() : '0'}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chart" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chart">Forecast Chart</TabsTrigger>
          <TabsTrigger value="create">Create Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>12-Month Financial Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `₱${Math.round(value).toLocaleString()}`} />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                    <Line type="monotone" dataKey="netWorth" stroke="#3b82f6" strokeWidth={3} name="Net Worth" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="forecast_type">Forecast Type</Label>
                    <Select name="forecast_type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {FORECAST_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="base_amount">Base Amount (₱)</Label>
                    <Input
                      id="base_amount"
                      name="base_amount"
                      type="number"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="growth_rate">Annual Growth Rate (%)</Label>
                    <Input
                      id="growth_rate"
                      name="growth_rate"
                      type="number"
                      step="0.01"
                      placeholder="5.0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      placeholder="Salary, Business, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="date"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Forecast
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}