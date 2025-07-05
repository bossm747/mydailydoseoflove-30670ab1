import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Plus, Search, Mail, Phone, Building, MapPin, Filter } from 'lucide-react';
import { CustomerForm } from './CustomerForm';

interface Customer {
  id: string;
  business_id?: string;
  user_id: string;
  customer_type: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  status: string;
  customer_since: string;
  credit_limit: number;
  payment_terms: string;
  notes?: string;
  tags?: string[];
  created_at: string;
}

export default function CustomerManager() {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchCustomers = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', currentBusiness?.id || null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching customers",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [user, currentBusiness]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchTerm === '' || 
      customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || customer.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const getCustomerDisplayName = (customer: Customer) => {
    if (customer.customer_type === 'company' && customer.company_name) {
      return customer.company_name;
    }
    return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unnamed Customer';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'prospect': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Customer Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your customers and client relationships
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({customers.length})</TabsTrigger>
          <TabsTrigger value="active">
            Active ({customers.filter(c => c.status === 'active').length})
          </TabsTrigger>
          <TabsTrigger value="prospect">
            Prospects ({customers.filter(c => c.status === 'prospect').length})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactive ({customers.filter(c => c.status === 'inactive').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredCustomers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No customers found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first customer'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Customer
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((customer) => (
                <Card key={customer.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setEditingCustomer(customer)}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <div className="flex items-center">
                        {customer.customer_type === 'company' ? (
                          <Building className="h-5 w-5 mr-2" />
                        ) : (
                          <Users className="h-5 w-5 mr-2" />
                        )}
                        <span className="truncate">{getCustomerDisplayName(customer)}</span>
                      </div>
                      <Badge variant={getStatusColor(customer.status)}>
                        {customer.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {customer.email && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-4 w-4 mr-2" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                      )}
                      
                      {customer.phone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{customer.phone}</span>
                        </div>
                      )}

                      {customer.customer_type === 'individual' && customer.company_name && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Building className="h-4 w-4 mr-2" />
                          <span className="truncate">{customer.company_name}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                        <span>Customer since {new Date(customer.customer_since).getFullYear()}</span>
                        {customer.credit_limit > 0 && (
                          <span>Credit: ₱{customer.credit_limit.toLocaleString()}</span>
                        )}
                      </div>

                      {customer.tags && customer.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {customer.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {customer.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{customer.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showCreateDialog || !!editingCustomer} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingCustomer(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </DialogTitle>
          </DialogHeader>
          <CustomerForm 
            customer={editingCustomer}
            onClose={() => {
              setShowCreateDialog(false);
              setEditingCustomer(null);
            }}
            onSaved={fetchCustomers}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}