import React, { useState, useEffect } from 'react';
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

interface LeaveRequestFormProps {
  request?: any;
  leaveTypes: any[];
  onClose: () => void;
  onSaved: () => void;
}

export const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({ request, leaveTypes, onClose, onSaved }) => {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(
    request?.start_date ? new Date(request.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    request?.end_date ? new Date(request.end_date) : undefined
  );

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, employee_id')
        .eq('business_id', currentBusiness?.id || null)
        .eq('employment_status', 'active')
        .order('first_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
    }
  };

  const calculateDays = () => {
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const requestData = {
      business_id: currentBusiness?.id || null,
      user_id: user.id,
      employee_id: formData.get('employee_id') as string,
      leave_type_id: formData.get('leave_type_id') as string,
      start_date: startDate?.toISOString().split('T')[0] || '',
      end_date: endDate?.toISOString().split('T')[0] || '',
      days_requested: calculateDays(),
      reason: formData.get('reason') as string || null,
      status: 'pending',
    };

    try {
      if (request) {
        const { error } = await supabase
          .from('leave_requests')
          .update(requestData)
          .eq('id', request.id);
        
        if (error) throw error;
        
        toast({
          title: "Leave request updated",
          description: "Leave request has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('leave_requests')
          .insert([requestData]);
        
        if (error) throw error;
        
        toast({
          title: "Leave request created",
          description: "New leave request has been submitted successfully.",
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
        <div>
          <Label htmlFor="employee_id">Employee *</Label>
          <Select name="employee_id" defaultValue={request?.employee_id} required>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.first_name} {employee.last_name} ({employee.employee_id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="leave_type_id">Leave Type *</Label>
          <Select name="leave_type_id" defaultValue={request?.leave_type_id} required>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select leave type" />
            </SelectTrigger>
            <SelectContent>
              {leaveTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.leave_name} ({type.leave_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        <div className="sm:col-span-2">
          <Label>Days Requested</Label>
          <Input
            type="number"
            value={calculateDays()}
            readOnly
            className="mt-1 bg-muted"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          name="reason"
          rows={3}
          defaultValue={request?.reason}
          className="mt-1"
          placeholder="Please provide a reason for your leave request..."
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? 'Saving...' : request ? 'Update Request' : 'Submit Request'}
        </Button>
      </div>
    </form>
  );
};