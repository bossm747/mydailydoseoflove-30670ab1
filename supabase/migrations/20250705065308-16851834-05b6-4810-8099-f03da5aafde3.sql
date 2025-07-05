-- Phase 2: Quote System Database Setup
-- Create quotes table and related structures

-- 1. Create quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID,
  quote_number TEXT NOT NULL,
  customer_id UUID,
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'PHP',
  notes TEXT,
  terms_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create quote_items table for line items
CREATE TABLE IF NOT EXISTS public.quote_items (
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

-- 3. Enable RLS on new tables
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for quotes
CREATE POLICY "Users can manage business quotes" 
ON public.quotes 
FOR ALL 
USING (
  (auth.uid() = user_id) OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_members.business_id = quotes.business_id 
    AND business_members.user_id = auth.uid() 
    AND business_members.is_active = true
  ))
);

-- 5. Create RLS policies for quote_items
CREATE POLICY "Users can manage quote items" 
ON public.quote_items 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.quotes 
    WHERE quotes.id = quote_items.quote_id 
    AND (
      (quotes.user_id = auth.uid()) OR 
      (quotes.business_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM business_members 
        WHERE business_members.business_id = quotes.business_id 
        AND business_members.user_id = auth.uid() 
        AND business_members.is_active = true
      ))
    )
  )
);

-- 6. Create triggers for updated_at columns
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Create function to calculate quote totals
CREATE OR REPLACE FUNCTION public.calculate_quote_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Calculate subtotal from quote items
  UPDATE public.quotes 
  SET 
    subtotal = COALESCE((
      SELECT SUM(line_total) 
      FROM public.quote_items 
      WHERE quote_id = NEW.quote_id
    ), 0),
    updated_at = now()
  WHERE id = NEW.quote_id;
  
  -- Update total amount
  UPDATE public.quotes 
  SET 
    total_amount = subtotal + tax_amount - discount_amount,
    updated_at = now()
  WHERE id = NEW.quote_id;
  
  RETURN NEW;
END;
$$;

-- 8. Create trigger for quote totals calculation
CREATE TRIGGER calculate_quote_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.quote_items
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_quote_totals();

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quotes_user_business ON public.quotes(user_id, business_id);
CREATE INDEX IF NOT EXISTS idx_quotes_number ON public.quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON public.quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON public.quote_items(quote_id);