import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, DollarSign, Calendar, CreditCard, Receipt, MoreVertical } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PaymentForm } from './PaymentForm';

interface Payment {
  id: string;
  payment_number: string;
  payment_date: string;
  amount: number;
  currency: string;
  payment_method_type: string;
  status: string;
  reference_number: string;
  net_amount: number;
  transaction_fee: number;
  invoice_id: string;
  invoices?: {
    invoice_number: string;
  };
  customers?: {
    first_name: string;
    last_name: string;
    company_name: string;
  } | null;
  created_at: string;
}

const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'processing', label: 'Processing', color: 'bg-blue-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500' },
  { value: 'failed', label: 'Failed', color: 'bg-red-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-500' },
  { value: 'refunded', label: 'Refunded', color: 'bg-purple-500' }
];

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'check', label: 'Check', icon: '📝' },
  { value: 'gcash', label: 'GCash', icon: '📱' },
  { value: 'paymaya', label: 'PayMaya', icon: '📱' },
  { value: 'paypal', label: 'PayPal', icon: '🌐' }
];

export const PaymentManager: React.FC = () => {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user, currentBusiness]);

  const fetchPayments = async () => {
    try {
      let query = supabase
        .from('payments')
        .select(`
          *,
          invoices (
            invoice_number
          ),
          customers (
            first_name,
            last_name,
            company_name
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (currentBusiness) {
        query = query.eq('business_id', currentBusiness.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingPayment(null);
  };

  const handleFormSaved = () => {
    fetchPayments();
    handleFormClose();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = PAYMENT_STATUSES.find(s => s.value === status);
    return (
      <Badge variant="secondary" className={`${statusConfig?.color} text-white`}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const getMethodInfo = (method: string) => {
    return PAYMENT_METHODS.find(m => m.value === method);
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: {[key: string]: string} = {
      'PHP': '₱',
      'USD': '$',
      'AED': 'د.إ',
      'EUR': '€'
    };
    return `${symbols[currency] || currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const filteredPayments = payments.filter(payment => {
    if (statusFilter !== 'all' && payment.status !== statusFilter) return false;
    if (methodFilter !== 'all' && payment.payment_method_type !== methodFilter) return false;
    if (searchTerm && !payment.payment_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !(payment.reference_number && payment.reference_number.toLowerCase().includes(searchTerm.toLowerCase()))) return false;
    return true;
  });

  if (loading) {
    return <div className="flex justify-center p-8">Loading payments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Payment Management</h1>
          <p className="text-muted-foreground">Track and manage customer payments</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
              <DialogDescription>
                Record a payment received from a customer
              </DialogDescription>
            </DialogHeader>
            <PaymentForm
              payment={editingPayment}
              onClose={handleFormClose}
              onSaved={handleFormSaved}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{payments.reduce((sum, p) => sum + p.net_amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.length} payments this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {payments.filter(p => p.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {payments.filter(p => p.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {payments.filter(p => p.status === 'failed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Label>Status:</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {PAYMENT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label>Method:</Label>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.icon} {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label>Search:</Label>
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      {/* Payments Grid */}
      {filteredPayments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No payments found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {statusFilter === 'all' 
                ? "Start by recording your first payment" 
                : `No payments with status "${PAYMENT_STATUSES.find(s => s.value === statusFilter)?.label}"`}
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPayments.map((payment) => {
            const methodInfo = getMethodInfo(payment.payment_method_type);
            return (
              <Card key={payment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">#{payment.payment_number}</CardTitle>
                      <CardDescription className="text-sm">
                        {payment.invoices?.invoice_number && `Invoice: ${payment.invoices.invoice_number}`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(payment.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        Payment Date
                      </div>
                      <div className="font-medium">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-muted-foreground">
                        <CreditCard className="mr-1 h-3 w-3" />
                        Method
                      </div>
                      <div className="font-medium">
                        {methodInfo?.icon} {methodInfo?.label}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Amount</span>
                      <span className="font-bold text-lg">
                        {formatCurrency(payment.amount, payment.currency)}
                      </span>
                    </div>
                    {payment.transaction_fee > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Fee</span>
                        <span className="text-red-600">
                          -{formatCurrency(payment.transaction_fee, payment.currency)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Net Amount</span>
                      <span className="text-green-600 font-medium">
                        {formatCurrency(payment.net_amount, payment.currency)}
                      </span>
                    </div>
                  </div>

                  {payment.reference_number && (
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      Ref: {payment.reference_number}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};