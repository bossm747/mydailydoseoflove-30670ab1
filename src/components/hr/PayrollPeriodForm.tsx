import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PayrollPeriodFormProps {
  period?: any;
  onClose: () => void;
  onSaved: () => void;
}

const PAYROLL_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'processing', label: 'Processing' },
  { value: 'processed', label: 'Processed' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' }
];

export const PayrollPeriodForm: React.FC<PayrollPeriodFormProps> = ({ period, onClose, onSaved }) => {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(
    period?.start_date ? new Date(period.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    period?.end_date ? new Date(period.end_date) : undefined
  );
  const [payDate, setPayDate] = useState<Date | undefined>(
    period?.pay_date ? new Date(period.pay_date) : undefined
  );

  const generatePeriodName = () => {
    if (startDate && endDate) {
      const startMonth = format(startDate, 'MMM yyyy');
      const endMonth = format(endDate, 'MMM yyyy');
      return startMonth === endMonth ? startMonth : `${startMonth} - ${endMonth}`;
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const periodData = {
      business_id: currentBusiness?.id || null,
      user_id: user.id,
      period_name: formData.get('period_name') as string || generatePeriodName(),
      start_date: startDate?.toISOString().split('T')[0] || '',
      end_date: endDate?.toISOString().split('T')[0] || '',
      pay_date: payDate?.toISOString().split('T')[0] || '',
      status: formData.get('status') as string || 'draft',
      total_gross_pay: parseFloat(formData.get('total_gross_pay') as string) || 0,
      total_deductions: parseFloat(formData.get('total_deductions') as string) || 0,
      total_net_pay: parseFloat(formData.get('total_net_pay') as string) || 0,
      notes: formData.get('notes') as string || null,
    };

    try {
      if (period) {
        const { error } = await supabase
          .from('payroll_periods')
          .update(periodData)
          .eq('id', period.id);
        
        if (error) throw error;
        
        toast({
          title: "Payroll period updated",
          description: "Payroll period has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('payroll_periods')
          .insert([periodData]);
        
        if (error) throw error;
        
        toast({
          title: "Payroll period created",
          description: "New payroll period has been created successfully.",
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="period_name">Period Name</Label>
          <Input
            id="period_name"
            name="period_name"
            placeholder={generatePeriodName() || "e.g., January 2024"}
            defaultValue={period?.period_name}
            className="mt-1"
          />
        </div>

        <div>
          <Label>Start Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "mt-1 w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Pick start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>End Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "mt-1 w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Pick end date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Pay Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "mt-1 w-full justify-start text-left font-normal",
                  !payDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {payDate ? format(payDate, "PPP") : "Pick pay date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={payDate}
                onSelect={setPayDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={period?.status || 'draft'}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYROLL_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="total_gross_pay">Total Gross Pay</Label>
          <Input
            id="total_gross_pay"
            name="total_gross_pay"
            type="number"
            min="0"
            step="0.01"
            defaultValue={period?.total_gross_pay || 0}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="total_deductions">Total Deductions</Label>
          <Input
            id="total_deductions"
            name="total_deductions"
            type="number"
            min="0"
            step="0.01"
            defaultValue={period?.total_deductions || 0}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="total_net_pay">Total Net Pay</Label>
          <Input
            id="total_net_pay"
            name="total_net_pay"
            type="number"
            min="0"
            step="0.01"
            defaultValue={period?.total_net_pay || 0}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={period?.notes}
          className="mt-1"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? 'Saving...' : period ? 'Update Period' : 'Create Period'}
        </Button>
      </div>
    </form>
  );
};