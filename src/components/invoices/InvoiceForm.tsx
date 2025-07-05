import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InvoiceFormProps {
  invoice?: any;
  onClose: () => void;
  onSaved: () => void;
}

interface InvoiceItem {
  id?: string;
  item_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_rate: number;
  tax_rate: number;
  line_total: number;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onClose, onSaved }) => {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [items, setItems] = useState<InvoiceItem[]>([
    { item_name: '', description: '', quantity: 1, unit_price: 0, discount_rate: 0, tax_rate: 0, line_total: 0 }
  ]);

  useEffect(() => {
    fetchCustomers();
    if (invoice) {
      fetchInvoiceItems();
    }
  }, [user, currentBusiness, invoice]);

  const fetchCustomers = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('customers')
        .select('id, first_name, last_name, company_name')
        .eq('user_id', user.id);

      if (currentBusiness) {
        query = query.eq('business_id', currentBusiness.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchInvoiceItems = async () => {
    if (!invoice) return;

    try {
      const { data, error } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoice.id)
        .order('sort_order');

      if (error) throw error;
      if (data && data.length > 0) {
        setItems(data);
      }
    } catch (error: any) {
      console.error('Error fetching invoice items:', error);
    }
  };

  const calculateLineTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.unit_price;
    const discount = subtotal * (item.discount_rate / 100);
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * (item.tax_rate / 100);
    return afterDiscount + tax;
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    newItems[index].line_total = calculateLineTotal(newItems[index]);
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { 
      item_name: '', 
      description: '', 
      quantity: 1, 
      unit_price: 0, 
      discount_rate: 0, 
      tax_rate: 0, 
      line_total: 0 
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const totalDiscount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price * item.discount_rate / 100), 0);
    const totalTax = items.reduce((sum, item) => {
      const afterDiscount = (item.quantity * item.unit_price) - (item.quantity * item.unit_price * item.discount_rate / 100);
      return sum + (afterDiscount * item.tax_rate / 100);
    }, 0);
    const total = subtotal - totalDiscount + totalTax;

    return { subtotal, totalDiscount, totalTax, total };
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const totals = calculateTotals();

    const invoiceData = {
      business_id: currentBusiness?.id || null,
      user_id: user.id,
      customer_id: formData.get('customer_id') as string,
      invoice_number: formData.get('invoice_number') as string || generateInvoiceNumber(),
      invoice_date: formData.get('invoice_date') as string,
      due_date: formData.get('due_date') as string,
      status: formData.get('status') as string || 'draft',
      currency: formData.get('currency') as string || 'PHP',
      payment_terms: formData.get('payment_terms') as string || 'net_30',
      notes: formData.get('notes') as string || null,
      terms_conditions: formData.get('terms_conditions') as string || null,
      subtotal: totals.subtotal,
      tax_amount: totals.totalTax,
      discount_amount: totals.totalDiscount,
      total_amount: totals.total,
      balance_due: totals.total,
    };

    try {
      let invoiceId: string;

      if (invoice) {
        const { error } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', invoice.id);

        if (error) throw error;
        invoiceId = invoice.id;

        // Delete existing items
        await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoice.id);
      } else {
        const { data, error } = await supabase
          .from('invoices')
          .insert([invoiceData])
          .select()
          .single();

        if (error) throw error;
        invoiceId = data.id;
      }

      // Insert invoice items
      const itemsData = items
        .filter(item => item.item_name.trim() !== '')
        .map((item, index) => ({
          invoice_id: invoiceId,
          item_name: item.item_name,
          description: item.description || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_rate: item.discount_rate,
          tax_rate: item.tax_rate,
          line_total: item.line_total,
          sort_order: index,
        }));

      if (itemsData.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsData);

        if (itemsError) throw itemsError;
      }

      toast({
        title: invoice ? "Invoice updated" : "Invoice created",
        description: invoice ? "Invoice has been updated successfully." : "New invoice has been created successfully.",
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

  const totals = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Basic Invoice Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="invoice_number">Invoice Number</Label>
          <Input
            id="invoice_number"
            name="invoice_number"
            defaultValue={invoice?.invoice_number || generateInvoiceNumber()}
            placeholder="INV-2024-001"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="customer_id">Customer *</Label>
          <Select name="customer_id" defaultValue={invoice?.customer_id} required>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.company_name || `${customer.first_name} ${customer.last_name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="invoice_date">Invoice Date *</Label>
          <Input
            id="invoice_date"
            name="invoice_date"
            type="date"
            required
            defaultValue={invoice?.invoice_date || new Date().toISOString().split('T')[0]}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="due_date">Due Date *</Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            required
            defaultValue={invoice?.due_date}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select name="currency" defaultValue={invoice?.currency || 'PHP'}>
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

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Invoice Items</CardTitle>
            <Button type="button" variant="outline" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
              <div className="col-span-3">
                <Label>Item Name *</Label>
                <Input
                  value={item.item_name}
                  onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                  placeholder="Product/Service name"
                  required
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  placeholder="Optional description"
                />
              </div>
              <div className="col-span-1">
                <Label>Qty</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-2">
                <Label>Unit Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unit_price}
                  onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-1">
                <Label>Disc %</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={item.discount_rate}
                  onChange={(e) => updateItem(index, 'discount_rate', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-1">
                <Label>Tax %</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={item.tax_rate}
                  onChange={(e) => updateItem(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-1">
                <Label>Total</Label>
                <div className="p-2 bg-muted rounded text-right font-medium">
                  {item.line_total.toFixed(2)}
                </div>
              </div>
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₱{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-₱{totals.totalDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>₱{totals.totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₱{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="payment_terms">Payment Terms</Label>
          <Select name="payment_terms" defaultValue={invoice?.payment_terms || 'net_30'}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="due_on_receipt">Due on Receipt</SelectItem>
              <SelectItem value="net_15">Net 15 Days</SelectItem>
              <SelectItem value="net_30">Net 30 Days</SelectItem>
              <SelectItem value="net_60">Net 60 Days</SelectItem>
              <SelectItem value="net_90">Net 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={invoice?.status || 'draft'}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="viewed">Viewed</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={invoice?.notes}
          placeholder="Additional notes for this invoice..."
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="terms_conditions">Terms & Conditions</Label>
        <Textarea
          id="terms_conditions"
          name="terms_conditions"
          rows={3}
          defaultValue={invoice?.terms_conditions}
          placeholder="Payment terms and conditions..."
          className="mt-1"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
};