-- Phase 5: Advanced Financial - Database Schema
-- Creating tables for invoicing, payments, and financial management

-- =============================================
-- INVOICE MANAGEMENT SYSTEM
-- =============================================

-- Main invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID,
  customer_id UUID,
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  currency TEXT NOT NULL DEFAULT 'PHP',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance_due NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  terms_conditions TEXT,
  payment_terms TEXT DEFAULT 'net_30',
  invoice_template TEXT DEFAULT 'standard',
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_status CHECK (status IN ('draft', 'sent', 'viewed', 'overdue', 'paid', 'cancelled')),
  CONSTRAINT valid_currency CHECK (currency IN ('PHP', 'USD', 'AED', 'EUR')),
  CONSTRAINT valid_payment_terms CHECK (payment_terms IN ('due_on_receipt', 'net_15', 'net_30', 'net_60', 'net_90')),
  CONSTRAINT positive_amounts CHECK (
    subtotal >= 0 AND 
    tax_amount >= 0 AND 
    discount_amount >= 0 AND 
    total_amount >= 0 AND 
    paid_amount >= 0 AND 
    balance_due >= 0
  )
);

-- Invoice line items table
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_rate NUMERIC(5,2) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  line_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT positive_quantity CHECK (quantity > 0),
  CONSTRAINT valid_discount_rate CHECK (discount_rate >= 0 AND discount_rate <= 100),
  CONSTRAINT valid_tax_rate CHECK (tax_rate >= 0 AND tax_rate <= 100)
);

-- =============================================
-- PAYMENT MANAGEMENT SYSTEM
-- =============================================

-- Payment methods table
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID,
  method_name TEXT NOT NULL,
  method_type TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  account_details JSONB,
  fees JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_method_type CHECK (method_type IN ('bank_transfer', 'credit_card', 'paypal', 'stripe', 'cash', 'check', 'gcash', 'paymaya'))
);

-- Payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  customer_id UUID,
  payment_number TEXT NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PHP',
  payment_method_id UUID REFERENCES public.payment_methods(id),
  payment_method_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reference_number TEXT,
  notes TEXT,
  transaction_fee NUMERIC(10,2) DEFAULT 0,
  net_amount NUMERIC(12,2) NOT NULL,
  payment_gateway_response JSONB,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  CONSTRAINT valid_currency CHECK (currency IN ('PHP', 'USD', 'AED', 'EUR')),
  CONSTRAINT positive_amounts CHECK (amount > 0 AND net_amount > 0 AND transaction_fee >= 0)
);

-- =============================================
-- TAX MANAGEMENT SYSTEM
-- =============================================

-- Tax settings table
CREATE TABLE public.tax_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID,
  tax_name TEXT NOT NULL,
  tax_type TEXT NOT NULL,
  tax_rate NUMERIC(5,2) NOT NULL,
  is_compound BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  applies_to TEXT NOT NULL DEFAULT 'all',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_tax_type CHECK (tax_type IN ('vat', 'sales_tax', 'gst', 'service_tax', 'withholding_tax')),
  CONSTRAINT valid_tax_rate CHECK (tax_rate >= 0 AND tax_rate <= 100),
  CONSTRAINT valid_applies_to CHECK (applies_to IN ('all', 'products', 'services'))
);

-- =============================================
-- CURRENCY MANAGEMENT SYSTEM
-- =============================================

-- Currencies table
CREATE TABLE public.currencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  currency_code TEXT NOT NULL,
  currency_name TEXT NOT NULL,
  currency_symbol TEXT NOT NULL,
  decimal_places INTEGER NOT NULL DEFAULT 2,
  is_base_currency BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_currency_code CHECK (LENGTH(currency_code) = 3),
  CONSTRAINT valid_decimal_places CHECK (decimal_places >= 0 AND decimal_places <= 4),
  UNIQUE(user_id, currency_code)
);

-- Exchange rates table  
CREATE TABLE public.exchange_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  exchange_rate NUMERIC(15,8) NOT NULL,
  rate_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT DEFAULT 'manual',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT positive_rate CHECK (exchange_rate > 0),
  CONSTRAINT valid_currencies CHECK (LENGTH(from_currency) = 3 AND LENGTH(to_currency) = 3),
  CONSTRAINT different_currencies CHECK (from_currency != to_currency),
  UNIQUE(user_id, from_currency, to_currency, rate_date)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Invoice indexes
CREATE INDEX idx_invoices_user_business ON public.invoices(user_id, business_id);
CREATE INDEX idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_date_range ON public.invoices(invoice_date, due_date);
CREATE INDEX idx_invoices_number ON public.invoices(invoice_number);

-- Invoice items indexes
CREATE INDEX idx_invoice_items_invoice ON public.invoice_items(invoice_id);

-- Payments indexes
CREATE INDEX idx_payments_user_business ON public.payments(user_id, business_id);
CREATE INDEX idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_date ON public.payments(payment_date);

-- Payment methods indexes
CREATE INDEX idx_payment_methods_user_business ON public.payment_methods(user_id, business_id);
CREATE INDEX idx_payment_methods_active ON public.payment_methods(is_active);

-- Tax settings indexes
CREATE INDEX idx_tax_settings_user_business ON public.tax_settings(user_id, business_id);
CREATE INDEX idx_tax_settings_active ON public.tax_settings(is_active);

-- Currency indexes
CREATE INDEX idx_currencies_user ON public.currencies(user_id);
CREATE INDEX idx_currencies_base ON public.currencies(is_base_currency);
CREATE INDEX idx_exchange_rates_user ON public.exchange_rates(user_id);
CREATE INDEX idx_exchange_rates_currencies ON public.exchange_rates(from_currency, to_currency);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Invoices policies
CREATE POLICY "Users can manage business invoices" ON public.invoices
FOR ALL USING (
  auth.uid() = user_id OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_id = invoices.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- Invoice items policies
CREATE POLICY "Users can manage invoice items" ON public.invoice_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = invoice_items.invoice_id 
    AND (
      invoices.user_id = auth.uid() OR
      (invoices.business_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM business_members 
        WHERE business_id = invoices.business_id 
        AND user_id = auth.uid() 
        AND is_active = true
      ))
    )
  )
);

-- Payments policies
CREATE POLICY "Users can manage business payments" ON public.payments
FOR ALL USING (
  auth.uid() = user_id OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_id = payments.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- Payment methods policies
CREATE POLICY "Users can manage business payment methods" ON public.payment_methods
FOR ALL USING (
  auth.uid() = user_id OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_id = payment_methods.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- Tax settings policies
CREATE POLICY "Users can manage business tax settings" ON public.tax_settings
FOR ALL USING (
  auth.uid() = user_id OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_id = tax_settings.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- Currencies policies
CREATE POLICY "Users can manage their currencies" ON public.currencies
FOR ALL USING (auth.uid() = user_id);

-- Exchange rates policies
CREATE POLICY "Users can manage their exchange rates" ON public.exchange_rates
FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Update timestamps triggers
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_settings_updated_at
  BEFORE UPDATE ON public.tax_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_currencies_updated_at
  BEFORE UPDATE ON public.currencies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exchange_rates_updated_at
  BEFORE UPDATE ON public.exchange_rates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INVOICE CALCULATION TRIGGERS
-- =============================================

-- Function to calculate invoice totals
CREATE OR REPLACE FUNCTION public.calculate_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate subtotal from invoice items
  UPDATE public.invoices 
  SET 
    subtotal = COALESCE((
      SELECT SUM(line_total) 
      FROM public.invoice_items 
      WHERE invoice_id = NEW.invoice_id
    ), 0),
    updated_at = now()
  WHERE id = NEW.invoice_id;
  
  -- Update total amount and balance due
  UPDATE public.invoices 
  SET 
    total_amount = subtotal + tax_amount - discount_amount,
    balance_due = subtotal + tax_amount - discount_amount - paid_amount,
    updated_at = now()
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate invoice totals when items change
CREATE TRIGGER recalculate_invoice_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_invoice_totals();

-- =============================================
-- DEFAULT DATA SETUP
-- =============================================

-- Insert default tax settings for Philippines
INSERT INTO public.tax_settings (user_id, tax_name, tax_type, tax_rate, description)
SELECT auth.uid(), 'VAT', 'vat', 12.00, 'Philippine Value Added Tax'
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

-- Insert default currencies
INSERT INTO public.currencies (user_id, currency_code, currency_name, currency_symbol, is_base_currency)
SELECT auth.uid(), 'PHP', 'Philippine Peso', '₱', true
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.currencies (user_id, currency_code, currency_name, currency_symbol)
SELECT auth.uid(), 'USD', 'US Dollar', '$'
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.currencies (user_id, currency_code, currency_name, currency_symbol)
SELECT auth.uid(), 'AED', 'UAE Dirham', 'د.إ'
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;