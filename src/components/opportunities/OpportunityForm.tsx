import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface OpportunityFormProps {
  opportunity?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function OpportunityForm({ opportunity, onSave, onCancel }: OpportunityFormProps) {
  const [formData, setFormData] = useState({
    opportunity_name: opportunity?.opportunity_name || '',
    company_name: opportunity?.company_name || '',
    contact_person: opportunity?.contact_person || '',
    email: opportunity?.email || '',
    phone: opportunity?.phone || '',
    value: opportunity?.value || '',
    currency: opportunity?.currency || 'PHP',
    probability: opportunity?.probability || 50,
    stage: opportunity?.stage || 'qualified',
    expected_close_date: opportunity?.expected_close_date || '',
    source: opportunity?.source || '',
    status: opportunity?.status || 'open',
    description: opportunity?.description || '',
    tags: opportunity?.tags || [],
  });

  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleChange('tags', formData.tags.filter((tag: string) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="opportunity_name">Opportunity Name *</Label>
          <Input
            id="opportunity_name"
            value={formData.opportunity_name}
            onChange={(e) => handleChange('opportunity_name', e.target.value)}
            placeholder="New Product Launch"
            required
          />
        </div>
        <div>
          <Label htmlFor="company_name">Company Name *</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => handleChange('company_name', e.target.value)}
            placeholder="Acme Corp"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input
            id="contact_person"
            value={formData.contact_person}
            onChange={(e) => handleChange('contact_person', e.target.value)}
            placeholder="John Doe"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="john@acmecorp.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+63 912 345 6789"
          />
        </div>
        <div>
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            value={formData.source}
            onChange={(e) => handleChange('source', e.target.value)}
            placeholder="Website, Referral, etc."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="value">Value *</Label>
          <Input
            id="value"
            type="number"
            step="0.01"
            value={formData.value}
            onChange={(e) => handleChange('value', parseFloat(e.target.value) || 0)}
            placeholder="50000"
            required
          />
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
        <div>
          <Label htmlFor="probability">Probability (%)</Label>
          <Input
            id="probability"
            type="number"
            min="0"
            max="100"
            value={formData.probability}
            onChange={(e) => handleChange('probability', parseInt(e.target.value) || 0)}
            placeholder="50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stage">Stage</Label>
          <Select value={formData.stage} onValueChange={(value) => handleChange('stage', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="expected_close_date">Expected Close Date</Label>
        <Input
          id="expected_close_date"
          type="date"
          value={formData.expected_close_date}
          onChange={(e) => handleChange('expected_close_date', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Opportunity details and notes..."
          rows={3}
        />
      </div>

      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag: string, index: number) => (
            <Badge key={index} variant="secondary" className="pr-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add tag..."
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={addTag}>
            Add
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {opportunity ? 'Update' : 'Create'} Opportunity
        </Button>
      </div>
    </form>
  );
}