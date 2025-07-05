import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Filter, TrendingUp, DollarSign, AlertTriangle, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BudgetForm } from './BudgetForm';

interface Budget {
  id: string;
  budget_name: string;
  budget_type: string;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  remaining_amount: number;
  budget_period_start: string;
  budget_period_end: string;
  alert_threshold: number;
  is_active: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function BudgetManager() {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  useEffect(() => {
    if (user) {
      fetchBudgets();
    }
  }, [user, currentBusiness]);

  const fetchBudgets = async () => {
    try {
      let query = supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (currentBusiness) {
        query = query.eq('business_id', currentBusiness.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      setBudgets(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch budgets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBudget = async (budgetData: any) => {
    try {
      if (selectedBudget) {
        const { error } = await supabase
          .from('budgets')
          .update(budgetData)
          .eq('id', selectedBudget.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Budget updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('budgets')
          .insert([{
            ...budgetData,
            user_id: user!.id,
            business_id: currentBusiness?.id || null,
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Budget created successfully",
        });
      }

      fetchBudgets();
      setIsFormOpen(false);
      setSelectedBudget(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (budget: Budget) => {
    const percentage = (budget.spent_amount / budget.allocated_amount) * 100;
    
    if (percentage >= budget.alert_threshold) {
      return <Badge variant="destructive">Over Threshold</Badge>;
    } else if (percentage >= 75) {
      return <Badge variant="secondary">Warning</Badge>;
    } else {
      return <Badge variant="default">On Track</Badge>;
    }
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.budget_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (budget.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || budget.budget_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalAllocated = filteredBudgets.reduce((sum, budget) => sum + budget.allocated_amount, 0);
  const totalSpent = filteredBudgets.reduce((sum, budget) => sum + budget.spent_amount, 0);

  if (loading) {
    return <div className="flex justify-center p-8">Loading budgets...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Budget Management</h1>
        <p className="text-muted-foreground">Track and manage your budgets and spending</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Budgets</p>
                <p className="text-2xl font-bold">{filteredBudgets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Allocated</p>
                <p className="text-2xl font-bold">₱{totalAllocated.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">₱{totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search budgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedBudget(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedBudget ? 'Edit Budget' : 'Add New Budget'}
              </DialogTitle>
              <DialogDescription>
                {selectedBudget ? 'Update budget details' : 'Create a new budget to track spending'}
              </DialogDescription>
            </DialogHeader>
            <BudgetForm
              budget={selectedBudget}
              onSave={handleSaveBudget}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Budgets List */}
      {filteredBudgets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No budgets found</h3>
            <p className="text-muted-foreground mb-4">
              Start by creating your first budget
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredBudgets.map((budget) => {
            const percentage = (budget.spent_amount / budget.allocated_amount) * 100;
            
            return (
              <Card key={budget.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{budget.budget_name}</h3>
                        {getStatusBadge(budget)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Type: {budget.budget_type}</span>
                        {budget.category && <span>Category: {budget.category}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        ₱{budget.spent_amount.toLocaleString()} / ₱{budget.allocated_amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ₱{budget.remaining_amount.toLocaleString()} remaining
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={Math.min(percentage, 100)} className="h-2" />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBudget(budget);
                        setIsFormOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}