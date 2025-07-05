import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Download, Edit, Trash2, Play, Pause, X, FileSpreadsheet, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BulkOperation {
  id: string;
  operation_name: string;
  operation_type: string;
  target_table: string;
  total_records: number;
  processed_records: number;
  failed_records: number;
  status: string;
  parameters: any;
  results: any;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

const OPERATION_TYPES = [
  { value: 'import', label: 'Import Data', icon: Upload },
  { value: 'export', label: 'Export Data', icon: Download },
  { value: 'update', label: 'Bulk Update', icon: Edit },
  { value: 'delete', label: 'Bulk Delete', icon: Trash2 },
];

const TARGET_TABLES = [
  { value: 'customers', label: 'Customers' },
  { value: 'leads', label: 'Leads' },
  { value: 'employees', label: 'Employees' },
  { value: 'products', label: 'Products' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'transactions', label: 'Transactions' },
];

export default function BulkOperations() {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOperations();
    }
  }, [user, currentBusiness]);

  const fetchOperations = async () => {
    try {
      let query = supabase
        .from('bulk_operations')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (currentBusiness) {
        query = query.eq('business_id', currentBusiness.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      setOperations(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch bulk operations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const operationData = {
        user_id: user!.id,
        business_id: currentBusiness?.id || null,
        operation_name: formData.get('operation_name') as string,
        operation_type: formData.get('operation_type') as string,
        target_table: formData.get('target_table') as string,
        parameters: {
          file_type: formData.get('file_type') as string,
          update_fields: formData.get('update_fields') as string,
          filter_conditions: formData.get('filter_conditions') as string,
        },
        status: 'pending'
      };

      const { error } = await supabase
        .from('bulk_operations')
        .insert([operationData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bulk operation created successfully",
      });

      fetchOperations();
      setIsFormOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStartOperation = async (operationId: string) => {
    try {
      const { error } = await supabase
        .from('bulk_operations')
        .update({ 
          status: 'processing',
          started_at: new Date().toISOString()
        })
        .eq('id', operationId);

      if (error) throw error;

      toast({
        title: "Operation Started",
        description: "Bulk operation has been started",
      });

      fetchOperations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancelOperation = async (operationId: string) => {
    try {
      const { error } = await supabase
        .from('bulk_operations')
        .update({ status: 'cancelled' })
        .eq('id', operationId);

      if (error) throw error;

      toast({
        title: "Operation Cancelled",
        description: "Bulk operation has been cancelled",
      });

      fetchOperations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'Pending', variant: 'secondary' as const },
      processing: { label: 'Processing', variant: 'default' as const },
      completed: { label: 'Completed', variant: 'default' as const },
      failed: { label: 'Failed', variant: 'destructive' as const },
      cancelled: { label: 'Cancelled', variant: 'outline' as const }
    };
    
    const statusConfig = config[status as keyof typeof config] || config.pending;
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
  };

  const getProgress = (operation: BulkOperation) => {
    if (operation.total_records === 0) return 0;
    return (operation.processed_records / operation.total_records) * 100;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading bulk operations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Bulk Operations</h1>
          <p className="text-muted-foreground">Manage large-scale data operations</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Operation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Bulk Operation</DialogTitle>
              <DialogDescription>
                Set up a new bulk operation for processing large amounts of data
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="operation_name">Operation Name *</Label>
                <Input
                  id="operation_name"
                  name="operation_name"
                  required
                  placeholder="e.g., Import Customer Data Q1 2024"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="operation_type">Operation Type *</Label>
                  <Select name="operation_type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select operation type" />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="target_table">Target Table *</Label>
                  <Select name="target_table" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select table" />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_TABLES.map((table) => (
                        <SelectItem key={table.value} value={table.value}>
                          {table.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="file_type">File Type</Label>
                <Select name="file_type">
                  <SelectTrigger>
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="update_fields">Update Fields (comma-separated)</Label>
                <Input
                  id="update_fields"
                  name="update_fields"
                  placeholder="e.g., name, email, phone"
                />
              </div>

              <div>
                <Label htmlFor="filter_conditions">Filter Conditions</Label>
                <Input
                  id="filter_conditions"
                  name="filter_conditions"
                  placeholder="e.g., status = 'active'"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Operation</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Operations</TabsTrigger>
          <TabsTrigger value="history">Operation History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {operations.filter(op => ['pending', 'processing'].includes(op.status)).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active operations</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create a new bulk operation to get started
                </p>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Operation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {operations.filter(op => ['pending', 'processing'].includes(op.status)).map((operation) => (
                <Card key={operation.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{operation.operation_name}</CardTitle>
                        <CardDescription>
                          {operation.operation_type} • {operation.target_table}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(operation.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {operation.status === 'processing' && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{operation.processed_records} / {operation.total_records}</span>
                        </div>
                        <Progress value={getProgress(operation)} />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Created: {new Date(operation.created_at).toLocaleString()}
                      </div>
                      <div className="flex gap-2">
                        {operation.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartOperation(operation.id)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                        {['pending', 'processing'].includes(operation.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelOperation(operation.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="grid gap-4">
            {operations.filter(op => !['pending', 'processing'].includes(op.status)).map((operation) => (
              <Card key={operation.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{operation.operation_name}</CardTitle>
                      <CardDescription>
                        {operation.operation_type} • {operation.target_table}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(operation.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{operation.processed_records}</div>
                      <div className="text-sm text-muted-foreground">Processed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{operation.failed_records}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{operation.total_records}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                  </div>
                  
                  {operation.error_message && (
                    <div className="mb-4 p-2 bg-destructive/10 rounded text-sm text-destructive">
                      {operation.error_message}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Completed: {operation.completed_at ? new Date(operation.completed_at).toLocaleString() : 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}