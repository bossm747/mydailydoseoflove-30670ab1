-- Phase 9: Performance & Advanced Features Database Schema

-- Global Search Indexes Table
CREATE TABLE public.search_indexes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B')
  ) STORED,
  record_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  indexed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bulk Operations Table
CREATE TABLE public.bulk_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID,
  operation_name TEXT NOT NULL,
  operation_type TEXT NOT NULL, -- 'import', 'export', 'update', 'delete'
  target_table TEXT NOT NULL,
  total_records INTEGER NOT NULL DEFAULT 0,
  processed_records INTEGER NOT NULL DEFAULT 0,
  failed_records INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
  parameters JSONB DEFAULT '{}',
  results JSONB DEFAULT '{}',
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit Logs Table for Advanced Security
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Security Settings Table
CREATE TABLE public.security_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
  two_factor_secret TEXT,
  backup_codes TEXT[],
  login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  password_changed_at TIMESTAMP WITH TIME ZONE,
  security_questions JSONB DEFAULT '{}',
  trusted_devices JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance Cache Table
CREATE TABLE public.performance_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  cache_data JSONB NOT NULL,
  user_id UUID,
  business_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_search_indexes_vector ON public.search_indexes USING gin(search_vector);
CREATE INDEX idx_search_indexes_user_business ON public.search_indexes(user_id, business_id);
CREATE INDEX idx_search_indexes_table_type ON public.search_indexes(table_name, record_type);

CREATE INDEX idx_bulk_operations_user_business ON public.bulk_operations(user_id, business_id);
CREATE INDEX idx_bulk_operations_status ON public.bulk_operations(status);
CREATE INDEX idx_bulk_operations_created ON public.bulk_operations(created_at DESC);

CREATE INDEX idx_audit_logs_user_business ON public.audit_logs(user_id, business_id);
CREATE INDEX idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

CREATE INDEX idx_security_settings_user_business ON public.security_settings(user_id, business_id);

CREATE INDEX idx_performance_cache_key ON public.performance_cache(cache_key);
CREATE INDEX idx_performance_cache_expires ON public.performance_cache(expires_at);

-- Enable Row Level Security
ALTER TABLE public.search_indexes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Search Indexes
CREATE POLICY "Users can manage business search indexes" ON public.search_indexes
FOR ALL USING (
  auth.uid() = user_id OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_id = search_indexes.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- RLS Policies for Bulk Operations
CREATE POLICY "Users can manage business bulk operations" ON public.bulk_operations
FOR ALL USING (
  auth.uid() = user_id OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_id = bulk_operations.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- RLS Policies for Audit Logs
CREATE POLICY "Users can view business audit logs" ON public.audit_logs
FOR SELECT USING (
  auth.uid() = user_id OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_id = audit_logs.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

CREATE POLICY "System can insert audit logs" ON public.audit_logs
FOR INSERT WITH CHECK (true);

-- RLS Policies for Security Settings
CREATE POLICY "Users can manage their security settings" ON public.security_settings
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Performance Cache
CREATE POLICY "Users can access business cache" ON public.performance_cache
FOR ALL USING (
  user_id IS NULL OR 
  auth.uid() = user_id OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_id = performance_cache.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- Triggers for updated_at
CREATE TRIGGER update_search_indexes_updated_at
  BEFORE UPDATE ON public.search_indexes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bulk_operations_updated_at
  BEFORE UPDATE ON public.bulk_operations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_security_settings_updated_at
  BEFORE UPDATE ON public.security_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function for search indexing
CREATE OR REPLACE FUNCTION public.update_search_index(
  p_table_name TEXT,
  p_record_id UUID,
  p_title TEXT,
  p_content TEXT,
  p_record_type TEXT,
  p_metadata JSONB DEFAULT '{}',
  p_user_id UUID DEFAULT NULL,
  p_business_id UUID DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  index_id UUID;
BEGIN
  INSERT INTO public.search_indexes (
    user_id, business_id, table_name, record_id, title, content, record_type, metadata
  ) VALUES (
    COALESCE(p_user_id, auth.uid()),
    p_business_id,
    p_table_name,
    p_record_id,
    p_title,
    p_content,
    p_record_type,
    p_metadata
  )
  ON CONFLICT (user_id, table_name, record_id) 
  DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    record_type = EXCLUDED.record_type,
    metadata = EXCLUDED.metadata,
    updated_at = now()
  RETURNING id INTO index_id;
  
  RETURN index_id;
END;
$$;

-- Helper function for audit logging
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_table_name TEXT,
  p_record_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_business_id UUID DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, business_id, action, table_name, record_id, old_values, new_values
  ) VALUES (
    auth.uid(),
    p_business_id,
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Function to clean expired cache
CREATE OR REPLACE FUNCTION public.clean_expired_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.performance_cache 
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;