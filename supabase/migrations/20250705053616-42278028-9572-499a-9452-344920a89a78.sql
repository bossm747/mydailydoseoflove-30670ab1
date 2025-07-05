-- Phase 6: Analytics & Reporting - Database Schema
-- Creating comprehensive analytics and reporting infrastructure

-- =============================================
-- ANALYTICS EVENTS TRACKING
-- =============================================

-- Core analytics events table for tracking all user interactions
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_event_type CHECK (event_type IN ('page_view', 'click', 'form_submit', 'api_call', 'business_action', 'custom'))
);

-- Business metrics tracking table
CREATE TABLE public.metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID,
  metric_name TEXT NOT NULL,
  metric_category TEXT NOT NULL,
  metric_value NUMERIC(15,4) NOT NULL,
  metric_unit TEXT DEFAULT 'count',
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_metric_category CHECK (metric_category IN ('sales', 'finance', 'hr', 'inventory', 'customer', 'operational', 'custom')),
  CONSTRAINT valid_period CHECK (period_end >= period_start),
  UNIQUE(user_id, business_id, metric_name, period_start, period_end)
);

-- =============================================
-- KPI MANAGEMENT SYSTEM
-- =============================================

-- KPI definitions and targets
CREATE TABLE public.kpis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID,
  kpi_name TEXT NOT NULL,
  kpi_description TEXT,
  kpi_category TEXT NOT NULL,
  kpi_type TEXT NOT NULL DEFAULT 'numeric',
  target_value NUMERIC(15,4),
  target_period TEXT NOT NULL DEFAULT 'monthly',
  calculation_method TEXT NOT NULL,
  data_source TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_kpi_category CHECK (kpi_category IN ('revenue', 'growth', 'efficiency', 'quality', 'customer', 'employee', 'financial', 'operational')),
  CONSTRAINT valid_kpi_type CHECK (kpi_type IN ('numeric', 'percentage', 'ratio', 'count', 'currency')),
  CONSTRAINT valid_target_period CHECK (target_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  CONSTRAINT valid_calculation_method CHECK (calculation_method IN ('sum', 'average', 'count', 'percentage', 'ratio', 'custom'))
);

-- KPI actual values and progress tracking
CREATE TABLE public.kpi_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kpi_id UUID NOT NULL REFERENCES public.kpis(id) ON DELETE CASCADE,
  actual_value NUMERIC(15,4) NOT NULL,
  target_value NUMERIC(15,4),
  achievement_percentage NUMERIC(5,2),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  calculation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_achievement_percentage CHECK (achievement_percentage >= 0),
  CONSTRAINT valid_period CHECK (period_end >= period_start),
  UNIQUE(kpi_id, period_start, period_end)
);

-- =============================================
-- REPORTING SYSTEM
-- =============================================

-- Report templates and configurations
CREATE TABLE public.report_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID,
  template_name TEXT NOT NULL,
  template_description TEXT,
  report_type TEXT NOT NULL,
  template_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  data_sources TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  filters JSONB DEFAULT '{}'::jsonb,
  chart_configs JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_report_type CHECK (report_type IN ('dashboard', 'summary', 'detailed', 'comparison', 'trend', 'export'))
);

-- Scheduled reports and automation
CREATE TABLE public.report_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID,
  template_id UUID NOT NULL REFERENCES public.report_templates(id) ON DELETE CASCADE,
  schedule_name TEXT NOT NULL,
  frequency TEXT NOT NULL,
  schedule_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  recipients TEXT[] DEFAULT ARRAY[]::TEXT[],
  delivery_method TEXT NOT NULL DEFAULT 'email',
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_frequency CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom')),
  CONSTRAINT valid_delivery_method CHECK (delivery_method IN ('email', 'pdf', 'csv', 'json', 'webhook'))
);

-- Report execution history and results
CREATE TABLE public.report_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES public.report_schedules(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.report_templates(id) ON DELETE CASCADE,
  execution_status TEXT NOT NULL DEFAULT 'pending',
  execution_data JSONB,
  error_message TEXT,
  file_url TEXT,
  execution_time_ms INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_execution_status CHECK (execution_status IN ('pending', 'running', 'completed', 'failed', 'cancelled'))
);

-- =============================================
-- DATA EXPORT SYSTEM
-- =============================================

-- Data export requests and history
CREATE TABLE public.data_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID,
  export_name TEXT NOT NULL,
  export_type TEXT NOT NULL,
  data_source TEXT NOT NULL,
  filters JSONB DEFAULT '{}'::jsonb,
  export_format TEXT NOT NULL DEFAULT 'csv',
  file_url TEXT,
  file_size_bytes BIGINT,
  record_count INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_export_type CHECK (export_type IN ('full', 'filtered', 'custom', 'scheduled')),
  CONSTRAINT valid_export_format CHECK (export_format IN ('csv', 'xlsx', 'json', 'pdf')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired'))
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Analytics events indexes
CREATE INDEX idx_analytics_events_user_business ON public.analytics_events(user_id, business_id);
CREATE INDEX idx_analytics_events_type_name ON public.analytics_events(event_type, event_name);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_events_session ON public.analytics_events(session_id) WHERE session_id IS NOT NULL;

-- Metrics indexes
CREATE INDEX idx_metrics_user_business ON public.metrics(user_id, business_id);
CREATE INDEX idx_metrics_category ON public.metrics(metric_category);
CREATE INDEX idx_metrics_period ON public.metrics(period_start, period_end);
CREATE INDEX idx_metrics_name_period ON public.metrics(metric_name, period_start);

-- KPIs indexes
CREATE INDEX idx_kpis_user_business ON public.kpis(user_id, business_id);
CREATE INDEX idx_kpis_category_active ON public.kpis(kpi_category, is_active);
CREATE INDEX idx_kpis_display_order ON public.kpis(display_order) WHERE is_active = true;

-- KPI values indexes
CREATE INDEX idx_kpi_values_kpi_period ON public.kpi_values(kpi_id, period_start, period_end);
CREATE INDEX idx_kpi_values_calculation_date ON public.kpi_values(calculation_date);

-- Report templates indexes
CREATE INDEX idx_report_templates_user_business ON public.report_templates(user_id, business_id);
CREATE INDEX idx_report_templates_type_active ON public.report_templates(report_type, is_active);

-- Report schedules indexes
CREATE INDEX idx_report_schedules_next_run ON public.report_schedules(next_run_at) WHERE is_active = true;
CREATE INDEX idx_report_schedules_template ON public.report_schedules(template_id);

-- Data exports indexes
CREATE INDEX idx_data_exports_user_business ON public.data_exports(user_id, business_id);
CREATE INDEX idx_data_exports_status ON public.data_exports(status);
CREATE INDEX idx_data_exports_requested_at ON public.data_exports(requested_at);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_exports ENABLE ROW LEVEL SECURITY;

-- Analytics events policies
CREATE POLICY "Users can manage business analytics events" ON public.analytics_events
FOR ALL USING (
  auth.uid() = user_id OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_id = analytics_events.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- Metrics policies
CREATE POLICY "Users can manage business metrics" ON public.metrics
FOR ALL USING (
  auth.uid() = user_id OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_id = metrics.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- KPIs policies
CREATE POLICY "Users can manage business KPIs" ON public.kpis
FOR ALL USING (
  auth.uid() = user_id OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_id = kpis.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- KPI values policies
CREATE POLICY "Users can manage KPI values" ON public.kpi_values
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM kpis 
    WHERE kpis.id = kpi_values.kpi_id 
    AND (
      kpis.user_id = auth.uid() OR
      (kpis.business_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM business_members 
        WHERE business_id = kpis.business_id 
        AND user_id = auth.uid() 
        AND is_active = true
      ))
    )
  )
);

-- Report templates policies
CREATE POLICY "Users can manage business report templates" ON public.report_templates
FOR ALL USING (
  auth.uid() = user_id OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_id = report_templates.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- Report schedules policies
CREATE POLICY "Users can manage business report schedules" ON public.report_schedules
FOR ALL USING (
  auth.uid() = user_id OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_id = report_schedules.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- Report executions policies
CREATE POLICY "Users can view report executions" ON public.report_executions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM report_templates rt
    LEFT JOIN report_schedules rs ON rs.template_id = rt.id
    WHERE (rt.id = report_executions.template_id OR rs.id = report_executions.schedule_id)
    AND (
      rt.user_id = auth.uid() OR
      (rt.business_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM business_members 
        WHERE business_id = rt.business_id 
        AND user_id = auth.uid() 
        AND is_active = true
      ))
    )
  )
);

-- Data exports policies
CREATE POLICY "Users can manage business data exports" ON public.data_exports
FOR ALL USING (
  auth.uid() = user_id OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_id = data_exports.business_id 
    AND user_id = auth.uid() 
    AND is_active = true
  ))
);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Update timestamps triggers
CREATE TRIGGER update_metrics_updated_at
  BEFORE UPDATE ON public.metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kpis_updated_at
  BEFORE UPDATE ON public.kpis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_report_templates_updated_at
  BEFORE UPDATE ON public.report_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_report_schedules_updated_at
  BEFORE UPDATE ON public.report_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ANALYTICS HELPER FUNCTIONS
-- =============================================

-- Function to calculate KPI achievement percentage
CREATE OR REPLACE FUNCTION public.calculate_kpi_achievement()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate achievement percentage
  IF NEW.target_value IS NOT NULL AND NEW.target_value != 0 THEN
    NEW.achievement_percentage = (NEW.actual_value / NEW.target_value) * 100;
  ELSE
    NEW.achievement_percentage = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate KPI achievement
CREATE TRIGGER calculate_kpi_achievement_trigger
  BEFORE INSERT OR UPDATE ON public.kpi_values
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_kpi_achievement();

-- Function to track analytics events
CREATE OR REPLACE FUNCTION public.track_analytics_event(
  p_event_type TEXT,
  p_event_name TEXT,
  p_event_data JSONB DEFAULT '{}'::jsonb,
  p_business_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.analytics_events (
    user_id,
    business_id,
    event_type,
    event_name,
    event_data
  ) VALUES (
    auth.uid(),
    p_business_id,
    p_event_type,
    p_event_name,
    p_event_data
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Insert sample KPIs for businesses
INSERT INTO public.kpis (user_id, kpi_name, kpi_description, kpi_category, target_value, target_period, calculation_method)
SELECT auth.uid(), 'Monthly Revenue', 'Total monthly revenue from all sources', 'revenue', 50000, 'monthly', 'sum'
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.kpis (user_id, kpi_name, kpi_description, kpi_category, target_value, target_period, calculation_method)
SELECT auth.uid(), 'Customer Acquisition', 'New customers acquired per month', 'customer', 25, 'monthly', 'count'
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.kpis (user_id, kpi_name, kpi_description, kpi_category, target_value, target_period, calculation_method)
SELECT auth.uid(), 'Employee Satisfaction', 'Average employee satisfaction score', 'employee', 4.5, 'monthly', 'average'
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;