import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';

interface BusinessFormProps {
  onClose: () => void;
  editingBusiness?: any;
}

const BUSINESS_TYPES = [
  'Sole Proprietorship',
  'Partnership',
  'Corporation',
  'LLC',
  'Non-Profit'
];

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Retail',
  'Manufacturing',
  'Real Estate',
  'Education',
  'Food & Beverage',
  'Consulting',
  'Other'
];

export const BusinessForm: React.FC<BusinessFormProps> = ({ onClose, editingBusiness }) => {
  const { createBusiness, updateBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const businessData = {
      business_name: formData.get('business_name') as string,
      business_type: formData.get('business_type') as string || undefined,
      industry: formData.get('industry') as string || undefined,
      description: formData.get('description') as string || undefined,
      website: formData.get('website') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      email: formData.get('email') as string || undefined,
      tax_id: formData.get('tax_id') as string || undefined,
      registration_number: formData.get('registration_number') as string || undefined,
      primary_currency: formData.get('primary_currency') as string || 'PHP',
      timezone: formData.get('timezone') as string || 'Asia/Manila',
    };

    try {
      if (editingBusiness) {
        await updateBusiness(editingBusiness.id, businessData);
        toast({
          title: "Business updated",
          description: "Business information has been updated successfully.",
        });
      } else {
        const result = await createBusiness(businessData);
        if (result) {
          toast({
            title: "Business created",
            description: "New business has been created successfully.",
          });
        }
      }
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="business_name">Business Name *</Label>
          <Input
            id="business_name"
            name="business_name"
            defaultValue={editingBusiness?.business_name}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="business_type">Business Type</Label>
          <Select name="business_type" defaultValue={editingBusiness?.business_type}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="industry">Industry</Label>
          <Select name="industry" defaultValue={editingBusiness?.industry}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            type="url"
            defaultValue={editingBusiness?.website}
            placeholder="https://..."
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={editingBusiness?.phone}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={editingBusiness?.email}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="tax_id">Tax ID</Label>
          <Input
            id="tax_id"
            name="tax_id"
            defaultValue={editingBusiness?.tax_id}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="registration_number">Registration Number</Label>
          <Input
            id="registration_number"
            name="registration_number"
            defaultValue={editingBusiness?.registration_number}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="primary_currency">Primary Currency</Label>
          <Select name="primary_currency" defaultValue={editingBusiness?.primary_currency || 'PHP'}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PHP">PHP - Philippine Peso</SelectItem>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="GBP">GBP - British Pound</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Select name="timezone" defaultValue={editingBusiness?.timezone || 'Asia/Manila'}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Manila">Asia/Manila</SelectItem>
              <SelectItem value="America/New_York">America/New_York</SelectItem>
              <SelectItem value="Europe/London">Europe/London</SelectItem>
              <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={editingBusiness?.description}
          rows={3}
          className="mt-1"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : editingBusiness ? 'Update Business' : 'Create Business'}
        </Button>
      </div>
    </form>
  );
};