import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StockAdjustmentFormProps {
  item?: any;
  onClose: () => void;
  onSaved: () => void;
}

const ADJUSTMENT_TYPES = [
  { value: 'adjustment', label: 'Stock Adjustment' },
  { value: 'purchase', label: 'Purchase/Received' },
  { value: 'sale', label: 'Sale/Used' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'damaged', label: 'Damaged/Lost' },
  { value: 'expired', label: 'Expired' }
];

export const StockAdjustmentForm: React.FC<StockAdjustmentFormProps> = ({ item, onClose, onSaved }) => {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const quantityChange = parseFloat(formData.get('quantity_change') as string);
    const currentStock = item?.current_stock || 0;
    const newStock = currentStock + quantityChange;

    try {
      // Create inventory transaction
      const { error: transactionError } = await supabase
        .from('inventory_transactions')
        .insert([{
          business_id: currentBusiness?.id || null,
          user_id: user.id,
          product_id: item?.product_id,
          transaction_type: formData.get('transaction_type') as string,
          quantity_change: quantityChange,
          stock_before: currentStock,
          stock_after: newStock,
          location_name: item?.location_name || 'Main Warehouse',
          reason: formData.get('reason') as string,
          notes: formData.get('notes') as string || null,
          created_by: user.id
        }]);

      if (transactionError) throw transactionError;

      // Update inventory
      if (item) {
        const { error: inventoryError } = await supabase
          .from('inventory')
          .update({
            current_stock: newStock,
            available_stock: newStock
          })
          .eq('id', item.id);

        if (inventoryError) throw inventoryError;
      }

      toast({
        title: "Stock adjusted",
        description: "Inventory has been updated successfully.",
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
      {item && (
        <div className="bg-muted p-3 rounded">
          <div className="font-medium">{item.product?.product_name}</div>
          <div className="text-sm text-muted-foreground">
            Current Stock: {item.current_stock} {item.product?.unit_of_measure}
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="transaction_type">Transaction Type *</Label>
        <Select name="transaction_type" required>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {ADJUSTMENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="quantity_change">Quantity Change *</Label>
        <Input
          id="quantity_change"
          name="quantity_change"
          type="number"
          step="0.01"
          required
          placeholder="Use + for increase, - for decrease"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="reason">Reason</Label>
        <Input
          id="reason"
          name="reason"
          placeholder="Brief reason for adjustment"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={2}
          className="mt-1"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Update Stock'}
        </Button>
      </div>
    </form>
  );
};