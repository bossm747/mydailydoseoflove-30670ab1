-- Phase 1: Multi-Business Management Foundation

-- Create businesses table
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT,
  industry TEXT,
  description TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address JSONB,
  tax_id TEXT,
  registration_number TEXT,
  founded_date DATE,
  logo_url TEXT,
  primary_currency TEXT DEFAULT 'PHP',
  timezone TEXT DEFAULT 'Asia/Manila',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_members table for multi-user access
CREATE TABLE public.business_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  permissions JSONB DEFAULT '{}',
  invited_by UUID,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, user_id)
);

-- Add business_id to existing tables
ALTER TABLE public.transactions ADD COLUMN business_id UUID;
ALTER TABLE public.bank_accounts ADD COLUMN business_id UUID;
ALTER TABLE public.assets ADD COLUMN business_id UUID;
ALTER TABLE public.debts ADD COLUMN business_id UUID;
ALTER TABLE public.financial_forecasts ADD COLUMN business_id UUID;
ALTER TABLE public.custom_reports ADD COLUMN business_id UUID;
ALTER TABLE public.tasks ADD COLUMN business_id UUID;
ALTER TABLE public.events ADD COLUMN business_id UUID;

-- Enable RLS
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for businesses
CREATE POLICY "Business owners can manage their businesses" 
ON public.businesses 
FOR ALL 
USING (auth.uid() = owner_id);

CREATE POLICY "Business members can view their businesses" 
ON public.businesses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = businesses.id 
    AND user_id = auth.uid() 
    AND is_active = true
  )
);

-- RLS Policies for business_members
CREATE POLICY "Business owners can manage members" 
ON public.business_members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_members.business_id 
    AND owner_id = auth.uid()
  )
);

CREATE POLICY "Members can view their own membership" 
ON public.business_members 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update existing RLS policies to include business context
-- Transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;

CREATE POLICY "Users can view business transactions" 
ON public.transactions 
FOR SELECT 
USING (
  auth.uid() = user_id OR
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = transactions.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

CREATE POLICY "Users can create business transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  (business_id IS NULL OR EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = transactions.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

CREATE POLICY "Users can update business transactions" 
ON public.transactions 
FOR UPDATE 
USING (
  auth.uid() = user_id AND
  (business_id IS NULL OR EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = transactions.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

CREATE POLICY "Users can delete business transactions" 
ON public.transactions 
FOR DELETE 
USING (
  auth.uid() = user_id AND
  (business_id IS NULL OR EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = transactions.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- Add timestamp triggers
CREATE TRIGGER update_businesses_updated_at
BEFORE UPDATE ON public.businesses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_members_updated_at
BEFORE UPDATE ON public.business_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();