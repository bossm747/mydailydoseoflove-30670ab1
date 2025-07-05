import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface LeadFormProps {
  lead?: any;
  onClose: () => void;
  onSaved: () => void;
}

const LEAD_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' }
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const LEAD_SOURCES = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'trade_show', label: 'Trade Show' },
  { value: 'other', label: 'Other' }
];

export const LeadForm: React.FC<LeadFormProps> = ({ lead, onClose, onSaved }) => {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(lead?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [expectedCloseDate, setExpectedCloseDate] = useState<Date | undefined>(
    lead?.expected_close_date ? new Date(lead.expected_close_date) : undefined
  );
  const [nextFollowUp, setNextFollowUp] = useState<Date | undefined>(
    lead?.next_follow_up ? new Date(lead.next_follow_up) : undefined
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const leadData = {
      business_id: currentBusiness?.id || null,
      user_id: user.id,
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string || null,
      company_name: formData.get('company_name') as string || null,
      email: formData.get('email') as string || null,
      phone: formData.get('phone') as string || null,
      status: formData.get('status') as string,
      priority: formData.get('priority') as string,
      lead_source: formData.get('lead_source') as string || null,
      estimated_value: parseFloat(formData.get('estimated_value') as string) || 0,
      probability: parseInt(formData.get('probability') as string) || 0,
      expected_close_date: expectedCloseDate?.toISOString().split('T')[0] || null,
      next_follow_up: nextFollowUp?.toISOString().split('T')[0] || null,
      notes: formData.get('notes') as string || null,
      tags: tags,
    };

    try {
      if (lead) {
        const { error } = await supabase
          .from('leads')
          .update(leadData)
          .eq('id', lead.id);
        
        if (error) throw error;
        
        toast({
          title: "Lead updated",
          description: "Lead information has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('leads')
          .insert([leadData]);
        
        if (error) throw error;
        
        toast({
          title: "Lead created",
          description: "New lead has been added successfully.",
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
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            name="first_name"
            defaultValue={lead?.first_name}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            name="last_name"
            defaultValue={lead?.last_name}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="company_name">Company Name</Label>
          <Input
            id="company_name"
            name="company_name"
            defaultValue={lead?.company_name}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={lead?.email}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={lead?.phone}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={lead?.status || 'new'}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select name="priority" defaultValue={lead?.priority || 'medium'}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((priority) => (
                <SelectItem key={priority.value} value={priority.value}>
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="lead_source">Lead Source</Label>
          <Select name="lead_source" defaultValue={lead?.lead_source}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {LEAD_SOURCES.map((source) => (
                <SelectItem key={source.value} value={source.value}>
                  {source.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="estimated_value">Estimated Value</Label>
          <Input
            id="estimated_value"
            name="estimated_value"
            type="number"
            min="0"
            step="0.01"
            defaultValue={lead?.estimated_value || 0}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="probability">Probability (%)</Label>
          <Input
            id="probability"
            name="probability"
            type="number"
            min="0"
            max="100"
            defaultValue={lead?.probability || 0}
            className="mt-1"
          />
        </div>

        <div>
          <Label>Expected Close Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "mt-1 w-full justify-start text-left font-normal",
                  !expectedCloseDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {expectedCloseDate ? format(expectedCloseDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={expectedCloseDate}
                onSelect={setExpectedCloseDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Next Follow-up</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "mt-1 w-full justify-start text-left font-normal",
                  !nextFollowUp && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {nextFollowUp ? format(nextFollowUp, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={nextFollowUp}
                onSelect={setNextFollowUp}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={lead?.notes}
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
          {loading ? 'Saving...' : lead ? 'Update Lead' : 'Create Lead'}
        </Button>
      </div>
    </form>
  );
};