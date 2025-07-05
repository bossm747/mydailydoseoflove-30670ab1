import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, AlertTriangle, TrendingUp, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Budget {
  id: string;
  category: string;
  monthly_limit: number;
  spent: number;
  currency: string;
  period: string;
}

const categories = [
  'Business Expenses',
  'Office Supplies', 
  'Marketing',
  'Travel',
  'Technology',
  'Professional Services',
  'Utilities',
  'Entertainment',
  'Other'
];

export default function BudgetManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [budgetForm, setBudgetForm] = useState({
    category: '',
    monthly_limit: '',
    currency: 'PHP',
    period: 'monthly'
  });

  // Mock budget data for now
  useEffect(() => {
    const mockBudgets: Budget[] = [
      { id: '1', category: 'Business Expenses', monthly_limit: 15000, spent: 12500, currency: 'PHP', period: 'monthly' },
      { id: '2', category: 'Marketing', monthly_limit: 8000, spent: 5200, currency: 'PHP', period: 'monthly' },
      { id: '3', category: 'Travel', monthly_limit: 10000, spent: 8750, currency: 'PHP', period: 'monthly' },
      { id: '4', category: 'Technology', monthly_limit: 5000, spent: 2100, currency: 'PHP', period: 'monthly' },
    ];
    setBudgets(mockBudgets);
  }, []);

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const newBudget: Budget = {
        id: Date.now().toString(),
        category: budgetForm.category,
        monthly_limit: parseFloat(budgetForm.monthly_limit),
        spent: 0,
        currency: budgetForm.currency,
        period: budgetForm.period
      };
      
      setBudgets(prev => [...prev, newBudget]);
      
      toast({
        title: "Budget created",
        description: `Budget for ${budgetForm.category} has been set.`,
      });

      setBudgetForm({
        category: '',
        monthly_limit: '',
        currency: 'PHP',
        period: 'monthly'
      });
      setShowBudgetForm(false);
    } catch (error) {
      console.error('Error creating budget:', error);
      toast({
        title: "Failed to create budget",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 75) return 'bg-warning';
    return 'bg-success';
  };

  const getStatusBadge = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return { variant: 'destructive' as const, text: 'Exceeded' };
    if (percentage >= 90) return { variant: 'destructive' as const, text: 'Critical' };
    if (percentage >= 75) return { variant: 'default' as const, text: 'Warning' };
    return { variant: 'secondary' as const, text: 'On Track' };
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.monthly_limit, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const overBudgetCount = budgets.filter(b => b.spent > b.monthly_limit).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold gradient-text">Budget Management</h2>
          <p className="text-muted-foreground">Track and manage your business spending limits</p>
        </div>
        
        <Dialog open={showBudgetForm} onOpenChange={setShowBudgetForm}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Create Budget</span>
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <Label>Category</Label>
                <Select value={budgetForm.category} onValueChange={(value) => 
                  setBudgetForm(prev => ({ ...prev, category: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="limit">Monthly Limit</Label>
                  <Input
                    id="limit"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={budgetForm.monthly_limit}
                    onChange={(e) => setBudgetForm(prev => ({ ...prev, monthly_limit: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select value={budgetForm.currency} onValueChange={(value) => 
                    setBudgetForm(prev => ({ ...prev, currency: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PHP">₱ PHP</SelectItem>
                      <SelectItem value="AED">د.إ AED</SelectItem>
                      <SelectItem value="USD">$ USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowBudgetForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Creating..." : "Create Budget"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-elegant">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center">
                <Target className="text-white" size={24} />
              </div>
              <Badge variant="secondary">Total</Badge>
            </div>
            <h3 className="text-2xl font-bold text-primary mb-1">₱{totalBudget.toLocaleString()}</h3>
            <p className="text-muted-foreground text-sm">Monthly Budget</p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-warning to-warning/80 rounded-full flex items-center justify-center">
                <TrendingUp className="text-white" size={24} />
              </div>
              <Badge variant="secondary">Spent</Badge>
            </div>
            <h3 className="text-2xl font-bold text-warning mb-1">₱{totalSpent.toLocaleString()}</h3>
            <p className="text-muted-foreground text-sm">This Month</p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-destructive to-destructive/80 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-white" size={24} />
              </div>
              <Badge variant={overBudgetCount > 0 ? "destructive" : "secondary"}>
                {overBudgetCount > 0 ? "Alert" : "Good"}
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-destructive mb-1">{overBudgetCount}</h3>
            <p className="text-muted-foreground text-sm">Over Budget</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget List */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Budget Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {budgets.map((budget) => {
              const percentage = (budget.spent / budget.monthly_limit) * 100;
              const status = getStatusBadge(budget.spent, budget.monthly_limit);
              
              return (
                <div key={budget.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <h4 className="font-medium">{budget.category}</h4>
                        <p className="text-sm text-muted-foreground">
                          {budget.currency} {budget.spent.toLocaleString()} / {budget.currency} {budget.monthly_limit.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={status.variant} className="text-xs">
                        {status.text}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className={`h-2`}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{percentage.toFixed(1)}% used</span>
                      <span>
                        {budget.monthly_limit - budget.spent > 0 
                          ? `₱${(budget.monthly_limit - budget.spent).toLocaleString()} remaining`
                          : `₱${(budget.spent - budget.monthly_limit).toLocaleString()} over budget`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}