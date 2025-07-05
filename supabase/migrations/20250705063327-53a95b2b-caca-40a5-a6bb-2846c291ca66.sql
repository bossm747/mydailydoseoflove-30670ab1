-- Phase 1: Core CRM Extensions Database Setup
-- Create missing tables and enhance existing ones for complete CRM functionality

-- 1. Ensure opportunities table has proper structure
-- (Table already exists, but let's verify/enhance it)

-- 2. Create sales_pipeline_stages table for pipeline management
CREATE TABLE IF NOT EXISTS public.sales_pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID,
  stage_name TEXT NOT NULL,
  stage_order INTEGER NOT NULL DEFAULT 0,
  stage_color TEXT DEFAULT '#3B82F6',
  probability_percentage INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create budgets table for budget management
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID,
  budget_name TEXT NOT NULL,
  budget_type TEXT NOT NULL DEFAULT 'monthly',
  category TEXT,
  allocated_amount NUMERIC NOT NULL DEFAULT 0,
  spent_amount NUMERIC NOT NULL DEFAULT 0,
  remaining_amount NUMERIC GENERATED ALWAYS AS (allocated_amount - spent_amount) STORED,
  budget_period_start DATE NOT NULL,
  budget_period_end DATE NOT NULL,
  alert_threshold NUMERIC DEFAULT 80,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Create expenses table for expense tracking
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID,
  expense_name TEXT NOT NULL,
  category TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'PHP',
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT,
  vendor_name TEXT,
  description TEXT,
  receipt_url TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT,
  project_id UUID,
  is_billable BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Enable RLS on new tables
ALTER TABLE public.sales_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for sales_pipeline_stages
CREATE POLICY "Users can manage business pipeline stages" 
ON public.sales_pipeline_stages 
FOR ALL 
USING (
  (auth.uid() = user_id) OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_members.business_id = sales_pipeline_stages.business_id 
    AND business_members.user_id = auth.uid() 
    AND business_members.is_active = true
  ))
);

-- 7. Create RLS policies for budgets
CREATE POLICY "Users can manage business budgets" 
ON public.budgets 
FOR ALL 
USING (
  (auth.uid() = user_id) OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_members.business_id = budgets.business_id 
    AND business_members.user_id = auth.uid() 
    AND business_members.is_active = true
  ))
);

-- 8. Create RLS policies for expenses
CREATE POLICY "Users can manage business expenses" 
ON public.expenses 
FOR ALL 
USING (
  (auth.uid() = user_id) OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_members.business_id = expenses.business_id 
    AND business_members.user_id = auth.uid() 
    AND business_members.is_active = true
  ))
);

-- 9. Create triggers for updated_at columns
CREATE TRIGGER update_sales_pipeline_stages_updated_at
  BEFORE UPDATE ON public.sales_pipeline_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_pipeline_stages_user_business ON public.sales_pipeline_stages(user_id, business_id);
CREATE INDEX IF NOT EXISTS idx_sales_pipeline_stages_order ON public.sales_pipeline_stages(stage_order);
CREATE INDEX IF NOT EXISTS idx_budgets_user_business ON public.budgets(user_id, business_id);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON public.budgets(budget_period_start, budget_period_end);
CREATE INDEX IF NOT EXISTS idx_expenses_user_business ON public.expenses(user_id, business_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);

-- 11. Add foreign key relationships where appropriate
ALTER TABLE public.expenses 
ADD CONSTRAINT fk_expenses_project 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;