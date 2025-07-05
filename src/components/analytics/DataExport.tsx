import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, FileText, Database, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DataExport {
  id: string;
  export_name: string;
  export_type: string;
  data_source: string;
  export_format: string;
  status: string;
  file_url: string | null;
  record_count: number | null;
  requested_at: string;
  completed_at: string | null;
  expires_at: string | null;
}

const DATA_SOURCES = [
  { value: 'customers', label: 'Customers' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'payments', label: 'Payments' },
  { value: 'employees', label: 'Employees' },
  { value: 'products', label: 'Products' },
  { value: 'leads', label: 'Leads' },
  { value: 'projects', label: 'Projects' },
  { value: 'analytics_events', label: 'Analytics Events' }
];

const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV', description: 'Comma-separated values' },
  { value: 'xlsx', label: 'Excel', description: 'Microsoft Excel format' },
  { value: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
  { value: 'pdf', label: 'PDF', description: 'Portable Document Format' }
];

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-500', icon: Database },
  completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
  failed: { label: 'Failed', color: 'bg-red-500', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-gray-500', icon: XCircle }
};

export const DataExport: React.FC = () => {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [exports, setExports] = useState<DataExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchExports();
    }
  }, [user, currentBusiness]);

  const fetchExports = async () => {
    try {
      let query = supabase
        .from('data_exports')
        .select('*')
        .eq('user_id', user!.id)
        .order('requested_at', { ascending: false });

      if (currentBusiness) {
        query = query.eq('business_id', currentBusiness.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      setExports(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch data exports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExport = async (formData: FormData) => {
    try {
      const exportData = {
        user_id: user!.id,
        business_id: currentBusiness?.id || null,
        export_name: formData.get('export_name') as string,
        export_type: 'filtered',
        data_source: formData.get('data_source') as string,
        export_format: formData.get('export_format') as string,
        filters: {},
        status: 'pending'
      };

      const { error } = await supabase
        .from('data_exports')
        .insert([exportData]);

      if (error) throw error;

      toast({
        title: "Export requested",
        description: "Your data export has been queued for processing.",
      });

      fetchExports();
      setIsFormOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
    const Icon = config.icon;
    return (
      <Badge variant="secondary" className={`${config.color} text-white`}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading data exports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Data Export</h1>
          <p className="text-muted-foreground">Export your business data in various formats</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Export
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Data Export</DialogTitle>
              <DialogDescription>
                Export your business data in your preferred format
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateExport(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div>
                <Label htmlFor="export_name">Export Name *</Label>
                <Input
                  id="export_name"
                  name="export_name"
                  required
                  placeholder="e.g., Customer List Export"
                />
              </div>

              <div>
                <Label htmlFor="data_source">Data Source *</Label>
                <Select name="data_source" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data to export" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_SOURCES.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="export_format">Export Format *</Label>
                <Select name="export_format" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPORT_FORMATS.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        <div>
                          <div className="font-medium">{format.label}</div>
                          <div className="text-xs text-muted-foreground">{format.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Export
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Export History */}
      {exports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Download className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No exports found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by creating your first data export
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Export
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {exports.map((exportItem) => (
            <Card key={exportItem.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{exportItem.export_name}</h3>
                      {getStatusBadge(exportItem.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Source: {DATA_SOURCES.find(s => s.value === exportItem.data_source)?.label}</span>
                      <span>Format: {exportItem.export_format.toUpperCase()}</span>
                      {exportItem.record_count && (
                        <span>Records: {exportItem.record_count.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Requested: {new Date(exportItem.requested_at).toLocaleString()}
                      {exportItem.completed_at && (
                        <span> • Completed: {new Date(exportItem.completed_at).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {exportItem.status === 'completed' && exportItem.file_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={exportItem.file_url} download>
                          <Download className="mr-1 h-3 w-3" />
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};