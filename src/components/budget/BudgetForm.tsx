import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BudgetFormProps {
  budget?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function BudgetForm({ budget, onSave, onCancel }: BudgetFormProps) {
  const [formData, setFormData] = useState({
    budget_name: budget?.budget_name || '',
    budget_type: budget?.budget_type || 'monthly',
    category: budget?.category || '',
    allocated_amount: budget?.allocated_amount || '',
    spent_amount: budget?.spent_amount || 0,
    budget_period_start: budget?.budget_period_start || '',
    budget_period_end: budget?.budget_period_end || '',
    alert_threshold: budget?.alert_threshold || 80,
    notes: budget?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      allocated_amount: parseFloat(formData.allocated_amount) || 0,
      spent_amount: parseFloat(formData.spent_amount) || 0,
      alert_threshold: parseInt(formData.alert_threshold) || 80,
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const budgetCategories = [
    'Marketing',
    'Operations',
    'Technology',
    'Human Resources',
    'Facilities',
    'Travel',
    'Professional Services',
    'Equipment',
    'Supplies',
    'Training',
    'Other'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="budget_name">Budget Name *</Label>
          <Input
            id="budget_name"
            value={formData.budget_name}
            onChange={(e) => handleChange('budget_name', e.target.value)}
            placeholder="Q1 Marketing Budget"
            required
          />
        </div>
        <div>
          <Label htmlFor="budget_type">Budget Type</Label>
          <Select value={formData.budget_type} onValueChange={(value) => handleChange('budget_type', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="project">Project</SelectItem>
              <SelectItem value="one-time">One-time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {budgetCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="allocated_amount">Allocated Amount *</Label>
          <Input
            id="allocated_amount"
            type="number"
            step="0.01"
            value={formData.allocated_amount}
            onChange={(e) => handleChange('allocated_amount', e.target.value)}
            placeholder="50000"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="spent_amount">Already Spent</Label>
          <Input
            id="spent_amount"
            type="number"
            step="0.01"
            value={formData.spent_amount}
            onChange={(e) => handleChange('spent_amount', e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="alert_threshold">Alert Threshold (%)</Label>
          <Input
            id="alert_threshold"
            type="number"
            min="0"
            max="100"
            value={formData.alert_threshold}
            onChange={(e) => handleChange('alert_threshold', e.target.value)}
            placeholder="80"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="budget_period_start">Period Start *</Label>
          <Input
            id="budget_period_start"
            type="date"
            value={formData.budget_period_start}
            onChange={(e) => handleChange('budget_period_start', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="budget_period_end">Period End *</Label>
          <Input
            id="budget_period_end"
            type="date"
            value={formData.budget_period_end}
            onChange={(e) => handleChange('budget_period_end', e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Budget notes and details..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {budget ? 'Update' : 'Create'} Budget
        </Button>
      </div>
    </form>
  );
}