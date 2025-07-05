import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Webhook, Settings, Activity, Trash2, Edit, Power, PowerOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface WebhookConfig {
  id: string;
  webhook_name: string;
  webhook_url: string;
  webhook_secret: string | null;
  event_types: string[];
  is_active: boolean;
  retry_count: number;
  timeout_seconds: number;
  headers: Json;
  created_at: string;
  updated_at: string;
}

interface WebhookLog {
  id: string;
  webhook_id: string;
  event_type: string;
  event_data: any;
  request_url: string;
  response_status: number | null;
  attempt_number: number;
  status: string;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

const EVENT_TYPES = [
  { value: 'invoice.created', label: 'Invoice Created' },
  { value: 'invoice.paid', label: 'Invoice Paid' },
  { value: 'payment.received', label: 'Payment Received' },
  { value: 'customer.created', label: 'Customer Created' },
  { value: 'lead.converted', label: 'Lead Converted' },
  { value: 'project.completed', label: 'Project Completed' },
  { value: 'employee.hired', label: 'Employee Hired' }
];

export const WebhookManager: React.FC = () => {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchWebhooks();
      fetchLogs();
    }
  }, [user, currentBusiness]);

  const fetchWebhooks = async () => {
    try {
      let query = supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (currentBusiness) {
        query = query.eq('business_id', currentBusiness.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      setWebhooks(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch webhooks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select(`
          *,
          webhooks!inner(webhook_name, user_id, business_id)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setLogs(data || []);
    } catch (error: any) {
      console.error('Failed to fetch webhook logs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const webhookData = {
        user_id: user!.id,
        business_id: currentBusiness?.id || null,
        webhook_name: formData.get('webhook_name') as string,
        webhook_url: formData.get('webhook_url') as string,
        webhook_secret: formData.get('webhook_secret') as string || null,
        event_types: selectedEvents,
        retry_count: parseInt(formData.get('retry_count') as string) || 3,
        timeout_seconds: parseInt(formData.get('timeout_seconds') as string) || 30,
        headers: {},
        is_active: true
      };

      if (editingWebhook) {
        const { error } = await supabase
          .from('webhooks')
          .update(webhookData)
          .eq('id', editingWebhook.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Webhook updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('webhooks')
          .insert([webhookData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Webhook created successfully",
        });
      }

      fetchWebhooks();
      setIsFormOpen(false);
      setEditingWebhook(null);
      setSelectedEvents([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (webhookId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .update({ is_active: !isActive })
        .eq('id', webhookId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Webhook ${!isActive ? 'activated' : 'deactivated'} successfully`,
      });

      fetchWebhooks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', webhookId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Webhook deleted successfully",
      });

      fetchWebhooks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (webhook: WebhookConfig) => {
    setEditingWebhook(webhook);
    setSelectedEvents(webhook.event_types);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingWebhook(null);
    setSelectedEvents([]);
  };

  const handleEventToggle = (eventType: string, checked: boolean) => {
    if (checked) {
      setSelectedEvents([...selectedEvents, eventType]);
    } else {
      setSelectedEvents(selectedEvents.filter(e => e !== eventType));
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      success: { label: 'Success', variant: 'default' as const },
      failed: { label: 'Failed', variant: 'destructive' as const },
      pending: { label: 'Pending', variant: 'secondary' as const },
      retrying: { label: 'Retrying', variant: 'outline' as const }
    };
    
    const statusConfig = config[status as keyof typeof config] || config.pending;
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading webhooks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Webhook Manager</h1>
          <p className="text-muted-foreground">Configure webhooks for real-time event notifications</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingWebhook ? 'Edit' : 'Create'} Webhook</DialogTitle>
              <DialogDescription>
                Configure a webhook endpoint to receive real-time event notifications
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="webhook_name">Webhook Name *</Label>
                  <Input
                    id="webhook_name"
                    name="webhook_name"
                    required
                    defaultValue={editingWebhook?.webhook_name}
                    placeholder="e.g., Payment Notifications"
                  />
                </div>
                <div>
                  <Label htmlFor="webhook_url">Webhook URL *</Label>
                  <Input
                    id="webhook_url"
                    name="webhook_url"
                    type="url"
                    required
                    defaultValue={editingWebhook?.webhook_url}
                    placeholder="https://your-app.com/webhook"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="webhook_secret">Webhook Secret (Optional)</Label>
                <Input
                  id="webhook_secret"
                  name="webhook_secret"
                  type="password"
                  defaultValue={editingWebhook?.webhook_secret || ''}
                  placeholder="Used to verify webhook authenticity"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="retry_count">Retry Count</Label>
                  <Input
                    id="retry_count"
                    name="retry_count"
                    type="number"
                    min="0"
                    max="10"
                    defaultValue={editingWebhook?.retry_count || 3}
                  />
                </div>
                <div>
                  <Label htmlFor="timeout_seconds">Timeout (seconds)</Label>
                  <Input
                    id="timeout_seconds"
                    name="timeout_seconds"
                    type="number"
                    min="5"
                    max="120"
                    defaultValue={editingWebhook?.timeout_seconds || 30}
                  />
                </div>
              </div>

              <div>
                <Label>Event Types *</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {EVENT_TYPES.map((event) => (
                    <div key={event.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={event.value}
                        checked={selectedEvents.includes(event.value)}
                        onCheckedChange={(checked) => handleEventToggle(event.value, !!checked)}
                      />
                      <Label htmlFor={event.value} className="text-sm">
                        {event.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingWebhook ? 'Update' : 'Create'} Webhook
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="webhooks" className="w-full">
        <TabsList>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          {webhooks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Webhook className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No webhooks found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first webhook to receive real-time notifications
                </p>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Webhook
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {webhooks.map((webhook) => (
                <Card key={webhook.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{webhook.webhook_name}</CardTitle>
                        <CardDescription>{webhook.webhook_url}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={webhook.is_active ? "default" : "secondary"}>
                          {webhook.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {webhook.event_types.length} events
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Created: {new Date(webhook.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(webhook.id, webhook.is_active)}
                        >
                          {webhook.is_active ? (
                            <>
                              <PowerOff className="h-4 w-4 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Power className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(webhook)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(webhook.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          {logs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No webhook activity found</h3>
                <p className="text-muted-foreground text-center">
                  Webhook execution logs will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{log.event_type}</span>
                            {getStatusBadge(log.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            URL: {log.request_url}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>Attempt {log.attempt_number}</div>
                        <div>{new Date(log.created_at).toLocaleString()}</div>
                        {log.response_status && (
                          <div>Status: {log.response_status}</div>
                        )}
                      </div>
                    </div>
                    {log.error_message && (
                      <div className="mt-2 p-2 bg-destructive/10 rounded text-sm text-destructive">
                        {log.error_message}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};