import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, Zap, Mail, MessageCircle, CreditCard, Database, Trash2, Edit, Power, PowerOff, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface Integration {
  id: string;
  integration_name: string;
  integration_type: string;
  provider_name: string;
  configuration: Json;
  is_active: boolean;
  last_sync_at: string | null;
  sync_status: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

const INTEGRATION_TYPES = [
  { 
    value: 'email', 
    label: 'Email Service', 
    icon: Mail,
    providers: ['gmail', 'outlook', 'sendgrid', 'mailgun'],
    description: 'Send emails and notifications'
  },
  { 
    value: 'sms', 
    label: 'SMS Service', 
    icon: MessageCircle,
    providers: ['twilio', 'nexmo', 'aws-sns'],
    description: 'Send SMS notifications'
  },
  { 
    value: 'payment', 
    label: 'Payment Gateway', 
    icon: CreditCard,
    providers: ['stripe', 'paypal', 'razorpay', 'square'],
    description: 'Process payments'
  },
  { 
    value: 'crm', 
    label: 'CRM System', 
    icon: Database,
    providers: ['salesforce', 'hubspot', 'pipedrive'],
    description: 'Sync customer data'
  },
  { 
    value: 'analytics', 
    label: 'Analytics', 
    icon: Zap,
    providers: ['google-analytics', 'mixpanel', 'amplitude'],
    description: 'Track user behavior'
  }
];

export const IntegrationManager: React.FC = () => {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchIntegrations();
    }
  }, [user, currentBusiness]);

  const fetchIntegrations = async () => {
    try {
      let query = supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (currentBusiness) {
        query = query.eq('business_id', currentBusiness.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      setIntegrations(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch integrations",
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
      const integrationData = {
        user_id: user!.id,
        business_id: currentBusiness?.id || null,
        integration_name: formData.get('integration_name') as string,
        integration_type: selectedType,
        provider_name: selectedProvider,
        configuration: {
          api_key: formData.get('api_key') as string,
          api_secret: formData.get('api_secret') as string,
          webhook_url: formData.get('webhook_url') as string,
          additional_config: formData.get('additional_config') as string
        },
        is_active: true,
        sync_status: 'never_synced'
      };

      if (editingIntegration) {
        const { error } = await supabase
          .from('integrations')
          .update(integrationData)
          .eq('id', editingIntegration.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Integration updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('integrations')
          .insert([integrationData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Integration created successfully",
        });
      }

      fetchIntegrations();
      setIsFormOpen(false);
      setEditingIntegration(null);
      setSelectedType('');
      setSelectedProvider('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (integrationId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('integrations')
        .update({ is_active: !isActive })
        .eq('id', integrationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Integration ${!isActive ? 'activated' : 'deactivated'} successfully`,
      });

      fetchIntegrations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTestConnection = async (integrationId: string) => {
    try {
      // In a real implementation, this would test the connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { error } = await supabase
        .from('integrations')
        .update({ 
          sync_status: 'success',
          last_sync_at: new Date().toISOString(),
          error_message: null
        })
        .eq('id', integrationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Connection test successful",
      });

      fetchIntegrations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Connection test failed",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (integrationId: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) return;

    try {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', integrationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Integration deleted successfully",
      });

      fetchIntegrations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (integration: Integration) => {
    setEditingIntegration(integration);
    setSelectedType(integration.integration_type);
    setSelectedProvider(integration.provider_name);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingIntegration(null);
    setSelectedType('');
    setSelectedProvider('');
  };

  const getStatusBadge = (status: string) => {
    const config = {
      success: { label: 'Connected', variant: 'default' as const },
      failed: { label: 'Failed', variant: 'destructive' as const },
      never_synced: { label: 'Not Tested', variant: 'secondary' as const },
      syncing: { label: 'Testing', variant: 'outline' as const }
    };
    
    const statusConfig = config[status as keyof typeof config] || config.never_synced;
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
  };

  const getProviderOptions = () => {
    const selectedIntegrationType = INTEGRATION_TYPES.find(t => t.value === selectedType);
    return selectedIntegrationType?.providers || [];
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading integrations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Integration Manager</h1>
          <p className="text-muted-foreground">Connect with third-party services and APIs</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingIntegration ? 'Edit' : 'Create'} Integration</DialogTitle>
              <DialogDescription>
                Connect with external services to enhance your business capabilities
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="integration_name">Integration Name *</Label>
                <Input
                  id="integration_name"
                  name="integration_name"
                  required
                  defaultValue={editingIntegration?.integration_name}
                  placeholder="e.g., Gmail Email Service"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="integration_type">Integration Type *</Label>
                  <Select value={selectedType} onValueChange={setSelectedType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {INTEGRATION_TYPES.map((type) => (
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
                  <Label htmlFor="provider_name">Provider *</Label>
                  <Select 
                    value={selectedProvider} 
                    onValueChange={setSelectedProvider} 
                    required
                    disabled={!selectedType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {getProviderOptions().map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {provider.charAt(0).toUpperCase() + provider.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="api_key">API Key *</Label>
                  <Input
                    id="api_key"
                    name="api_key"
                    type="password"
                    required
                    defaultValue={(editingIntegration?.configuration as any)?.api_key}
                    placeholder="Your API key"
                  />
                </div>
                <div>
                  <Label htmlFor="api_secret">API Secret (if required)</Label>
                  <Input
                    id="api_secret"
                    name="api_secret"
                    type="password"
                    defaultValue={(editingIntegration?.configuration as any)?.api_secret}
                    placeholder="Your API secret"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="webhook_url">Webhook URL (Optional)</Label>
                <Input
                  id="webhook_url"
                  name="webhook_url"
                  type="url"
                  defaultValue={(editingIntegration?.configuration as any)?.webhook_url}
                  placeholder="https://your-domain.com/webhook"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingIntegration ? 'Update' : 'Create'} Integration
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Integrations</TabsTrigger>
          <TabsTrigger value="available">Available Services</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {integrations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No integrations found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Connect with external services to enhance your business
                </p>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Integration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {integrations.map((integration) => {
                const integrationType = INTEGRATION_TYPES.find(t => t.value === integration.integration_type);
                const IconComponent = integrationType?.icon || Zap;
                
                return (
                  <Card key={integration.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-8 w-8 text-primary" />
                          <div>
                            <CardTitle className="text-lg">{integration.integration_name}</CardTitle>
                            <CardDescription>
                              {integration.provider_name} • {integrationType?.label}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={integration.is_active ? "default" : "secondary"}>
                            {integration.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {getStatusBadge(integration.sync_status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {integration.last_sync_at ? (
                            <>Last sync: {new Date(integration.last_sync_at).toLocaleString()}</>
                          ) : (
                            <>Created: {new Date(integration.created_at).toLocaleDateString()}</>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestConnection(integration.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Test
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(integration.id, integration.is_active)}
                          >
                            {integration.is_active ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-1" />
                                Disable
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-1" />
                                Enable
                              </>
                            )}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(integration)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(integration.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                      {integration.error_message && (
                        <div className="mt-2 p-2 bg-destructive/10 rounded text-sm text-destructive">
                          {integration.error_message}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {INTEGRATION_TYPES.map((type) => (
              <Card key={type.value} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <type.icon className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{type.label}</CardTitle>
                      <CardDescription>{type.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {type.providers.map((provider) => (
                      <Badge key={provider} variant="outline">
                        {provider}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setSelectedType(type.value);
                      setIsFormOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};