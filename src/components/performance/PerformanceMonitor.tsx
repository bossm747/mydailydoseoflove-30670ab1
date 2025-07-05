import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Database, Zap, RefreshCw, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface CacheStats {
  total_entries: number;
  hit_rate: number;
  miss_rate: number;
  expired_entries: number;
}

export default function PerformanceMonitor() {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (user) {
      fetchPerformanceMetrics();
      const interval = setInterval(fetchPerformanceMetrics, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user, currentBusiness]);

  const fetchPerformanceMetrics = async () => {
    try {
      // Simulate fetching performance metrics
      // In a real app, these would come from monitoring APIs or database queries
      const mockMetrics: PerformanceMetric[] = [
        {
          name: 'Database Response Time',
          value: Math.random() * 200 + 50,
          unit: 'ms',
          status: 'good',
          trend: 'stable',
          description: 'Average database query response time'
        },
        {
          name: 'API Response Time',
          value: Math.random() * 500 + 100,
          unit: 'ms',
          status: 'excellent',
          trend: 'down',
          description: 'Average API endpoint response time'
        },
        {
          name: 'Memory Usage',
          value: Math.random() * 30 + 40,
          unit: '%',
          status: 'warning',
          trend: 'up',
          description: 'Current memory utilization'
        },
        {
          name: 'CPU Usage',
          value: Math.random() * 20 + 15,
          unit: '%',
          status: 'excellent',
          trend: 'stable',
          description: 'Current CPU utilization'
        },
        {
          name: 'Active Sessions',
          value: Math.floor(Math.random() * 50 + 10),
          unit: 'sessions',
          status: 'good',
          trend: 'up',
          description: 'Number of active user sessions'
        },
        {
          name: 'Error Rate',
          value: Math.random() * 2,
          unit: '%',
          status: 'excellent',
          trend: 'down',
          description: 'Percentage of failed requests'
        }
      ];

      setMetrics(mockMetrics);

      // Fetch cache statistics
      const { data: cacheData, error: cacheError } = await supabase
        .from('performance_cache')
        .select('*');

      if (cacheError) throw cacheError;

      const now = new Date();
      const totalEntries = cacheData?.length || 0;
      const expiredEntries = cacheData?.filter(entry => new Date(entry.expires_at) < now).length || 0;
      
      setCacheStats({
        total_entries: totalEntries,
        hit_rate: Math.random() * 20 + 75, // Mock hit rate
        miss_rate: Math.random() * 25 + 5,  // Mock miss rate
        expired_entries: expiredEntries
      });

      setLastUpdated(new Date());
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch performance metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    try {
      const { data, error } = await supabase.rpc('clean_expired_cache');
      
      if (error) throw error;

      toast({
        title: "Cache Cleared",
        description: `Removed ${data || 0} expired cache entries`,
      });

      fetchPerformanceMetrics();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      excellent: 'text-green-600 bg-green-100',
      good: 'text-blue-600 bg-blue-100',
      warning: 'text-yellow-600 bg-yellow-100',
      critical: 'text-red-600 bg-red-100'
    };
    return colors[status as keyof typeof colors] || colors.good;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading performance metrics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Performance Monitor</h1>
          <p className="text-muted-foreground">
            System performance and optimization metrics
            {lastUpdated && (
              <span className="ml-2">
                • Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <Button onClick={fetchPerformanceMetrics} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="cache">Cache Management</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                    {getTrendIcon(metric.trend)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold">
                      {metric.unit === '%' ? metric.value.toFixed(1) : Math.round(metric.value)}
                    </span>
                    <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  </div>
                  <Badge className={getStatusColor(metric.status)} variant="secondary">
                    {metric.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Cache Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cacheStats && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Hit Rate</span>
                        <span>{cacheStats.hit_rate.toFixed(1)}%</span>
                      </div>
                      <Progress value={cacheStats.hit_rate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Miss Rate</span>
                        <span>{cacheStats.miss_rate.toFixed(1)}%</span>
                      </div>
                      <Progress value={cacheStats.miss_rate} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <div className="text-2xl font-bold">{cacheStats.total_entries}</div>
                        <div className="text-sm text-muted-foreground">Total Entries</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">{cacheStats.expired_entries}</div>
                        <div className="text-sm text-muted-foreground">Expired</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Cache Management
                </CardTitle>
                <CardDescription>
                  Manage application cache for optimal performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleClearCache} variant="outline" className="w-full">
                  Clear Expired Cache
                </Button>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Cache Optimization</p>
                      <p className="text-muted-foreground">
                        Clearing expired cache entries can improve application performance.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Recommendations</CardTitle>
                <CardDescription>
                  Suggested optimizations to improve system performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                      <Database className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-medium">Database Query Optimization</h3>
                      <p className="text-sm text-muted-foreground">
                        Consider adding indexes to frequently queried columns to improve response times.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="bg-green-100 text-green-600 p-2 rounded-full">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-medium">Implement Code Splitting</h3>
                      <p className="text-sm text-muted-foreground">
                        Split large JavaScript bundles to reduce initial page load times.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="bg-purple-100 text-purple-600 p-2 rounded-full">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-medium">Enable Compression</h3>
                      <p className="text-sm text-muted-foreground">
                        Enable gzip compression for static assets to reduce bandwidth usage.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">98.5%</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">1.2s</div>
                    <div className="text-sm text-muted-foreground">Avg Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">0.1%</div>
                    <div className="text-sm text-muted-foreground">Error Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}