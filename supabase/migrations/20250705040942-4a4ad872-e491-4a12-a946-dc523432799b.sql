-- Phase 2: Sales & CRM System

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  customer_type TEXT NOT NULL DEFAULT 'individual',
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  website TEXT,
  tax_id TEXT,
  address JSONB,
  billing_address JSONB,
  shipping_address JSONB,
  contact_person TEXT,
  customer_since DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active',
  credit_limit NUMERIC DEFAULT 0,
  payment_terms TEXT DEFAULT 'net_30',
  preferred_currency TEXT DEFAULT 'PHP',
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  assigned_to UUID,
  lead_source TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'new',
  priority TEXT DEFAULT 'medium',
  estimated_value NUMERIC DEFAULT 0,
  expected_close_date DATE,
  probability INTEGER DEFAULT 0,
  next_follow_up DATE,
  notes TEXT,
  tags TEXT[],
  converted_to_customer UUID REFERENCES public.customers(id),
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales_pipeline table
CREATE TABLE public.sales_pipeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  pipeline_name TEXT NOT NULL,
  stages JSONB NOT NULL DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create opportunities table
CREATE TABLE public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  assigned_to UUID,
  customer_id UUID REFERENCES public.customers(id),
  lead_id UUID REFERENCES public.leads(id),
  pipeline_id UUID REFERENCES public.sales_pipeline(id),
  opportunity_name TEXT NOT NULL,
  description TEXT,
  stage TEXT NOT NULL DEFAULT 'prospecting',
  status TEXT DEFAULT 'open',
  value NUMERIC NOT NULL DEFAULT 0,
  probability INTEGER DEFAULT 0,
  expected_close_date DATE,
  actual_close_date DATE,
  source TEXT,
  priority TEXT DEFAULT 'medium',
  next_step TEXT,
  next_step_date DATE,
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotes table
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  opportunity_id UUID REFERENCES public.opportunities(id),
  quote_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  valid_until DATE,
  currency TEXT DEFAULT 'PHP',
  subtotal NUMERIC DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  discount_rate NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  terms_and_conditions TEXT,
  notes TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quote_items table
CREATE TABLE public.quote_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  discount_rate NUMERIC DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0,
  line_total NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales_activities table
CREATE TABLE public.sales_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  related_to_type TEXT NOT NULL,
  related_to_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Users can manage business customers" 
ON public.customers 
FOR ALL 
USING (
  auth.uid() = user_id OR
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = customers.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- RLS Policies for leads
CREATE POLICY "Users can manage business leads" 
ON public.leads 
FOR ALL 
USING (
  auth.uid() = user_id OR
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = leads.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- RLS Policies for sales_pipeline
CREATE POLICY "Users can manage business pipelines" 
ON public.sales_pipeline 
FOR ALL 
USING (
  auth.uid() = user_id OR
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = sales_pipeline.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- RLS Policies for opportunities
CREATE POLICY "Users can manage business opportunities" 
ON public.opportunities 
FOR ALL 
USING (
  auth.uid() = user_id OR
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = opportunities.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- RLS Policies for quotes
CREATE POLICY "Users can manage business quotes" 
ON public.quotes 
FOR ALL 
USING (
  auth.uid() = user_id OR
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = quotes.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- RLS Policies for quote_items
CREATE POLICY "Users can manage quote items" 
ON public.quote_items 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.quotes 
    WHERE quotes.id = quote_items.quote_id 
    AND (
      auth.uid() = quotes.user_id OR
      (quotes.business_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.business_members 
        WHERE business_id = quotes.business_id 
        AND user_id = auth.uid() 
        AND is_active = true
      ))
    )
  )
);

-- RLS Policies for sales_activities
CREATE POLICY "Users can manage business activities" 
ON public.sales_activities 
FOR ALL 
USING (
  auth.uid() = user_id OR
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = sales_activities.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- Add timestamp triggers
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_pipeline_updated_at
BEFORE UPDATE ON public.sales_pipeline
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at
BEFORE UPDATE ON public.opportunities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
BEFORE UPDATE ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_activities_updated_at
BEFORE UPDATE ON public.sales_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default sales pipeline
INSERT INTO public.sales_pipeline (user_id, pipeline_name, stages, is_default) 
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Default Sales Pipeline',
  '[
    {"name": "Prospecting", "probability": 10, "color": "#gray"},
    {"name": "Qualification", "probability": 25, "color": "#blue"},
    {"name": "Proposal", "probability": 50, "color": "#yellow"},
    {"name": "Negotiation", "probability": 75, "color": "#orange"},
    {"name": "Closed Won", "probability": 100, "color": "#green"},
    {"name": "Closed Lost", "probability": 0, "color": "#red"}
  ]'::jsonb,
  true
);