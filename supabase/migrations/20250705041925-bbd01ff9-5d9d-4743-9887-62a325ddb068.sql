-- Phase 3: HR & Payroll System

-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  employee_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  mobile TEXT,
  date_of_birth DATE,
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  termination_date DATE,
  job_title TEXT NOT NULL,
  department TEXT,
  manager_id UUID REFERENCES public.employees(id),
  employment_type TEXT DEFAULT 'full_time',
  employment_status TEXT DEFAULT 'active',
  salary_type TEXT DEFAULT 'monthly',
  base_salary NUMERIC DEFAULT 0,
  hourly_rate NUMERIC DEFAULT 0,
  address JSONB,
  emergency_contact JSONB,
  bank_details JSONB,
  tax_information JSONB,
  benefits JSONB DEFAULT '{}',
  notes TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, employee_id)
);

-- Create payroll_periods table
CREATE TABLE public.payroll_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  period_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pay_date DATE NOT NULL,
  status TEXT DEFAULT 'draft',
  total_gross_pay NUMERIC DEFAULT 0,
  total_deductions NUMERIC DEFAULT 0,
  total_net_pay NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payroll_entries table
CREATE TABLE public.payroll_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  payroll_period_id UUID NOT NULL REFERENCES public.payroll_periods(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  basic_salary NUMERIC DEFAULT 0,
  overtime_hours NUMERIC DEFAULT 0,
  overtime_rate NUMERIC DEFAULT 0,
  overtime_pay NUMERIC DEFAULT 0,
  allowances JSONB DEFAULT '{}',
  bonuses NUMERIC DEFAULT 0,
  gross_pay NUMERIC DEFAULT 0,
  tax_deduction NUMERIC DEFAULT 0,
  sss_deduction NUMERIC DEFAULT 0,
  philhealth_deduction NUMERIC DEFAULT 0,
  pagibig_deduction NUMERIC DEFAULT 0,
  other_deductions JSONB DEFAULT '{}',
  total_deductions NUMERIC DEFAULT 0,
  net_pay NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create time_entries table
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  clock_in TIMESTAMP WITH TIME ZONE,
  clock_out TIMESTAMP WITH TIME ZONE,
  break_duration INTEGER DEFAULT 0,
  total_hours NUMERIC DEFAULT 0,
  overtime_hours NUMERIC DEFAULT 0,
  entry_type TEXT DEFAULT 'regular',
  status TEXT DEFAULT 'pending',
  notes TEXT,
  location JSONB,
  approved_by UUID REFERENCES public.employees(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, entry_date)
);

-- Create leave_types table
CREATE TABLE public.leave_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  leave_name TEXT NOT NULL,
  leave_code TEXT NOT NULL,
  days_allowed INTEGER DEFAULT 0,
  carry_forward BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT true,
  is_paid BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, leave_code)
);

-- Create leave_requests table
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested NUMERIC NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_by UUID REFERENCES public.employees(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create performance_reviews table
CREATE TABLE public.performance_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.employees(id),
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  review_type TEXT DEFAULT 'annual',
  overall_rating NUMERIC,
  goals_met JSONB DEFAULT '[]',
  strengths TEXT,
  areas_for_improvement TEXT,
  development_goals TEXT,
  manager_comments TEXT,
  employee_comments TEXT,
  status TEXT DEFAULT 'draft',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employees
CREATE POLICY "Users can manage business employees" 
ON public.employees 
FOR ALL 
USING (
  auth.uid() = user_id OR
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = employees.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- RLS Policies for payroll_periods
CREATE POLICY "Users can manage business payroll periods" 
ON public.payroll_periods 
FOR ALL 
USING (
  auth.uid() = user_id OR
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = payroll_periods.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- RLS Policies for payroll_entries
CREATE POLICY "Users can manage business payroll entries" 
ON public.payroll_entries 
FOR ALL 
USING (
  auth.uid() = user_id OR
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = payroll_entries.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- RLS Policies for time_entries
CREATE POLICY "Users can manage business time entries" 
ON public.time_entries 
FOR ALL 
USING (
  auth.uid() = user_id OR
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = time_entries.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- RLS Policies for leave_types
CREATE POLICY "Users can manage business leave types" 
ON public.leave_types 
FOR ALL 
USING (
  auth.uid() = user_id OR
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = leave_types.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- RLS Policies for leave_requests
CREATE POLICY "Users can manage business leave requests" 
ON public.leave_requests 
FOR ALL 
USING (
  auth.uid() = user_id OR
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = leave_requests.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- RLS Policies for performance_reviews
CREATE POLICY "Users can manage business performance reviews" 
ON public.performance_reviews 
FOR ALL 
USING (
  auth.uid() = user_id OR
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = performance_reviews.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- Add timestamp triggers
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_periods_updated_at
BEFORE UPDATE ON public.payroll_periods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_entries_updated_at
BEFORE UPDATE ON public.payroll_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at
BEFORE UPDATE ON public.time_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_types_updated_at
BEFORE UPDATE ON public.leave_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at
BEFORE UPDATE ON public.leave_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_reviews_updated_at
BEFORE UPDATE ON public.performance_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default leave types
INSERT INTO public.leave_types (user_id, business_id, leave_name, leave_code, days_allowed, is_paid) VALUES
('00000000-0000-0000-0000-000000000000', NULL, 'Vacation Leave', 'VL', 15, true),
('00000000-0000-0000-0000-000000000000', NULL, 'Sick Leave', 'SL', 15, true),
('00000000-0000-0000-0000-000000000000', NULL, 'Emergency Leave', 'EL', 5, true),
('00000000-0000-0000-0000-000000000000', NULL, 'Maternity Leave', 'ML', 120, true),
('00000000-0000-0000-0000-000000000000', NULL, 'Paternity Leave', 'PL', 7, true);