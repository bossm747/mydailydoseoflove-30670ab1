import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PipelineStageFormProps {
  stage?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function PipelineStageForm({ stage, onSave, onCancel }: PipelineStageFormProps) {
  const [formData, setFormData] = useState({
    stage_name: stage?.stage_name || '',
    stage_order: stage?.stage_order || 1,
    stage_color: stage?.stage_color || '#3B82F6',
    probability_percentage: stage?.probability_percentage || 50,
    is_active: stage?.is_active !== false,
  });

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

  const colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Gray', value: '#6B7280' },
    { name: 'Indigo', value: '#6366F1' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="stage_name">Stage Name *</Label>
        <Input
          id="stage_name"
          value={formData.stage_name}
          onChange={(e) => handleChange('stage_name', e.target.value)}
          placeholder="e.g., Qualified Lead"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stage_order">Stage Order</Label>
          <Input
            id="stage_order"
            type="number"
            min="1"
            value={formData.stage_order}
            onChange={(e) => handleChange('stage_order', parseInt(e.target.value) || 1)}
            placeholder="1"
          />
        </div>
        <div>
          <Label htmlFor="probability_percentage">Probability (%)</Label>
          <Input
            id="probability_percentage"
            type="number"
            min="0"
            max="100"
            value={formData.probability_percentage}
            onChange={(e) => handleChange('probability_percentage', parseInt(e.target.value) || 0)}
            placeholder="50"
          />
        </div>
      </div>

      <div>
        <Label>Stage Color</Label>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              type="button"
              className={`p-3 rounded-lg border-2 flex items-center justify-center transition-all ${
                formData.stage_color === color.value 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-muted hover:border-muted-foreground'
              }`}
              onClick={() => handleChange('stage_color', color.value)}
            >
              <div 
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: color.value }}
              />
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Selected: {colorOptions.find(c => c.value === formData.stage_color)?.name || 'Custom'}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <input
          id="is_active"
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) => handleChange('is_active', e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="is_active">Active Stage</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {stage ? 'Update' : 'Create'} Stage
        </Button>
      </div>
    </form>
  );
}