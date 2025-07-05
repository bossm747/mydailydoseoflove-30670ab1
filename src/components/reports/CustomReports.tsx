import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Plus, Download, Calendar, TrendingUp } from 'lucide-react';

interface CustomReport {
  id: string;
  report_name: string;
  report_type: string;
  filters: any;
  chart_type: string;
  date_range: string;
  is_scheduled: boolean;
  schedule_frequency?: string;
  created_at: string;
}

const REPORT_TYPES = [
  { value: 'financial', label: 'Financial Report' },
  { value: 'business', label: 'Business Report' },
  { value: 'relationship', label: 'Relationship Report' }
];

const CHART_TYPES = [
  { value: 'table', label: 'Table View' },
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie Chart' }
];

const DATE_RANGES = [
  { value: '1week', label: 'Last Week' },
  { value: '1month', label: 'Last Month' },
  { value: '3months', label: 'Last 3 Months' },
  { value: '6months', label: 'Last 6 Months' },
  { value: '1year', label: 'Last Year' }
];

export default function CustomReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<CustomReport | null>(null);

  const fetchReports = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('custom_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching reports",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  const generateReportData = async (report: CustomReport) => {
    if (!user) return;

    let data = [];
    const endDate = new Date();
    const startDate = new Date();
    
    // Calculate date range
    switch (report.date_range) {
      case '1week': startDate.setDate(endDate.getDate() - 7); break;
      case '1month': startDate.setMonth(endDate.getMonth() - 1); break;
      case '3months': startDate.setMonth(endDate.getMonth() - 3); break;
      case '6months': startDate.setMonth(endDate.getMonth() - 6); break;
      case '1year': startDate.setFullYear(endDate.getFullYear() - 1); break;
    }

    try {
      switch (report.report_type) {
        case 'financial':
          const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .gte('transaction_date', startDate.toISOString().split('T')[0])
            .lte('transaction_date', endDate.toISOString().split('T')[0]);

          if (transactions) {
            // Group by category
            const grouped = transactions.reduce((acc: any, trans) => {
              const category = trans.category || 'Uncategorized';
              if (!acc[category]) {
                acc[category] = { name: category, amount: 0, count: 0 };
              }
              acc[category].amount += Math.abs(trans.amount);
              acc[category].count += 1;
              return acc;
            }, {});
            data = Object.values(grouped);
          }
          break;

        case 'business':
          const { data: tasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());

          if (tasks) {
            const grouped = tasks.reduce((acc: any, task) => {
              const status = task.status || 'pending';
              if (!acc[status]) {
                acc[status] = { name: status, count: 0 };
              }
              acc[status].count += 1;
              return acc;
            }, {});
            data = Object.values(grouped);
          }
          break;

        case 'relationship':
          const { data: memories } = await supabase
            .from('memories')
            .select('*')
            .eq('user_id', user.id)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());

          if (memories) {
            // Group by month
            const grouped = memories.reduce((acc: any, memory) => {
              const month = new Date(memory.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              if (!acc[month]) {
                acc[month] = { name: month, count: 0 };
              }
              acc[month].count += 1;
              return acc;
            }, {});
            data = Object.values(grouped);
          }
          break;
      }
    } catch (error) {
      console.error('Error generating report data:', error);
    }

    setReportData(data);
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const reportData = {
      user_id: user.id,
      report_name: formData.get('report_name') as string,
      report_type: formData.get('report_type') as string,
      filters: {},
      chart_type: formData.get('chart_type') as string,
      date_range: formData.get('date_range') as string,
      is_scheduled: formData.get('is_scheduled') === 'on',
      schedule_frequency: formData.get('schedule_frequency') as string || null
    };

    const { error } = await supabase
      .from('custom_reports')
      .insert([reportData]);

    if (error) {
      toast({
        title: "Error creating report",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Report created",
        description: "Custom report has been created successfully.",
      });
      setIsDialogOpen(false);
      fetchReports();
      (e.target as HTMLFormElement).reset();
    }
  };

  const runReport = async (report: CustomReport) => {
    setSelectedReport(report);
    await generateReportData(report);
  };

  const exportReport = () => {
    if (!selectedReport || !reportData.length) return;
    
    const csv = [
      Object.keys(reportData[0]).join(','),
      ...reportData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport.report_name.replace(/\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderChart = () => {
    if (!selectedReport || !reportData.length) return null;

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

    switch (selectedReport.chart_type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#8884d8" />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" />
              <Line type="monotone" dataKey="count" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {reportData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      default: // table
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  {Object.keys(reportData[0]).map((key) => (
                    <th key={key} className="border border-gray-300 px-4 py-2 text-left">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, idx) => (
                      <td key={idx} className="border border-gray-300 px-4 py-2">
                        {typeof value === 'number' ? value.toLocaleString() : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled Reports</p>
                <p className="text-2xl font-bold">{reports.filter(r => r.is_scheduled).length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Generated</p>
                <p className="text-xl font-bold">
                  {reports.length > 0 ? new Date(reports[0].created_at).toLocaleDateString() : 'None'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">My Reports</TabsTrigger>
          <TabsTrigger value="create">Create Report</TabsTrigger>
          {selectedReport && <TabsTrigger value="view">View Report</TabsTrigger>}
        </TabsList>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Custom Reports</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Report
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No custom reports created yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <Card key={report.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{report.report_name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge>{report.report_type}</Badge>
                            <Badge variant="outline">{report.chart_type}</Badge>
                            <Badge variant="outline">{report.date_range}</Badge>
                            {report.is_scheduled && <Badge>Scheduled</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Created: {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button onClick={() => runReport(report)}>
                          Run Report
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Report</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="report_name">Report Name</Label>
                    <Input
                      id="report_name"
                      name="report_name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="report_type">Report Type</Label>
                    <Select name="report_type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {REPORT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="chart_type">Chart Type</Label>
                    <Select name="chart_type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select chart type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CHART_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date_range">Date Range</Label>
                    <Select name="date_range" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        {DATE_RANGES.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_scheduled"
                    name="is_scheduled"
                    className="rounded"
                  />
                  <Label htmlFor="is_scheduled">Schedule this report</Label>
                </div>

                <Button type="submit" className="w-full">
                  Create Report
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {selectedReport && (
          <TabsContent value="view">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedReport.report_name}</CardTitle>
                  <Button onClick={exportReport} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {renderChart()}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Report</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="report_name">Report Name</Label>
                <Input
                  id="report_name"
                  name="report_name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="report_type">Report Type</Label>
                <Select name="report_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="chart_type">Chart Type</Label>
                <Select name="chart_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHART_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date_range">Date Range</Label>
                <Select name="date_range" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_RANGES.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_scheduled"
                name="is_scheduled"
                className="rounded"
              />
              <Label htmlFor="is_scheduled">Schedule this report</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Report</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}