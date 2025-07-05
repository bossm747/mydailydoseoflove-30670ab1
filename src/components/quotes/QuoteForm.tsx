import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface QuoteFormProps {
  quote?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function QuoteForm({ quote, onSave, onCancel }: QuoteFormProps) {
  const [formData, setFormData] = useState({
    quote_number: quote?.quote_number || '',
    customer_id: quote?.customer_id || '',
    quote_date: quote?.quote_date || new Date().toISOString().split('T')[0],
    expiry_date: quote?.expiry_date || '',
    status: quote?.status || 'draft',
    subtotal: quote?.subtotal || '',
    tax_amount: quote?.tax_amount || '',
    discount_amount: quote?.discount_amount || '',
    total_amount: quote?.total_amount || '',
    currency: quote?.currency || 'PHP',
    notes: quote?.notes || '',
    terms_conditions: quote?.terms_conditions || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      subtotal: parseFloat(formData.subtotal) || 0,
      tax_amount: parseFloat(formData.tax_amount) || 0,
      discount_amount: parseFloat(formData.discount_amount) || 0,
      total_amount: parseFloat(formData.total_amount) || 0,
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Auto-calculate total when amounts change
  React.useEffect(() => {
    const subtotal = parseFloat(formData.subtotal) || 0;
    const tax = parseFloat(formData.tax_amount) || 0;
    const discount = parseFloat(formData.discount_amount) || 0;
    const total = subtotal + tax - discount;
    
    if (total !== parseFloat(formData.total_amount)) {
      setFormData(prev => ({ ...prev, total_amount: total.toString() }));
    }
  }, [formData.subtotal, formData.tax_amount, formData.discount_amount]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quote_number">Quote Number *</Label>
          <Input
            id="quote_number"
            value={formData.quote_number}
            onChange={(e) => handleChange('quote_number', e.target.value)}
            placeholder="QT-001"
            required
          />
        </div>
        <div>
          <Label htmlFor="customer_id">Customer ID *</Label>
          <Input
            id="customer_id"
            value={formData.customer_id}
            onChange={(e) => handleChange('customer_id', e.target.value)}
            placeholder="Customer identifier"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quote_date">Quote Date *</Label>
          <Input
            id="quote_date"
            type="date"
            value={formData.quote_date}
            onChange={(e) => handleChange('quote_date', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="expiry_date">Expiry Date *</Label>
          <Input
            id="expiry_date"
            type="date"
            value={formData.expiry_date}
            onChange={(e) => handleChange('expiry_date', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select value={formData.currency} onValueChange={(value) => handleChange('currency', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PHP">PHP (₱)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="subtotal">Subtotal *</Label>
          <Input
            id="subtotal"
            type="number"
            step="0.01"
            value={formData.subtotal}
            onChange={(e) => handleChange('subtotal', e.target.value)}
            placeholder="50000"
            required
          />
        </div>
        <div>
          <Label htmlFor="tax_amount">Tax Amount</Label>
          <Input
            id="tax_amount"
            type="number"
            step="0.01"
            value={formData.tax_amount}
            onChange={(e) => handleChange('tax_amount', e.target.value)}
            placeholder="6000"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="discount_amount">Discount Amount</Label>
          <Input
            id="discount_amount"
            type="number"
            step="0.01"
            value={formData.discount_amount}
            onChange={(e) => handleChange('discount_amount', e.target.value)}
            placeholder="5000"
          />
        </div>
        <div>
          <Label htmlFor="total_amount">Total Amount</Label>
          <Input
            id="total_amount"
            type="number"
            step="0.01"
            value={formData.total_amount}
            onChange={(e) => handleChange('total_amount', e.target.value)}
            placeholder="51000"
            readOnly
            className="bg-muted"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Quote notes and details..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="terms_conditions">Terms & Conditions</Label>
        <Textarea
          id="terms_conditions"
          value={formData.terms_conditions}
          onChange={(e) => handleChange('terms_conditions', e.target.value)}
          placeholder="Payment terms, delivery conditions, etc..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {quote ? 'Update' : 'Create'} Quote
        </Button>
      </div>
    </form>
  );
}