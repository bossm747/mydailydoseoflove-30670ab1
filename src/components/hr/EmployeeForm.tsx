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

interface EmployeeFormProps {
  employee?: any;
  onClose: () => void;
  onSaved: () => void;
}

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Intern' }
];

const EMPLOYMENT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'terminated', label: 'Terminated' }
];

const SALARY_TYPES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'daily', label: 'Daily' },
  { value: 'hourly', label: 'Hourly' }
];

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onClose, onSaved }) => {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    employee?.date_of_birth ? new Date(employee.date_of_birth) : undefined
  );
  const [hireDate, setHireDate] = useState<Date | undefined>(
    employee?.hire_date ? new Date(employee.hire_date) : new Date()
  );

  const generateEmployeeId = () => {
    const prefix = currentBusiness?.business_name?.substring(0, 3).toUpperCase() || 'EMP';
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${randomNum}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const employeeData = {
      business_id: currentBusiness?.id || null,
      user_id: user.id,
      employee_id: employee?.employee_id || generateEmployeeId(),
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      email: formData.get('email') as string || null,
      phone: formData.get('phone') as string || null,
      mobile: formData.get('mobile') as string || null,
      date_of_birth: dateOfBirth?.toISOString().split('T')[0] || null,
      hire_date: hireDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      job_title: formData.get('job_title') as string,
      department: formData.get('department') as string || null,
      employment_type: formData.get('employment_type') as string,
      employment_status: formData.get('employment_status') as string,
      salary_type: formData.get('salary_type') as string,
      base_salary: parseFloat(formData.get('base_salary') as string) || 0,
      hourly_rate: parseFloat(formData.get('hourly_rate') as string) || 0,
      notes: formData.get('notes') as string || null,
    };

    try {
      if (employee) {
        const { error } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', employee.id);
        
        if (error) throw error;
        
        toast({
          title: "Employee updated",
          description: "Employee information has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('employees')
          .insert([employeeData]);
        
        if (error) throw error;
        
        toast({
          title: "Employee created",
          description: "New employee has been added successfully.",
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
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            name="first_name"
            defaultValue={employee?.first_name}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            name="last_name"
            defaultValue={employee?.last_name}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={employee?.email}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={employee?.phone}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="mobile">Mobile</Label>
          <Input
            id="mobile"
            name="mobile"
            defaultValue={employee?.mobile}
            className="mt-1"
          />
        </div>

        <div>
          <Label>Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "mt-1 w-full justify-start text-left font-normal",
                  !dateOfBirth && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateOfBirth ? format(dateOfBirth, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateOfBirth}
                onSelect={setDateOfBirth}
                initialFocus
                className="pointer-events-auto"
                fromYear={1950}
                toYear={2010}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Hire Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "mt-1 w-full justify-start text-left font-normal",
                  !hireDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {hireDate ? format(hireDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={hireDate}
                onSelect={setHireDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="job_title">Job Title *</Label>
          <Input
            id="job_title"
            name="job_title"
            defaultValue={employee?.job_title}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            name="department"
            defaultValue={employee?.department}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="employment_type">Employment Type</Label>
          <Select name="employment_type" defaultValue={employee?.employment_type || 'full_time'}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="employment_status">Employment Status</Label>
          <Select name="employment_status" defaultValue={employee?.employment_status || 'active'}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="salary_type">Salary Type</Label>
          <Select name="salary_type" defaultValue={employee?.salary_type || 'monthly'}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SALARY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="base_salary">Base Salary</Label>
          <Input
            id="base_salary"
            name="base_salary"
            type="number"
            min="0"
            step="0.01"
            defaultValue={employee?.base_salary || 0}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="hourly_rate">Hourly Rate</Label>
          <Input
            id="hourly_rate"
            name="hourly_rate"
            type="number"
            min="0"
            step="0.01"
            defaultValue={employee?.hourly_rate || 0}
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
          defaultValue={employee?.notes}
          className="mt-1"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? 'Saving...' : employee ? 'Update Employee' : 'Create Employee'}
        </Button>
      </div>
    </form>
  );
};