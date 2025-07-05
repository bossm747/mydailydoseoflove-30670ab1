import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Wallet, CreditCard, PiggyBank, TrendingUp, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';

interface BankAccount {
  id: string;
  account_name: string;
  account_type: string;
  institution_name: string;
  account_number_masked?: string;
  current_balance: number;
  currency: string;
  interest_rate?: number;
  credit_limit?: number;
  is_active: boolean;
  last_updated: string;
}

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking Account', icon: Wallet },
  { value: 'savings', label: 'Savings Account', icon: PiggyBank },
  { value: 'credit', label: 'Credit Card', icon: CreditCard },
  { value: 'investment', label: 'Investment Account', icon: TrendingUp },
  { value: 'loan', label: 'Loan Account', icon: CreditCard }
];

const CURRENCIES = [
  { code: 'PHP', symbol: '₱' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' }
];

export default function BankAccountManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchAccounts = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching accounts",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setAccounts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const accountData = {
      user_id: user.id,
      account_name: formData.get('account_name') as string,
      account_type: formData.get('account_type') as string,
      institution_name: formData.get('institution_name') as string,
      account_number_masked: formData.get('account_number_masked') as string,
      current_balance: parseFloat(formData.get('current_balance') as string) || 0,
      currency: formData.get('currency') as string,
      interest_rate: formData.get('interest_rate') ? parseFloat(formData.get('interest_rate') as string) / 100 : null,
      credit_limit: formData.get('credit_limit') ? parseFloat(formData.get('credit_limit') as string) : null,
      last_updated: new Date().toISOString()
    };

    let result;
    if (editingAccount) {
      result = await supabase
        .from('bank_accounts')
        .update(accountData)
        .eq('id', editingAccount.id);
    } else {
      result = await supabase
        .from('bank_accounts')
        .insert([accountData]);
    }

    if (result.error) {
      toast({
        title: "Error saving account",
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: editingAccount ? "Account updated" : "Account added",
        description: `${accountData.account_name} has been ${editingAccount ? 'updated' : 'added'} successfully.`,
      });
      setIsDialogOpen(false);
      setEditingAccount(null);
      fetchAccounts();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting account",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account deleted",
        description: "Account has been deleted successfully.",
      });
      fetchAccounts();
    }
  };

  const updateBalance = async (id: string, newBalance: number) => {
    const { error } = await supabase
      .from('bank_accounts')
      .update({ 
        current_balance: newBalance,
        last_updated: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error updating balance",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Balance updated",
        description: "Account balance has been updated successfully.",
      });
      fetchAccounts();
    }
  };

  const getAccountIcon = (type: string) => {
    const accountType = ACCOUNT_TYPES.find(t => t.value === type);
    return accountType?.icon || Wallet;
  };

  const formatCurrency = (amount: number, currency: string) => {
    const currencyData = CURRENCIES.find(c => c.code === currency);
    return `${currencyData?.symbol || '₱'}${amount.toLocaleString()}`;
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'checking': return 'bg-blue-100 text-blue-800';
      case 'savings': return 'bg-green-100 text-green-800';
      case 'credit': return 'bg-red-100 text-red-800';
      case 'investment': return 'bg-purple-100 text-purple-800';
      case 'loan': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAssets = accounts
    .filter(acc => ['checking', 'savings', 'investment'].includes(acc.account_type))
    .reduce((sum, acc) => sum + acc.current_balance, 0);

  const totalLiabilities = accounts
    .filter(acc => ['credit', 'loan'].includes(acc.account_type))
    .reduce((sum, acc) => sum + acc.current_balance, 0);

  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalAssets, 'PHP')}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Liabilities</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalLiabilities, 'PHP')}</p>
              </div>
              <CreditCard className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Worth</p>
                <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netWorth, 'PHP')}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bank Accounts</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingAccount(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="account_name">Account Name</Label>
                    <Input
                      id="account_name"
                      name="account_name"
                      defaultValue={editingAccount?.account_name}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="account_type">Account Type</Label>
                    <Select name="account_type" defaultValue={editingAccount?.account_type}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOUNT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="institution_name">Institution Name</Label>
                    <Input
                      id="institution_name"
                      name="institution_name"
                      defaultValue={editingAccount?.institution_name}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="account_number_masked">Account Number (Last 4 digits)</Label>
                    <Input
                      id="account_number_masked"
                      name="account_number_masked"
                      placeholder="****1234"
                      defaultValue={editingAccount?.account_number_masked}
                    />
                  </div>

                  <div>
                    <Label htmlFor="current_balance">Current Balance</Label>
                    <Input
                      id="current_balance"
                      name="current_balance"
                      type="number"
                      step="0.01"
                      defaultValue={editingAccount?.current_balance}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select name="currency" defaultValue={editingAccount?.currency || 'PHP'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code} ({currency.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                    <Input
                      id="interest_rate"
                      name="interest_rate"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      defaultValue={editingAccount?.interest_rate ? (editingAccount.interest_rate * 100).toFixed(2) : ''}
                    />
                  </div>

                  <div>
                    <Label htmlFor="credit_limit">Credit Limit (if applicable)</Label>
                    <Input
                      id="credit_limit"
                      name="credit_limit"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      defaultValue={editingAccount?.credit_limit}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingAccount ? 'Update' : 'Add'} Account
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
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bank accounts added yet</p>
              <p className="text-sm">Add your first account to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => {
                const Icon = getAccountIcon(account.account_type);
                return (
                  <Card key={account.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{account.account_name}</h3>
                            <Badge className={getAccountTypeColor(account.account_type)}>
                              {account.account_type}
                            </Badge>
                            {!account.is_active && (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {account.institution_name}
                            {account.account_number_masked && ` • ${account.account_number_masked}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last updated: {new Date(account.last_updated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-semibold">
                            {formatCurrency(account.current_balance, account.currency)}
                          </p>
                          {account.interest_rate && (
                            <p className="text-sm text-muted-foreground">
                              {(account.interest_rate * 100).toFixed(2)}% APY
                            </p>
                          )}
                          {account.credit_limit && (
                            <p className="text-sm text-muted-foreground">
                              Limit: {formatCurrency(account.credit_limit, account.currency)}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col space-y-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newBalance = prompt(
                                'Enter new balance:',
                                account.current_balance.toString()
                              );
                              if (newBalance !== null) {
                                updateBalance(account.id, parseFloat(newBalance));
                              }
                            }}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingAccount(account);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this account?')) {
                                handleDelete(account.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
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