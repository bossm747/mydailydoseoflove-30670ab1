import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Calendar,
  Users,
  Filter,
  FileText,
  Download,
  Calculator
} from 'lucide-react';
import { PayrollPeriodForm } from './PayrollPeriodForm';

interface PayrollPeriod {
  id: string;
  business_id?: string;
  user_id: string;
  period_name: string;
  start_date: string;
  end_date: string;
  pay_date: string;
  status: string;
  total_gross_pay: number;
  total_deductions: number;
  total_net_pay: number;
  notes?: string;
  created_at: string;
}

interface PayrollEntry {
  id: string;
  employee_id: string;
  basic_salary: number;
  overtime_pay: number;
  allowances: any;
  bonuses: number;
  gross_pay: number;
  total_deductions: number;
  net_pay: number;
  status: string;
  employee?: {
    first_name: string;
    last_name: string;
    employee_id: string;
  };
}

export default function PayrollManager() {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  
  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([]);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PayrollPeriod | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [activeTab, setActiveTab] = useState('periods');

  const fetchPayrollPeriods = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payroll_periods')
        .select('*')
        .eq('business_id', currentBusiness?.id || null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayrollPeriods(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching payroll periods",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPayrollEntries = async (periodId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('payroll_entries')
        .select(`
          *,
          employee:employees(first_name, last_name, employee_id)
        `)
        .eq('payroll_period_id', periodId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayrollEntries(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching payroll entries",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPayrollPeriods();
  }, [user, currentBusiness]);

  const filteredPeriods = payrollPeriods.filter(period => 
    searchTerm === '' || 
    period.period_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    period.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'default';
      case 'draft': return 'secondary';
      case 'approved': return 'outline';
      case 'paid': return 'default';
      default: return 'secondary';
    }
  };

  const handleViewPeriod = (period: PayrollPeriod) => {
    setSelectedPeriod(period);
    fetchPayrollEntries(period.id);
    setActiveTab('entries');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Payroll Management</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Manage payroll periods and employee payments
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Payroll Period
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Periods</p>
                <p className="text-lg sm:text-2xl font-bold">{payrollPeriods.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Processed</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {payrollPeriods.filter(p => p.status === 'processed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Paid</p>
                <p className="text-lg sm:text-2xl font-bold">
                  ₱{payrollPeriods.reduce((sum, p) => sum + p.total_net_pay, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Draft</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {payrollPeriods.filter(p => p.status === 'draft').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payroll periods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="periods" className="text-xs sm:text-sm">
              Payroll Periods ({payrollPeriods.length})
            </TabsTrigger>
            <TabsTrigger value="entries" className="text-xs sm:text-sm">
              {selectedPeriod ? `${selectedPeriod.period_name} Entries` : 'Select Period'}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="periods" className="space-y-4">
          {filteredPeriods.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 sm:py-12">
                <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No payroll periods found</h3>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by creating your first payroll period'}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Payroll Period
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPeriods.map((period) => (
                <Card 
                  key={period.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleViewPeriod(period)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                      <div className="truncate font-semibold">
                        {period.period_name}
                      </div>
                      <Badge variant={getStatusColor(period.status)} className="text-xs">
                        {period.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Period:</span>
                        <span>{new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pay Date:</span>
                        <span>{new Date(period.pay_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-2">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Gross Pay:</span>
                          <span className="font-medium">₱{period.total_gross_pay.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Deductions:</span>
                          <span className="text-red-600">-₱{period.total_deductions.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Net Pay:</span>
                          <span className="text-primary">₱{period.total_net_pay.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="entries" className="space-y-4">
          {selectedPeriod ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedPeriod.period_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedPeriod.start_date).toLocaleDateString()} - {new Date(selectedPeriod.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </Button>
                </div>
              </div>

              {payrollEntries.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No payroll entries</h3>
                    <p className="text-muted-foreground mb-4">
                      Add employees to this payroll period
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Employee
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {payrollEntries.map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium">
                              {entry.employee?.first_name} {entry.employee?.last_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              ID: {entry.employee?.employee_id}
                            </p>
                          </div>
                          <div className="text-right sm:text-left">
                            <div className="text-sm space-y-1">
                              <div>Gross: ₱{entry.gross_pay.toLocaleString()}</div>
                              <div className="text-red-600">Deductions: -₱{entry.total_deductions.toLocaleString()}</div>
                              <div className="font-semibold text-primary">Net: ₱{entry.net_pay.toLocaleString()}</div>
                            </div>
                          </div>
                          <Badge variant={getStatusColor(entry.status)} className="text-xs">
                            {entry.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Select a payroll period</h3>
                <p className="text-muted-foreground">
                  Choose a payroll period from the Periods tab to view its entries
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <Dialog open={showCreateDialog || !!editingPeriod} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingPeriod(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingPeriod ? 'Edit Payroll Period' : 'Create New Payroll Period'}
            </DialogTitle>
          </DialogHeader>
          <PayrollPeriodForm 
            period={editingPeriod}
            onClose={() => {
              setShowCreateDialog(false);
              setEditingPeriod(null);
            }}
            onSaved={fetchPayrollPeriods}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}