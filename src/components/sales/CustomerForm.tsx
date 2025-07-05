import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';

interface CustomerFormProps {
  customer?: any;
  onClose: () => void;
  onSaved: () => void;
}

const CUSTOMER_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'company', label: 'Company' }
];

const CUSTOMER_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'inactive', label: 'Inactive' }
];

const PAYMENT_TERMS = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30' },
  { value: 'net_45', label: 'Net 45' },
  { value: 'net_60', label: 'Net 60' }
];

export const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onClose, onSaved }) => {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(customer?.tags || []);
  const [newTag, setNewTag] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const customerData = {
      business_id: currentBusiness?.id || null,
      user_id: user.id,
      customer_type: formData.get('customer_type') as string,
      first_name: formData.get('first_name') as string || null,
      last_name: formData.get('last_name') as string || null,
      company_name: formData.get('company_name') as string || null,
      email: formData.get('email') as string || null,
      phone: formData.get('phone') as string || null,
      mobile: formData.get('mobile') as string || null,
      website: formData.get('website') as string || null,
      status: formData.get('status') as string,
      credit_limit: parseFloat(formData.get('credit_limit') as string) || 0,
      payment_terms: formData.get('payment_terms') as string,
      notes: formData.get('notes') as string || null,
      tags: tags,
    };

    try {
      if (customer) {
        const { error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', customer.id);
        
        if (error) throw error;
        
        toast({
          title: "Customer updated",
          description: "Customer information has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('customers')
          .insert([customerData]);
        
        if (error) throw error;
        
        toast({
          title: "Customer created",
          description: "New customer has been added successfully.",
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

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer_type">Customer Type</Label>
          <Select name="customer_type" defaultValue={customer?.customer_type || 'individual'}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CUSTOMER_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={customer?.status || 'active'}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CUSTOMER_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            name="first_name"
            defaultValue={customer?.first_name}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            name="last_name"
            defaultValue={customer?.last_name}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="company_name">Company Name</Label>
          <Input
            id="company_name"
            name="company_name"
            defaultValue={customer?.company_name}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={customer?.email}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={customer?.phone}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="mobile">Mobile</Label>
          <Input
            id="mobile"
            name="mobile"
            defaultValue={customer?.mobile}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            type="url"
            defaultValue={customer?.website}
            placeholder="https://..."
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="credit_limit">Credit Limit</Label>
          <Input
            id="credit_limit"
            name="credit_limit"
            type="number"
            min="0"
            step="0.01"
            defaultValue={customer?.credit_limit || 0}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="payment_terms">Payment Terms</Label>
          <Select name="payment_terms" defaultValue={customer?.payment_terms || 'net_30'}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_TERMS.map((term) => (
                <SelectItem key={term.value} value={term.value}>
                  {term.label}
                </SelectItem>
              ))}
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
          defaultValue={customer?.notes}
          className="mt-1"
        />
      </div>

      <div>
        <Label>Tags</Label>
        <div className="mt-1 space-y-2">
          <div className="flex space-x-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} variant="outline">
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                  <span>{tag}</span>
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : customer ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
};