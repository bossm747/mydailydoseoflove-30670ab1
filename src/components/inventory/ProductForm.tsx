import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProductFormProps {
  product?: any;
  categories: any[];
  onClose: () => void;
  onSaved: () => void;
}

const PRODUCT_TYPES = [
  { value: 'product', label: 'Physical Product' },
  { value: 'service', label: 'Service' },
  { value: 'digital', label: 'Digital Product' }
];

const UNITS_OF_MEASURE = [
  'piece', 'kg', 'lbs', 'meter', 'feet', 'liter', 'gallon', 
  'box', 'pack', 'set', 'hour', 'day', 'month', 'year'
];

export const ProductForm: React.FC<ProductFormProps> = ({ product, categories, onClose, onSaved }) => {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const generateProductCode = () => {
    const prefix = currentBusiness?.business_name?.substring(0, 3).toUpperCase() || 'PRD';
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${randomNum}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const productData = {
      business_id: currentBusiness?.id || null,
      user_id: user.id,
      product_code: product?.product_code || generateProductCode(),
      product_name: formData.get('product_name') as string,
      description: formData.get('description') as string || null,
      product_type: formData.get('product_type') as string,
      category_id: formData.get('category_id') as string || null,
      unit_of_measure: formData.get('unit_of_measure') as string,
      cost_price: parseFloat(formData.get('cost_price') as string) || 0,
      selling_price: parseFloat(formData.get('selling_price') as string) || 0,
      min_stock_level: parseFloat(formData.get('min_stock_level') as string) || 0,
      max_stock_level: parseFloat(formData.get('max_stock_level') as string) || 0,
      reorder_point: parseFloat(formData.get('reorder_point') as string) || 0,
      is_trackable: formData.get('is_trackable') === 'on',
      is_sellable: formData.get('is_sellable') === 'on',
      is_purchasable: formData.get('is_purchasable') === 'on',
      weight: parseFloat(formData.get('weight') as string) || null,
      barcode: formData.get('barcode') as string || null,
      sku: formData.get('sku') as string || null,
      tax_rate: parseFloat(formData.get('tax_rate') as string) || 0,
      tags: (formData.get('tags') as string)?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
    };

    try {
      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
        
        if (error) throw error;
        
        toast({
          title: "Product updated",
          description: "Product has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        
        if (error) throw error;
        
        toast({
          title: "Product created",
          description: "New product has been added successfully.",
        });
      }
      
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="product_name">Product Name *</Label>
            <Input
              id="product_name"
              name="product_name"
              defaultValue={product?.product_name}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="product_type">Product Type *</Label>
            <Select name="product_type" defaultValue={product?.product_type || 'product'}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category_id">Category</Label>
            <Select name="category_id" defaultValue={product?.category_id}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="unit_of_measure">Unit of Measure</Label>
            <Select name="unit_of_measure" defaultValue={product?.unit_of_measure || 'piece'}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNITS_OF_MEASURE.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              name="sku"
              defaultValue={product?.sku}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              id="barcode"
              name="barcode"
              defaultValue={product?.barcode}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={product?.description}
            className="mt-1"
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pricing</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="cost_price">Cost Price</Label>
            <Input
              id="cost_price"
              name="cost_price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.cost_price || 0}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="selling_price">Selling Price *</Label>
            <Input
              id="selling_price"
              name="selling_price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.selling_price || 0}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="tax_rate">Tax Rate (%)</Label>
            <Input
              id="tax_rate"
              name="tax_rate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              defaultValue={product?.tax_rate || 0}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Inventory Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Inventory Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="min_stock_level">Minimum Stock Level</Label>
            <Input
              id="min_stock_level"
              name="min_stock_level"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.min_stock_level || 0}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="max_stock_level">Maximum Stock Level</Label>
            <Input
              id="max_stock_level"
              name="max_stock_level"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.max_stock_level || 0}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="reorder_point">Reorder Point</Label>
            <Input
              id="reorder_point"
              name="reorder_point"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.reorder_point || 0}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            name="weight"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product?.weight}
            className="mt-1"
          />
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_trackable"
              name="is_trackable"
              defaultChecked={product?.is_trackable !== false}
            />
            <Label htmlFor="is_trackable">Track inventory for this product</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_sellable"
              name="is_sellable"
              defaultChecked={product?.is_sellable !== false}
            />
            <Label htmlFor="is_sellable">Available for sale</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_purchasable"
              name="is_purchasable"
              defaultChecked={product?.is_purchasable !== false}
            />
            <Label htmlFor="is_purchasable">Can be purchased</Label>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          name="tags"
          defaultValue={product?.tags?.join(', ')}
          placeholder="e.g., electronics, gadgets, premium"
          className="mt-1"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};