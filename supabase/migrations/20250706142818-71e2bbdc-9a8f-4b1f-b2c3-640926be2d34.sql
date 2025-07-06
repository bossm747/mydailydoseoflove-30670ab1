-- Phase 3: Notification Center System Database Setup
-- Create notifications system for user alerts and messages

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID,
  notification_type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  action_text TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  priority TEXT NOT NULL DEFAULT 'medium',
  category TEXT,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create notification_templates table for system notifications
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL UNIQUE,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'info',
  priority TEXT NOT NULL DEFAULT 'medium',
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  variables JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Enable RLS on new tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for notifications
CREATE POLICY "Users can manage their own notifications" 
ON public.notifications 
FOR ALL 
USING (
  (auth.uid() = user_id) OR 
  (business_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_members.business_id = notifications.business_id 
    AND business_members.user_id = auth.uid() 
    AND business_members.is_active = true
  ))
);

-- 5. Create RLS policies for notification_templates (system-wide)
CREATE POLICY "Users can view notification templates" 
ON public.notification_templates 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage notification templates" 
ON public.notification_templates 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- 6. Create triggers for updated_at columns
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_business ON public.notifications(user_id, business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_templates_name ON public.notification_templates(template_name);

-- 8. Insert default notification templates
INSERT INTO public.notification_templates (template_name, title_template, message_template, notification_type, priority, category) VALUES
('budget_threshold', 'Budget Alert: {{budget_name}}', 'Your budget "{{budget_name}}" has reached {{percentage}}% of the allocated amount.', 'warning', 'high', 'financial'),
('invoice_overdue', 'Overdue Invoice: {{invoice_number}}', 'Invoice {{invoice_number}} for {{customer_name}} is overdue by {{days}} days.', 'error', 'high', 'financial'),
('opportunity_expiring', 'Opportunity Expiring: {{opportunity_name}}', 'The opportunity "{{opportunity_name}}" is expiring soon on {{expiry_date}}.', 'warning', 'medium', 'sales'),
('quote_accepted', 'Quote Accepted: {{quote_number}}', 'Your quote {{quote_number}} has been accepted by {{customer_name}}.', 'success', 'medium', 'sales'),
('employee_leave_request', 'Leave Request: {{employee_name}}', 'New leave request from {{employee_name}} for {{leave_type}} from {{start_date}} to {{end_date}}.', 'info', 'medium', 'hr'),
('project_deadline', 'Project Deadline: {{project_name}}', 'Project "{{project_name}}" is due on {{due_date}}.', 'warning', 'medium', 'projects'),
('low_inventory', 'Low Stock Alert: {{product_name}}', 'Product "{{product_name}}" is running low with only {{quantity}} units remaining.', 'warning', 'medium', 'inventory'),
('payment_received', 'Payment Received: {{amount}}', 'Payment of {{amount}} received for invoice {{invoice_number}}.', 'success', 'low', 'financial')
ON CONFLICT (template_name) DO NOTHING;