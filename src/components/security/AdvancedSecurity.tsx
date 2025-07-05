import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Key, Smartphone, History, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SecuritySettings {
  id: string;
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  backup_codes: string[] | null;
  login_attempts: number;
  locked_until: string | null;
  password_changed_at: string | null;
  security_questions: any;
  trusted_devices: any;
}

interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_values: any;
  new_values: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export default function AdvancedSecurity() {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchSecuritySettings();
      fetchAuditLogs();
    }
  }, [user, currentBusiness]);

  const fetchSecuritySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .eq('user_id', user!.id)
        .eq('business_id', currentBusiness?.id || null)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        // Create default security settings
        const { data: newSettings, error: createError } = await supabase
          .from('security_settings')
          .insert([{
            user_id: user!.id,
            business_id: currentBusiness?.id || null,
            two_factor_enabled: false,
            login_attempts: 0,
            security_questions: {},
            trusted_devices: []
          }])
          .select()
          .single();

        if (createError) throw createError;
        setSecuritySettings(newSettings);
      } else {
        setSecuritySettings(data as SecuritySettings);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch security settings",
        variant: "destructive",
      });
    }
  };

  const fetchAuditLogs = async () => {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (currentBusiness) {
        query = query.eq('business_id', currentBusiness.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      setAuditLogs((data || []) as AuditLog[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch audit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    if (!securitySettings) return;

    try {
      if (enabled) {
        // Generate backup codes
        const codes = Array.from({ length: 10 }, () => 
          Math.random().toString(36).substr(2, 8).toUpperCase()
        );
        setBackupCodes(codes);
        
        const { error } = await supabase
          .from('security_settings')
          .update({ 
            two_factor_enabled: true,
            backup_codes: codes,
            two_factor_secret: 'generated_secret_placeholder' // In real app, generate proper secret
          })
          .eq('id', securitySettings.id);

        if (error) throw error;

        setIs2FASetupOpen(true);
      } else {
        const { error } = await supabase
          .from('security_settings')
          .update({ 
            two_factor_enabled: false,
            backup_codes: null,
            two_factor_secret: null
          })
          .eq('id', securitySettings.id);

        if (error) throw error;
      }

      fetchSecuritySettings();
      
      toast({
        title: "Success",
        description: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSecurityQuestionSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!securitySettings) return;

    const formData = new FormData(e.currentTarget);
    const questions = {
      question1: formData.get('question1') as string,
      answer1: formData.get('answer1') as string,
      question2: formData.get('question2') as string,
      answer2: formData.get('answer2') as string,
    };

    try {
      const { error } = await supabase
        .from('security_settings')
        .update({ security_questions: questions })
        .eq('id', securitySettings.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Security questions updated successfully",
      });

      fetchSecuritySettings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getActionBadge = (action: string) => {
    const config = {
      CREATE: { label: 'Created', variant: 'default' as const },
      UPDATE: { label: 'Updated', variant: 'secondary' as const },
      DELETE: { label: 'Deleted', variant: 'destructive' as const },
      LOGIN: { label: 'Login', variant: 'outline' as const },
      LOGOUT: { label: 'Logout', variant: 'outline' as const },
    };
    
    const actionConfig = config[action as keyof typeof config] || { label: action, variant: 'outline' as const };
    return <Badge variant={actionConfig.variant}>{actionConfig.label}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading security settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Advanced Security</h1>
        <p className="text-muted-foreground">Manage your account security and access controls</p>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Enable 2FA</Label>
                  <p className="text-sm text-muted-foreground">
                    Require a verification code when signing in
                  </p>
                </div>
                <Switch
                  checked={securitySettings?.two_factor_enabled || false}
                  onCheckedChange={handleToggle2FA}
                />
              </div>

              {securitySettings?.two_factor_enabled && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">2FA is enabled</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your account is protected with two-factor authentication
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Security Questions
              </CardTitle>
              <CardDescription>
                Set up security questions for account recovery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSecurityQuestionSave} className="space-y-4">
                <div>
                  <Label htmlFor="question1">Security Question 1</Label>
                  <Input
                    id="question1"
                    name="question1"
                    placeholder="What was the name of your first pet?"
                    defaultValue={securitySettings?.security_questions?.question1 || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="answer1">Answer 1</Label>
                  <Input
                    id="answer1"
                    name="answer1"
                    type="password"
                    placeholder="Your answer"
                    defaultValue={securitySettings?.security_questions?.answer1 || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="question2">Security Question 2</Label>
                  <Input
                    id="question2"
                    name="question2"
                    placeholder="What city were you born in?"
                    defaultValue={securitySettings?.security_questions?.question2 || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="answer2">Answer 2</Label>
                  <Input
                    id="answer2"
                    name="answer2"
                    type="password"
                    placeholder="Your answer"
                    defaultValue={securitySettings?.security_questions?.answer2 || ''}
                  />
                </div>
                <Button type="submit">Save Security Questions</Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Login Attempts</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold">{securitySettings?.login_attempts || 0}</span>
                    <span className="text-sm text-muted-foreground">failed attempts</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Account Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {securitySettings?.locked_until ? (
                      <Badge variant="destructive">Locked</Badge>
                    ) : (
                      <Badge variant="default">Active</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Audit Logs
              </CardTitle>
              <CardDescription>
                Track all security-related activities on your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No audit logs found</h3>
                  <p className="text-muted-foreground">Security events will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{log.table_name}</h3>
                          {getActionBadge(log.action)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      
                      {log.ip_address && (
                        <div className="text-sm text-muted-foreground mb-2">
                          IP Address: {log.ip_address}
                        </div>
                      )}
                      
                      {(log.old_values || log.new_values) && (
                        <div className="text-xs">
                          {log.old_values && (
                            <div className="mb-1">
                              <span className="font-medium">Before:</span> {JSON.stringify(log.old_values).substring(0, 100)}...
                            </div>
                          )}
                          {log.new_values && (
                            <div>
                              <span className="font-medium">After:</span> {JSON.stringify(log.new_values).substring(0, 100)}...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 2FA Setup Dialog */}
      <Dialog open={is2FASetupOpen} onOpenChange={setIs2FASetupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication Enabled</DialogTitle>
            <DialogDescription>
              Save these backup codes in a secure location. You can use them to access your account if you lose access to your authenticator app.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Backup Codes</h4>
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="p-2 bg-background rounded border">
                    {code}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Store these codes securely - they won't be shown again</span>
            </div>
            <Button onClick={() => setIs2FASetupOpen(false)} className="w-full">
              I've Saved My Backup Codes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}