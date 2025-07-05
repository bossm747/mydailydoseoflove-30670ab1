-- Add bank accounts table for manual account management
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL, -- checking, savings, credit, investment, loan
  institution_name TEXT NOT NULL,
  account_number_masked TEXT,
  current_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'PHP',
  interest_rate DECIMAL(5,4),
  credit_limit DECIMAL(15,2),
  is_active BOOLEAN DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add assets table for comprehensive asset tracking
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL, -- real_estate, vehicle, equipment, electronics, jewelry, art, other
  estimated_value DECIMAL(15,2) NOT NULL,
  purchase_date DATE,
  purchase_price DECIMAL(15,2),
  depreciation_rate DECIMAL(5,4),
  location TEXT,
  condition TEXT DEFAULT 'good', -- excellent, good, fair, poor
  insurance_value DECIMAL(15,2),
  description TEXT,
  serial_number TEXT,
  warranty_expiry DATE,
  tags TEXT[],
  documents JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add debts table for detailed debt management
CREATE TABLE IF NOT EXISTS public.debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  debt_name TEXT NOT NULL,
  debt_type TEXT NOT NULL, -- mortgage, car_loan, credit_card, personal_loan, student_loan, other
  creditor_name TEXT NOT NULL,
  original_amount DECIMAL(15,2) NOT NULL,
  current_balance DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,4) NOT NULL,
  minimum_payment DECIMAL(10,2),
  payment_frequency TEXT DEFAULT 'monthly', -- weekly, bi-weekly, monthly, quarterly
  due_date DATE,
  maturity_date DATE,
  is_active BOOLEAN DEFAULT true,
  auto_pay BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add mood shares table for emotional status sharing
CREATE TABLE IF NOT EXISTS public.mood_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mood TEXT NOT NULL, -- happy, excited, calm, stressed, tired, romantic, grateful, etc.
  intensity INTEGER NOT NULL DEFAULT 5, -- 1-10 scale
  note TEXT,
  location TEXT,
  is_private BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add financial forecasts table for predictive analytics
CREATE TABLE IF NOT EXISTS public.financial_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  forecast_type TEXT NOT NULL, -- income, expense, savings, net_worth
  forecast_period TEXT NOT NULL, -- monthly, quarterly, yearly
  base_amount DECIMAL(15,2) NOT NULL,
  growth_rate DECIMAL(5,4),
  category TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add custom reports table
CREATE TABLE IF NOT EXISTS public.custom_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL, -- financial, business, relationship
  filters JSONB NOT NULL,
  chart_type TEXT DEFAULT 'table', -- table, bar, line, pie, donut
  date_range TEXT DEFAULT '1month',
  is_scheduled BOOLEAN DEFAULT false,
  schedule_frequency TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bank_accounts
CREATE POLICY "Users can view their own bank accounts" 
ON public.bank_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bank accounts" 
ON public.bank_accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank accounts" 
ON public.bank_accounts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank accounts" 
ON public.bank_accounts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for assets
CREATE POLICY "Users can view their own assets" 
ON public.assets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assets" 
ON public.assets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets" 
ON public.assets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets" 
ON public.assets 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for debts
CREATE POLICY "Users can view their own debts" 
ON public.debts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debts" 
ON public.debts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts" 
ON public.debts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts" 
ON public.debts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for mood_shares
CREATE POLICY "Users can view all mood shares" 
ON public.mood_shares 
FOR SELECT 
USING (is_private = false OR auth.uid() = user_id);

CREATE POLICY "Users can create their own mood shares" 
ON public.mood_shares 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood shares" 
ON public.mood_shares 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood shares" 
ON public.mood_shares 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for financial_forecasts
CREATE POLICY "Users can view their own forecasts" 
ON public.financial_forecasts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own forecasts" 
ON public.financial_forecasts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forecasts" 
ON public.financial_forecasts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forecasts" 
ON public.financial_forecasts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for custom_reports
CREATE POLICY "Users can view their own reports" 
ON public.custom_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports" 
ON public.custom_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" 
ON public.custom_reports 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" 
ON public.custom_reports 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_bank_accounts_updated_at
BEFORE UPDATE ON public.bank_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
BEFORE UPDATE ON public.assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_debts_updated_at
BEFORE UPDATE ON public.debts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_forecasts_updated_at
BEFORE UPDATE ON public.financial_forecasts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_reports_updated_at
BEFORE UPDATE ON public.custom_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();