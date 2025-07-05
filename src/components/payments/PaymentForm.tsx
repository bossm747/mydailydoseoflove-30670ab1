import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentFormProps {
  payment?: any;
  onClose: () => void;
  onSaved: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ payment, onClose, onSaved }) => {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    fetchInvoices();
  }, [user, currentBusiness]);

  const fetchInvoices = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('invoices')
        .select('id, invoice_number, balance_due, currency')
        .eq('user_id', user.id)
        .gt('balance_due', 0);

      if (currentBusiness) {
        query = query.eq('business_id', currentBusiness.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setInvoices(data || []);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
    }
  };

  const generatePaymentNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PAY-${year}${month}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string) || 0;
    const transactionFee = parseFloat(formData.get('transaction_fee') as string) || 0;

    const paymentData = {
      business_id: currentBusiness?.id || null,
      user_id: user.id,
      invoice_id: formData.get('invoice_id') as string || null,
      payment_number: formData.get('payment_number') as string || generatePaymentNumber(),
      payment_date: formData.get('payment_date') as string,
      amount: amount,
      currency: formData.get('currency') as string || 'PHP',
      payment_method_type: formData.get('payment_method_type') as string,
      status: formData.get('status') as string || 'completed',
      reference_number: formData.get('reference_number') as string || null,
      notes: formData.get('notes') as string || null,
      transaction_fee: transactionFee,
      net_amount: amount - transactionFee,
    };

    try {
      if (payment) {
        const { error } = await supabase
          .from('payments')
          .update(paymentData)
          .eq('id', payment.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payments')
          .insert([paymentData]);

        if (error) throw error;
      }

      toast({
        title: payment ? "Payment updated" : "Payment recorded",
        description: payment ? "Payment has been updated successfully." : "Payment has been recorded successfully.",
      });

      onSaved();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="payment_number">Payment Number</Label>
          <Input
            id="payment_number"
            name="payment_number"
            defaultValue={payment?.payment_number || generatePaymentNumber()}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="payment_date">Payment Date *</Label>
          <Input
            id="payment_date"
            name="payment_date"
            type="date"
            required
            defaultValue={payment?.payment_date || new Date().toISOString().split('T')[0]}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="invoice_id">Invoice (Optional)</Label>
        <Select name="invoice_id" defaultValue={payment?.invoice_id}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select invoice or leave blank" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No specific invoice</SelectItem>
            {invoices.map((invoice) => (
              <SelectItem key={invoice.id} value={invoice.id}>
                {invoice.invoice_number} - Balance: ₱{invoice.balance_due}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={payment?.amount}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select name="currency" defaultValue={payment?.currency || 'PHP'}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PHP">PHP (₱)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="AED">AED (د.إ)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="payment_method_type">Payment Method *</Label>
          <Select name="payment_method_type" defaultValue={payment?.payment_method_type} required>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank_transfer">🏦 Bank Transfer</SelectItem>
              <SelectItem value="credit_card">💳 Credit Card</SelectItem>
              <SelectItem value="cash">💵 Cash</SelectItem>
              <SelectItem value="check">📝 Check</SelectItem>
              <SelectItem value="gcash">📱 GCash</SelectItem>
              <SelectItem value="paymaya">📱 PayMaya</SelectItem>
              <SelectItem value="paypal">🌐 PayPal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={payment?.status || 'completed'}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reference_number">Reference Number</Label>
          <Input
            id="reference_number"
            name="reference_number"
            defaultValue={payment?.reference_number}
            placeholder="Transaction reference"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="transaction_fee">Transaction Fee</Label>
          <Input
            id="transaction_fee"
            name="transaction_fee"
            type="number"
            step="0.01"
            min="0"
            defaultValue={payment?.transaction_fee || 0}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={payment?.notes}
          placeholder="Additional payment notes..."
          className="mt-1"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : payment ? 'Update Payment' : 'Record Payment'}
        </Button>
      </div>
    </form>
  );
};