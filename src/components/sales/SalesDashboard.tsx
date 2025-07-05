import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  Target, 
  DollarSign,
  Calendar,
  Award,
  BarChart3
} from 'lucide-react';

export default function SalesDashboard() {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalLeads: 0,
    totalOpportunities: 0,
    totalQuotes: 0,
    totalRevenue: 0,
    pipelineValue: 0,
    conversionRate: 0,
    avgDealSize: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch customers
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', currentBusiness?.id || null);

      if (customersError) throw customersError;

      // Fetch leads
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('business_id', currentBusiness?.id || null);

      if (leadsError) throw leadsError;

      // Fetch opportunities
      const { data: opportunities, error: opportunitiesError } = await supabase
        .from('opportunities')
        .select('*')
        .eq('business_id', currentBusiness?.id || null);

      if (opportunitiesError) throw opportunitiesError;

      // Fetch quotes
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .eq('business_id', currentBusiness?.id || null);

      if (quotesError) throw quotesError;

      // Calculate stats
      const totalCustomers = customers?.length || 0;
      const totalLeads = leads?.length || 0;
      const totalOpportunities = opportunities?.length || 0;
      const totalQuotes = quotes?.length || 0;

      const wonOpportunities = opportunities?.filter(o => o.status === 'won') || [];
      const totalRevenue = wonOpportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
      
      const pipelineValue = opportunities?.filter(o => o.status === 'open')
        .reduce((sum, opp) => sum + (opp.value || 0), 0) || 0;

      const convertedLeads = leads?.filter(l => l.status === 'won').length || 0;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
      
      const avgDealSize = wonOpportunities.length > 0 ? totalRevenue / wonOpportunities.length : 0;

      setStats({
        totalCustomers,
        totalLeads,
        totalOpportunities,
        totalQuotes,
        totalRevenue,
        pipelineValue,
        conversionRate,
        avgDealSize,
      });

    } catch (error: any) {
      toast({
        title: "Error fetching stats",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user, currentBusiness]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Sales Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your sales performance and pipeline
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Leads</p>
                <p className="text-2xl font-bold">{stats.totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Opportunities</p>
                <p className="text-2xl font-bold">{stats.totalOpportunities}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Quotes Sent</p>
                <p className="text-2xl font-bold">{stats.totalQuotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₱{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pipeline Value</p>
                <p className="text-2xl font-bold">₱{stats.pipelineValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg Deal Size</p>
                <p className="text-2xl font-bold">₱{stats.avgDealSize.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Activity feed will be displayed here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Pipeline visualization will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}