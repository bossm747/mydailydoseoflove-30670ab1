import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Home, Car, GraduationCap, User, Plus, Edit2, Trash2, Calendar, AlertTriangle } from 'lucide-react';

interface Debt {
  id: string;
  debt_name: string;
  debt_type: string;
  creditor_name: string;
  original_amount: number;
  current_balance: number;
  interest_rate: number;
  minimum_payment?: number;
  payment_frequency: string;
  due_date?: string;
  maturity_date?: string;
  is_active: boolean;
  auto_pay: boolean;
  created_at: string;
}

const DEBT_TYPES = [
  { value: 'mortgage', label: 'Mortgage', icon: Home, color: 'bg-blue-100 text-blue-800' },
  { value: 'car_loan', label: 'Car Loan', icon: Car, color: 'bg-green-100 text-green-800' },
  { value: 'credit_card', label: 'Credit Card', icon: CreditCard, color: 'bg-red-100 text-red-800' },
  { value: 'personal_loan', label: 'Personal Loan', icon: User, color: 'bg-purple-100 text-purple-800' },
  { value: 'student_loan', label: 'Student Loan', icon: GraduationCap, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'other', label: 'Other', icon: CreditCard, color: 'bg-gray-100 text-gray-800' }
];

const PAYMENT_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' }
];

export default function DebtTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchDebts = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching debts",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setDebts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDebts();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    
    const debtData = {
      user_id: user.id,
      debt_name: formData.get('debt_name') as string,
      debt_type: formData.get('debt_type') as string,
      creditor_name: formData.get('creditor_name') as string,
      original_amount: parseFloat(formData.get('original_amount') as string),
      current_balance: parseFloat(formData.get('current_balance') as string),
      interest_rate: parseFloat(formData.get('interest_rate') as string) / 100,
      minimum_payment: formData.get('minimum_payment') ? parseFloat(formData.get('minimum_payment') as string) : null,
      payment_frequency: formData.get('payment_frequency') as string,
      due_date: formData.get('due_date') as string || null,
      maturity_date: formData.get('maturity_date') as string || null,
      auto_pay: formData.get('auto_pay') === 'on'
    };

    let result;
    if (editingDebt) {
      result = await supabase
        .from('debts')
        .update(debtData)
        .eq('id', editingDebt.id);
    } else {
      result = await supabase
        .from('debts')
        .insert([debtData]);
    }

    if (result.error) {
      toast({
        title: "Error saving debt",
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: editingDebt ? "Debt updated" : "Debt added",
        description: `${debtData.debt_name} has been ${editingDebt ? 'updated' : 'added'} successfully.`,
      });
      setIsDialogOpen(false);
      setEditingDebt(null);
      fetchDebts();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting debt",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Debt deleted",
        description: "Debt has been deleted successfully.",
      });
      fetchDebts();
    }
  };

  const makePayment = async (debtId: string, paymentAmount: number) => {
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;

    const newBalance = Math.max(0, debt.current_balance - paymentAmount);
    
    const { error } = await supabase
      .from('debts')
      .update({ current_balance: newBalance })
      .eq('id', debtId);

    if (error) {
      toast({
        title: "Error processing payment",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment recorded",
        description: `Payment of ₱${paymentAmount.toLocaleString()} has been recorded.`,
      });

      // Also record as transaction
      await supabase
        .from('transactions')
        .insert([{
          user_id: user!.id,
          amount: paymentAmount,
          description: `Payment to ${debt.debt_name}`,
          category: 'Debt Payment',
          transaction_type: 'expense',
          transaction_date: new Date().toISOString().split('T')[0]
        }]);

      fetchDebts();
    }
  };

  const getDebtIcon = (type: string) => {
    const debtType = DEBT_TYPES.find(t => t.value === type);
    return debtType?.icon || CreditCard;
  };

  const getDebtTypeColor = (type: string) => {
    const debtType = DEBT_TYPES.find(t => t.value === type);
    return debtType?.color || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  const calculatePayoffProgress = (originalAmount: number, currentBalance: number) => {
    return ((originalAmount - currentBalance) / originalAmount) * 100;
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalDebt = debts.reduce((sum, debt) => sum + debt.current_balance, 0);
  const totalMinimumPayments = debts.reduce((sum, debt) => sum + (debt.minimum_payment || 0), 0);
  const averageInterestRate = debts.length > 0 
    ? debts.reduce((sum, debt) => sum + debt.interest_rate, 0) / debts.length * 100 
    : 0;

  const upcomingPayments = debts
    .filter(debt => debt.due_date && debt.is_active)
    .map(debt => ({
      ...debt,
      daysUntilDue: getDaysUntilDue(debt.due_date!)
    }))
    .filter(debt => debt.daysUntilDue <= 7)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Debt</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDebt)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Payments</p>
                <p className="text-2xl font-bold">{formatCurrency(totalMinimumPayments)}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Interest Rate</p>
                <p className="text-2xl font-bold">{averageInterestRate.toFixed(1)}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Debts</p>
                <p className="text-2xl font-bold">{debts.filter(d => d.is_active).length}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payments Alert */}
      {upcomingPayments.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Upcoming Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingPayments.map((debt) => (
                <div key={debt.id} className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="font-medium">{debt.debt_name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {debt.minimum_payment && formatCurrency(debt.minimum_payment)}
                    </span>
                    <Badge variant={debt.daysUntilDue <= 3 ? "destructive" : "secondary"}>
                      {debt.daysUntilDue === 0 ? 'Due Today' : 
                       debt.daysUntilDue === 1 ? 'Due Tomorrow' : 
                       `${debt.daysUntilDue} days`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Debt Tracker</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingDebt(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Debt
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingDebt ? 'Edit Debt' : 'Add New Debt'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="debt_name">Debt Name</Label>
                      <Input
                        id="debt_name"
                        name="debt_name"
                        defaultValue={editingDebt?.debt_name}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="debt_type">Debt Type</Label>
                      <Select name="debt_type" defaultValue={editingDebt?.debt_type}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select debt type" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEBT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="creditor_name">Creditor/Lender</Label>
                      <Input
                        id="creditor_name"
                        name="creditor_name"
                        defaultValue={editingDebt?.creditor_name}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="original_amount">Original Amount (₱)</Label>
                      <Input
                        id="original_amount"
                        name="original_amount"
                        type="number"
                        step="0.01"
                        defaultValue={editingDebt?.original_amount}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="current_balance">Current Balance (₱)</Label>
                      <Input
                        id="current_balance"
                        name="current_balance"
                        type="number"
                        step="0.01"
                        defaultValue={editingDebt?.current_balance}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                      <Input
                        id="interest_rate"
                        name="interest_rate"
                        type="number"
                        step="0.01"
                        defaultValue={editingDebt?.interest_rate ? (editingDebt.interest_rate * 100).toFixed(2) : ''}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="minimum_payment">Minimum Payment (₱)</Label>
                      <Input
                        id="minimum_payment"
                        name="minimum_payment"
                        type="number"
                        step="0.01"
                        defaultValue={editingDebt?.minimum_payment}
                      />
                    </div>

                    <div>
                      <Label htmlFor="payment_frequency">Payment Frequency</Label>
                      <Select name="payment_frequency" defaultValue={editingDebt?.payment_frequency || 'monthly'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_FREQUENCIES.map((freq) => (
                            <SelectItem key={freq.value} value={freq.value}>
                              {freq.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="due_date">Next Due Date</Label>
                      <Input
                        id="due_date"
                        name="due_date"
                        type="date"
                        defaultValue={editingDebt?.due_date}
                      />
                    </div>

                    <div>
                      <Label htmlFor="maturity_date">Maturity Date</Label>
                      <Input
                        id="maturity_date"
                        name="maturity_date"
                        type="date"
                        defaultValue={editingDebt?.maturity_date}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto_pay"
                      name="auto_pay"
                      defaultChecked={editingDebt?.auto_pay}
                      className="rounded"
                    />
                    <Label htmlFor="auto_pay">Auto-pay enabled</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingDebt ? 'Update' : 'Add'} Debt
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : debts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No debts recorded</p>
              <p className="text-sm">Add your first debt to start tracking</p>
            </div>
          ) : (
            <div className="space-y-4">
              {debts.map((debt) => {
                const Icon = getDebtIcon(debt.debt_type);
                const progress = calculatePayoffProgress(debt.original_amount, debt.current_balance);
                const daysUntilDue = debt.due_date ? getDaysUntilDue(debt.due_date) : null;
                
                return (
                  <Card key={debt.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{debt.debt_name}</h3>
                            <Badge className={getDebtTypeColor(debt.debt_type)}>
                              {DEBT_TYPES.find(t => t.value === debt.debt_type)?.label}
                            </Badge>
                            {debt.auto_pay && <Badge variant="outline">Auto-pay</Badge>}
                            {!debt.is_active && <Badge variant="outline">Inactive</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{debt.creditor_name}</p>
                          {daysUntilDue !== null && daysUntilDue <= 7 && (
                            <Badge variant={daysUntilDue <= 3 ? "destructive" : "secondary"} className="mt-1">
                              {daysUntilDue === 0 ? 'Due Today' : 
                               daysUntilDue === 1 ? 'Due Tomorrow' : 
                               `Due in ${daysUntilDue} days`}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const payment = prompt('Enter payment amount:');
                            if (payment && parseFloat(payment) > 0) {
                              makePayment(debt.id, parseFloat(payment));
                            }
                          }}
                        >
                          Pay
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingDebt(debt);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this debt?')) {
                              handleDelete(debt.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Balance:</span>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(debt.current_balance)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Original Amount:</span>
                        <span className="text-sm">{formatCurrency(debt.original_amount)}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Progress:</span>
                        <span className="text-sm font-medium">{progress.toFixed(1)}% paid off</span>
                      </div>

                      <Progress value={progress} className="h-2" />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Interest Rate:</span>
                          <span>{(debt.interest_rate * 100).toFixed(2)}%</span>
                        </div>
                        {debt.minimum_payment && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Min Payment:</span>
                            <span>{formatCurrency(debt.minimum_payment)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}