import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Settings, TrendingUp, DollarSign, Target, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PipelineStageForm } from './PipelineStageForm';

interface PipelineStage {
  id: string;
  stage_name: string;
  stage_order: number;
  stage_color: string;
  probability_percentage: number;
  is_active: boolean;
}

interface Opportunity {
  id: string;
  opportunity_name: string;
  value: number;
  probability: number;
  stage: string;
  status: string;
}

export default function SalesPipelineManager() {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStageFormOpen, setIsStageFormOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);

  useEffect(() => {
    if (user) {
      fetchPipelineData();
    }
  }, [user, currentBusiness]);

  const fetchPipelineData = async () => {
    try {
      await Promise.all([
        fetchPipelineStages(),
        fetchOpportunities()
      ]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch pipeline data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPipelineStages = async () => {
    let query = supabase
      .from('sales_pipeline_stages')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_active', true)
      .order('stage_order', { ascending: true });

    if (currentBusiness) {
      query = query.eq('business_id', currentBusiness.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    // If no stages exist, create default ones
    if (!data || data.length === 0) {
      await createDefaultStages();
      return fetchPipelineStages();
    }

    setPipelineStages(data || []);
  };

  const fetchOpportunities = async () => {
    let query = supabase
      .from('opportunities')
      .select('id, opportunity_name, value, probability, stage, status')
      .eq('user_id', user!.id)
      .in('status', ['open', 'qualified', 'proposal', 'negotiation']);

    if (currentBusiness) {
      query = query.eq('business_id', currentBusiness.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    setOpportunities(data || []);
  };

  const createDefaultStages = async () => {
    const defaultStages = [
      { stage_name: 'Lead', stage_order: 1, stage_color: '#6B7280', probability_percentage: 10 },
      { stage_name: 'Qualified', stage_order: 2, stage_color: '#3B82F6', probability_percentage: 25 },
      { stage_name: 'Proposal', stage_order: 3, stage_color: '#F59E0B', probability_percentage: 50 },
      { stage_name: 'Negotiation', stage_order: 4, stage_color: '#EF4444', probability_percentage: 75 },
      { stage_name: 'Closed Won', stage_order: 5, stage_color: '#10B981', probability_percentage: 100 },
    ];

    for (const stage of defaultStages) {
      await supabase
        .from('sales_pipeline_stages')
        .insert({
          ...stage,
          user_id: user!.id,
          business_id: currentBusiness?.id || null,
        });
    }
  };

  const handleSaveStage = async (stageData: any) => {
    try {
      if (selectedStage) {
        const { error } = await supabase
          .from('sales_pipeline_stages')
          .update(stageData)
          .eq('id', selectedStage.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Pipeline stage updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('sales_pipeline_stages')
          .insert([{
            ...stageData,
            user_id: user!.id,
            business_id: currentBusiness?.id || null,
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Pipeline stage created successfully",
        });
      }

      fetchPipelineStages();
      setIsStageFormOpen(false);
      setSelectedStage(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getOpportunitiesForStage = (stageName: string) => {
    return opportunities.filter(opp => opp.stage.toLowerCase() === stageName.toLowerCase());
  };

  const getTotalValueForStage = (stageName: string) => {
    return getOpportunitiesForStage(stageName).reduce((sum, opp) => sum + (opp.value || 0), 0);
  };

  const getTotalPipelineValue = () => {
    return opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading sales pipeline...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-2">Sales Pipeline</h1>
          <p className="text-muted-foreground">Visualize and manage your sales opportunities</p>
        </div>
        <Dialog open={isStageFormOpen} onOpenChange={setIsStageFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedStage(null)}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Stages
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedStage ? 'Edit Pipeline Stage' : 'Add Pipeline Stage'}
              </DialogTitle>
              <DialogDescription>
                {selectedStage ? 'Update stage details' : 'Create a new pipeline stage'}
              </DialogDescription>
            </DialogHeader>
            <PipelineStageForm
              stage={selectedStage}
              onSave={handleSaveStage}
              onCancel={() => setIsStageFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Opportunities</p>
                <p className="text-2xl font-bold">{opportunities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
                <p className="text-2xl font-bold">₱{getTotalPipelineValue().toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Stages</p>
                <p className="text-2xl font-bold">{pipelineStages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Visualization */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Pipeline Stages</h2>
        
        {pipelineStages.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No pipeline stages configured</h3>
              <p className="text-muted-foreground mb-4">
                Set up your sales pipeline stages to track opportunities
              </p>
              <Button onClick={() => setIsStageFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Stage
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {pipelineStages.map((stage) => {
              const stageOpportunities = getOpportunitiesForStage(stage.stage_name);
              const stageValue = getTotalValueForStage(stage.stage_name);
              
              return (
                <Card key={stage.id} className="min-h-[300px]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: stage.stage_color }}
                        />
                        <CardTitle className="text-lg">{stage.stage_name}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedStage(stage);
                          setIsStageFormOpen(true);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{stageOpportunities.length} opportunities</span>
                      <span>{stage.probability_percentage}% prob.</span>
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      ₱{stageValue.toLocaleString()}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {stageOpportunities.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No opportunities in this stage
                        </p>
                      ) : (
                        stageOpportunities.map((opportunity) => (
                          <div 
                            key={opportunity.id}
                            className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-medium text-sm truncate">
                                {opportunity.opportunity_name}
                              </h4>
                              <Badge variant="outline" className="text-xs ml-2">
                                {opportunity.probability}%
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {opportunity.status}
                            </p>
                            <p className="text-sm font-semibold text-green-600">
                              ₱{(opportunity.value || 0).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}