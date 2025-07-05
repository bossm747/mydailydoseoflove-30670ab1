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
import { UserCheck, Plus, Search, Mail, Phone, Building, Calendar, Target, TrendingUp } from 'lucide-react';
import { LeadForm } from './LeadForm';

interface Lead {
  id: string;
  business_id?: string;
  user_id: string;
  first_name: string;
  last_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  status: string;
  priority: string;
  estimated_value: number;
  expected_close_date?: string;
  probability: number;
  next_follow_up?: string;
  lead_source?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
}

export default function LeadsManager() {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchLeads = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('business_id', currentBusiness?.id || null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching leads",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user, currentBusiness]);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || lead.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const getLeadDisplayName = (lead: Lead) => {
    const fullName = `${lead.first_name} ${lead.last_name || ''}`.trim();
    if (lead.company_name) {
      return `${fullName} (${lead.company_name})`;
    }
    return fullName;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'default';
      case 'contacted': return 'secondary';
      case 'qualified': return 'outline';
      case 'proposal': return 'default';
      case 'won': return 'default';
      case 'lost': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const convertToCustomer = async (lead: Lead) => {
    try {
      // Create customer from lead
      const customerData = {
        business_id: currentBusiness?.id || null,
        user_id: user?.id,
        customer_type: lead.company_name ? 'company' : 'individual',
        first_name: lead.first_name,
        last_name: lead.last_name,
        company_name: lead.company_name,
        email: lead.email,
        phone: lead.phone,
        status: 'active',
        notes: lead.notes,
        tags: lead.tags,
      };

      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (customerError) throw customerError;

      // Update lead with conversion info
      const { error: leadError } = await supabase
        .from('leads')
        .update({
          status: 'won',
          converted_to_customer: customer.id,
          converted_at: new Date().toISOString(),
        })
        .eq('id', lead.id);

      if (leadError) throw leadError;

      toast({
        title: "Lead converted",
        description: "Lead has been successfully converted to customer.",
      });

      fetchLeads();
    } catch (error: any) {
      toast({
        title: "Error converting lead",
        description: error.message,
        variant: "destructive",
      });
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
          <h1 className="text-3xl font-bold gradient-text">Lead Management</h1>
          <p className="text-muted-foreground mt-2">
            Track and nurture your sales leads
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{leads.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Qualified</p>
                <p className="text-2xl font-bold">
                  {leads.filter(l => l.status === 'qualified').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Est. Value</p>
                <p className="text-2xl font-bold">
                  ₱{leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Follow-ups</p>
                <p className="text-2xl font-bold">
                  {leads.filter(l => l.next_follow_up && new Date(l.next_follow_up) <= new Date()).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({leads.length})</TabsTrigger>
          <TabsTrigger value="new">New ({leads.filter(l => l.status === 'new').length})</TabsTrigger>
          <TabsTrigger value="contacted">Contacted ({leads.filter(l => l.status === 'contacted').length})</TabsTrigger>
          <TabsTrigger value="qualified">Qualified ({leads.filter(l => l.status === 'qualified').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredLeads.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <UserCheck className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No leads found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first lead'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Lead
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLeads.map((lead) => (
                <Card key={lead.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span className="truncate">{getLeadDisplayName(lead)}</span>
                      <div className="flex space-x-1">
                        <Badge variant={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                        <Badge variant={getPriorityColor(lead.priority)}>
                          {lead.priority}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {lead.email && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-4 w-4 mr-2" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                      )}
                      
                      {lead.phone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{lead.phone}</span>
                        </div>
                      )}

                      {lead.estimated_value > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Est. Value:</span>
                          <span className="font-semibold">₱{lead.estimated_value.toLocaleString()}</span>
                        </div>
                      )}

                      {lead.probability > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Probability:</span>
                          <span className="font-semibold">{lead.probability}%</span>
                        </div>
                      )}

                      {lead.next_follow_up && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Follow-up: {new Date(lead.next_follow_up).toLocaleDateString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingLead(lead)}
                        >
                          Edit
                        </Button>
                        {lead.status !== 'won' && lead.status !== 'lost' && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => convertToCustomer(lead)}
                          >
                            Convert
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
      </Tabs>

      <Dialog open={showCreateDialog || !!editingLead} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingLead(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLead ? 'Edit Lead' : 'Add New Lead'}
            </DialogTitle>
          </DialogHeader>
          <LeadForm 
            lead={editingLead}
            onClose={() => {
              setShowCreateDialog(false);
              setEditingLead(null);
            }}
            onSaved={fetchLeads}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}