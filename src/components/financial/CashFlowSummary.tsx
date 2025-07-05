import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';

interface CashFlowData {
  income: number;
  expenses: number;
  netCashFlow: number;
  period: string;
}

export const CashFlowSummary: React.FC = () => {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const [cashFlow, setCashFlow] = useState<CashFlowData>({
    income: 0,
    expenses: 0,
    netCashFlow: 0,
    period: 'This Month'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCashFlowData();
    }
  }, [user, currentBusiness]);

  const fetchCashFlowData = async () => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      // Fetch payments (income)
      let paymentsQuery = supabase
        .from('payments')
        .select('net_amount')
        .eq('user_id', user!.id)
        .eq('status', 'completed')
        .gte('payment_date', startOfMonth.toISOString().split('T')[0])
        .lte('payment_date', endOfMonth.toISOString().split('T')[0]);

      if (currentBusiness) {
        paymentsQuery = paymentsQuery.eq('business_id', currentBusiness.id);
      }

      const { data: payments } = await paymentsQuery;
      const income = payments?.reduce((sum, p) => sum + p.net_amount, 0) || 0;

      // For now, we'll simulate expenses calculation
      // In a real app, you'd have an expenses table
      const expenses = income * 0.3; // Simulate 30% expense ratio

      setCashFlow({
        income,
        expenses,
        netCashFlow: income - expenses,
        period: 'This Month'
      });
    } catch (error) {
      console.error('Error fetching cash flow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          Loading cash flow data...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Cash Flow Summary
        </CardTitle>
        <CardDescription>
          Financial overview for {cashFlow.period}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Income
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(cashFlow.income)}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4" />
              Expenses
            </div>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(cashFlow.expenses)}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Net Cash Flow
            </div>
            <div className={`text-3xl font-bold ${
              cashFlow.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(cashFlow.netCashFlow)}
            </div>
            <p className="text-xs text-muted-foreground">
              {cashFlow.netCashFlow >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};