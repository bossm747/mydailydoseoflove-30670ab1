-- Phase 8: Advanced Integrations Database Schema

-- Email Templates Table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID NULL,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'general', -- general, invoice, notification, marketing
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email Logs Table
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID NULL,
  template_id UUID NULL,
  recipient_email TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NULL,
  body_text TEXT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed, bounced
  error_message TEXT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NULL,
  opened_at TIMESTAMP WITH TIME ZONE NULL,
  clicked_at TIMESTAMP WITH TIME ZONE NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- File Uploads Table
CREATE TABLE public.file_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID NULL,
  original_filename TEXT NOT NULL,
  stored_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  file_category TEXT NOT NULL DEFAULT 'document', -- document, image, invoice, asset
  related_table TEXT NULL,
  related_id UUID NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  upload_source TEXT NOT NULL DEFAULT 'web', -- web, mobile, api
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Webhooks Table
CREATE TABLE public.webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID NULL,
  webhook_name TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  webhook_secret TEXT NULL,
  event_types TEXT[] NOT NULL, -- ['invoice.created', 'payment.received', etc.]
  is_active BOOLEAN NOT NULL DEFAULT true,
  retry_count INTEGER NOT NULL DEFAULT 3,
  timeout_seconds INTEGER NOT NULL DEFAULT 30,
  headers JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Webhook Logs Table
CREATE TABLE public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  request_url TEXT NOT NULL,
  request_headers JSONB DEFAULT '{}',
  request_body TEXT NOT NULL,
  response_status INTEGER NULL,
  response_headers JSONB DEFAULT '{}',
  response_body TEXT NULL,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, success, failed, retrying
  error_message TEXT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Integrations Table
CREATE TABLE public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID NULL,
  integration_name TEXT NOT NULL,
  integration_type TEXT NOT NULL, -- email, sms, payment, crm, etc.
  provider_name TEXT NOT NULL, -- gmail, twilio, stripe, etc.
  configuration JSONB NOT NULL DEFAULT '{}',
  credentials JSONB DEFAULT '{}', -- encrypted credentials
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE NULL,
  sync_status TEXT DEFAULT 'never_synced', -- never_synced, syncing, success, failed
  error_message TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- API Logs Table
CREATE TABLE public.api_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID NULL,
  integration_id UUID NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  request_headers JSONB DEFAULT '{}',
  request_body TEXT NULL,
  response_status INTEGER NULL,
  response_headers JSONB DEFAULT '{}',
  response_body TEXT NULL,
  response_time_ms INTEGER NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, success, failed
  error_message TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Email Templates
CREATE POLICY "Users can manage business email templates" ON public.email_templates
FOR ALL USING (
  auth.uid() = user_id OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_members.business_id = email_templates.business_id 
    AND business_members.user_id = auth.uid() 
    AND business_members.is_active = true
  ))
);

-- RLS Policies for Email Logs
CREATE POLICY "Users can view business email logs" ON public.email_logs
FOR SELECT USING (
  auth.uid() = user_id OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_members.business_id = email_logs.business_id 
    AND business_members.user_id = auth.uid() 
    AND business_members.is_active = true
  ))
);

CREATE POLICY "System can insert email logs" ON public.email_logs
FOR INSERT WITH CHECK (true);

-- RLS Policies for File Uploads
CREATE POLICY "Users can manage business file uploads" ON public.file_uploads
FOR ALL USING (
  auth.uid() = user_id OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_members.business_id = file_uploads.business_id 
    AND business_members.user_id = auth.uid() 
    AND business_members.is_active = true
  ))
);

-- RLS Policies for Webhooks
CREATE POLICY "Users can manage business webhooks" ON public.webhooks
FOR ALL USING (
  auth.uid() = user_id OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_members.business_id = webhooks.business_id 
    AND business_members.user_id = auth.uid() 
    AND business_members.is_active = true
  ))
);

-- RLS Policies for Webhook Logs
CREATE POLICY "Users can view webhook logs" ON public.webhook_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM webhooks 
    WHERE webhooks.id = webhook_logs.webhook_id 
    AND (webhooks.user_id = auth.uid() OR 
         (webhooks.business_id IS NOT NULL AND EXISTS (
           SELECT 1 FROM business_members 
           WHERE business_members.business_id = webhooks.business_id 
           AND business_members.user_id = auth.uid() 
           AND business_members.is_active = true
         )))
  )
);

CREATE POLICY "System can insert webhook logs" ON public.webhook_logs
FOR INSERT WITH CHECK (true);

-- RLS Policies for Integrations
CREATE POLICY "Users can manage business integrations" ON public.integrations
FOR ALL USING (
  auth.uid() = user_id OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_members.business_id = integrations.business_id 
    AND business_members.user_id = auth.uid() 
    AND business_members.is_active = true
  ))
);

-- RLS Policies for API Logs
CREATE POLICY "Users can view business API logs" ON public.api_logs
FOR SELECT USING (
  auth.uid() = user_id OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_members.business_id = api_logs.business_id 
    AND business_members.user_id = auth.uid() 
    AND business_members.is_active = true
  ))
);

CREATE POLICY "System can insert API logs" ON public.api_logs
FOR INSERT WITH CHECK (true);

-- Foreign Key Relationships
ALTER TABLE public.email_logs ADD CONSTRAINT email_logs_template_id_fkey 
FOREIGN KEY (template_id) REFERENCES public.email_templates(id) ON DELETE SET NULL;

ALTER TABLE public.webhook_logs ADD CONSTRAINT webhook_logs_webhook_id_fkey 
FOREIGN KEY (webhook_id) REFERENCES public.webhooks(id) ON DELETE CASCADE;

ALTER TABLE public.api_logs ADD CONSTRAINT api_logs_integration_id_fkey 
FOREIGN KEY (integration_id) REFERENCES public.integrations(id) ON DELETE SET NULL;

-- Updated At Triggers
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_file_uploads_updated_at
BEFORE UPDATE ON public.file_uploads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at
BEFORE UPDATE ON public.webhooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
BEFORE UPDATE ON public.integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helper Function for Webhook Processing
CREATE OR REPLACE FUNCTION public.process_webhook_event(
  p_event_type TEXT,
  p_event_data JSONB,
  p_business_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  webhook_record RECORD;
  log_id UUID;
BEGIN
  -- Find active webhooks for this event type
  FOR webhook_record IN 
    SELECT * FROM public.webhooks 
    WHERE is_active = true 
    AND p_event_type = ANY(event_types)
    AND (business_id = p_business_id OR business_id IS NULL)
  LOOP
    -- Log the webhook attempt
    INSERT INTO public.webhook_logs (
      webhook_id,
      event_type,
      event_data,
      request_url,
      request_headers,
      request_body,
      status
    ) VALUES (
      webhook_record.id,
      p_event_type,
      p_event_data,
      webhook_record.webhook_url,
      webhook_record.headers,
      p_event_data::TEXT,
      'pending'
    ) RETURNING id INTO log_id;
    
    -- Here you would trigger the actual webhook call
    -- This would be handled by an Edge Function in production
  END LOOP;
  
  RETURN true;
END;
$$;