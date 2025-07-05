-- Phase 4: Inventory & Project Management System

-- Create product_categories table
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  category_name TEXT NOT NULL,
  category_code TEXT,
  description TEXT,
  parent_category_id UUID REFERENCES public.product_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, category_code)
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  product_code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  product_type TEXT DEFAULT 'product',
  category_id UUID REFERENCES public.product_categories(id),
  unit_of_measure TEXT DEFAULT 'piece',
  cost_price NUMERIC DEFAULT 0,
  selling_price NUMERIC DEFAULT 0,
  min_stock_level NUMERIC DEFAULT 0,
  max_stock_level NUMERIC DEFAULT 0,
  reorder_point NUMERIC DEFAULT 0,
  is_trackable BOOLEAN DEFAULT true,
  is_sellable BOOLEAN DEFAULT true,
  is_purchasable BOOLEAN DEFAULT true,
  weight NUMERIC,
  dimensions JSONB,
  barcode TEXT,
  sku TEXT,
  supplier_info JSONB,
  tax_rate NUMERIC DEFAULT 0,
  images JSONB DEFAULT '[]',
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, product_code),
  UNIQUE(business_id, sku)
);

-- Create inventory table
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  location_name TEXT DEFAULT 'Main Warehouse',
  current_stock NUMERIC DEFAULT 0,
  available_stock NUMERIC DEFAULT 0,
  reserved_stock NUMERIC DEFAULT 0,
  incoming_stock NUMERIC DEFAULT 0,
  last_counted_at TIMESTAMP WITH TIME ZONE,
  last_counted_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, product_id, location_name)
);

-- Create inventory_transactions table
CREATE TABLE public.inventory_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  transaction_reference TEXT,
  quantity_change NUMERIC NOT NULL,
  unit_cost NUMERIC,
  total_cost NUMERIC,
  stock_before NUMERIC NOT NULL,
  stock_after NUMERIC NOT NULL,
  location_name TEXT DEFAULT 'Main Warehouse',
  reason TEXT,
  notes TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  project_code TEXT NOT NULL,
  project_name TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES public.customers(id),
  project_manager_id UUID,
  status TEXT DEFAULT 'planning',
  priority TEXT DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  budget NUMERIC DEFAULT 0,
  actual_cost NUMERIC DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  billing_method TEXT DEFAULT 'fixed_price',
  hourly_rate NUMERIC,
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, project_code)
);

-- Create project_tasks table
CREATE TABLE public.project_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  description TEXT,
  assigned_to UUID,
  status TEXT DEFAULT 'not_started',
  priority TEXT DEFAULT 'medium',
  start_date DATE,
  due_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  estimated_hours NUMERIC,
  actual_hours NUMERIC DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  parent_task_id UUID REFERENCES public.project_tasks(id),
  sort_order INTEGER DEFAULT 0,
  dependencies TEXT[],
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_categories
CREATE POLICY "Users can manage business product categories" 
ON public.product_categories 
FOR ALL 
USING (
  auth.uid() = user_id OR
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = product_categories.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- RLS Policies for products
CREATE POLICY "Users can manage business products" 
ON public.products 
FOR ALL 
USING (
  auth.uid() = user_id OR
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = products.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- RLS Policies for inventory
CREATE POLICY "Users can manage business inventory" 
ON public.inventory 
FOR ALL 
USING (
  auth.uid() = user_id OR
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = inventory.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- RLS Policies for inventory_transactions
CREATE POLICY "Users can manage business inventory transactions" 
ON public.inventory_transactions 
FOR ALL 
USING (
  auth.uid() = user_id OR
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = inventory_transactions.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- RLS Policies for projects
CREATE POLICY "Users can manage business projects" 
ON public.projects 
FOR ALL 
USING (
  auth.uid() = user_id OR
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = projects.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- RLS Policies for project_tasks
CREATE POLICY "Users can manage business project tasks" 
ON public.project_tasks 
FOR ALL 
USING (
  auth.uid() = user_id OR
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.business_members 
    WHERE business_id = project_tasks.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- Add timestamp triggers
CREATE TRIGGER update_product_categories_updated_at
BEFORE UPDATE ON public.product_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
BEFORE UPDATE ON public.inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at
BEFORE UPDATE ON public.project_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default product categories
INSERT INTO public.product_categories (user_id, business_id, category_name, category_code, description) VALUES
('00000000-0000-0000-0000-000000000000', NULL, 'General Products', 'GENERAL', 'General product category'),
('00000000-0000-0000-0000-000000000000', NULL, 'Services', 'SERVICES', 'Service offerings'),
('00000000-0000-0000-0000-000000000000', NULL, 'Digital Products', 'DIGITAL', 'Digital products and downloads'),
('00000000-0000-0000-0000-000000000000', NULL, 'Raw Materials', 'RAW_MAT', 'Raw materials and supplies'),
('00000000-0000-0000-0000-000000000000', NULL, 'Finished Goods', 'FINISHED', 'Finished products ready for sale');