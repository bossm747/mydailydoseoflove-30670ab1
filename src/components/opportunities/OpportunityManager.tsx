import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Filter, TrendingUp, DollarSign, Calendar, User, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { OpportunityForm } from './OpportunityForm';

interface Opportunity {
  id: string;
  opportunity_name: string;
  customer_id: string;
  value: number;
  probability: number;
  stage: string;
  expected_close_date: string;
  source: string;
  status: string;
  description: string;
  tags: string[];
  assigned_to: string;
  created_at: string;
  updated_at: string;
}

export default function OpportunityManager() {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  useEffect(() => {
    if (user) {
      fetchOpportunities();
    }
  }, [user, currentBusiness]);

  const fetchOpportunities = async () => {
    try {
      let query = supabase
        .from('opportunities')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (currentBusiness) {
        query = query.eq('business_id', currentBusiness.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      setOpportunities(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch opportunities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOpportunity = async (opportunityData: any) => {
    try {
      if (selectedOpportunity) {
        const { error } = await supabase
          .from('opportunities')
          .update(opportunityData)
          .eq('id', selectedOpportunity.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Opportunity updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('opportunities')
          .insert([{
            ...opportunityData,
            user_id: user!.id,
            business_id: currentBusiness?.id || null,
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Opportunity created successfully",
        });
      }

      fetchOpportunities();
      setIsFormOpen(false);
      setSelectedOpportunity(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'open': { label: 'Open', variant: 'default' as const },
      'qualified': { label: 'Qualified', variant: 'secondary' as const },
      'proposal': { label: 'Proposal', variant: 'outline' as const },
      'negotiation': { label: 'Negotiation', variant: 'secondary' as const },
      'won': { label: 'Won', variant: 'default' as const },
      'lost': { label: 'Lost', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.opportunity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (opportunity.source || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || opportunity.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalValue = filteredOpportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
  const averageProbability = filteredOpportunities.length > 0 
    ? filteredOpportunities.reduce((sum, opp) => sum + (opp.probability || 0), 0) / filteredOpportunities.length 
    : 0;

  if (loading) {
    return <div className="flex justify-center p-8">Loading opportunities...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Opportunity Management</h1>
        <p className="text-muted-foreground">Track and manage your sales opportunities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Opportunities</p>
                <p className="text-2xl font-bold">{filteredOpportunities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">₱{totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Probability</p>
                <p className="text-2xl font-bold">{averageProbability.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="qualified">Qualified</option>
          <option value="proposal">Proposal</option>
          <option value="negotiation">Negotiation</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedOpportunity(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Opportunity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedOpportunity ? 'Edit Opportunity' : 'Add New Opportunity'}
              </DialogTitle>
              <DialogDescription>
                {selectedOpportunity ? 'Update opportunity details' : 'Create a new sales opportunity'}
              </DialogDescription>
            </DialogHeader>
            <OpportunityForm
              opportunity={selectedOpportunity}
              onSave={handleSaveOpportunity}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Opportunities List */}
      {filteredOpportunities.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
            <p className="text-muted-foreground mb-4">
              Start by creating your first sales opportunity
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Opportunity
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{opportunity.opportunity_name}</h3>
                      {getStatusBadge(opportunity.status)}
                    </div>
                    <p className="text-muted-foreground">Customer ID: {opportunity.customer_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ₱{(opportunity.value || 0).toLocaleString()}
                    </p>
                    <p className={`text-sm ${getProbabilityColor(opportunity.probability || 0)}`}>
                      {opportunity.probability || 0}% probability
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Assigned: {opportunity.assigned_to || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {opportunity.expected_close_date 
                        ? new Date(opportunity.expected_close_date).toLocaleDateString()
                        : 'No date set'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Stage:</span>
                    <span className="text-sm">{opportunity.stage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Source:</span>
                    <span className="text-sm">{opportunity.source}</span>
                  </div>
                </div>

                {opportunity.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {opportunity.description}
                  </p>
                )}

                {opportunity.tags && opportunity.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {opportunity.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedOpportunity(opportunity);
                      setIsFormOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}