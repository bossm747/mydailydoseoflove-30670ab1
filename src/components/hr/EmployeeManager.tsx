import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  Building,
  MapPin,
  Filter,
  UserCheck,
  Clock,
  DollarSign
} from 'lucide-react';
import { EmployeeForm } from './EmployeeForm';

interface Employee {
  id: string;
  business_id?: string;
  user_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  date_of_birth?: string;
  hire_date: string;
  termination_date?: string;
  job_title: string;
  department?: string;
  manager_id?: string;
  employment_type: string;
  employment_status: string;
  salary_type: string;
  base_salary: number;
  hourly_rate: number;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export default function EmployeeManager() {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchEmployees = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('business_id', currentBusiness?.id || null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching employees",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [user, currentBusiness]);

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = searchTerm === '' || 
      employee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'active' && employee.employment_status === 'active') ||
      (activeTab === 'inactive' && employee.employment_status !== 'active') ||
      (activeTab === 'full_time' && employee.employment_type === 'full_time') ||
      (activeTab === 'part_time' && employee.employment_type === 'part_time');
    
    return matchesSearch && matchesTab;
  });

  const getEmployeeDisplayName = (employee: Employee) => {
    return `${employee.first_name} ${employee.last_name}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'terminated': return 'destructive';
      case 'on_leave': return 'outline';
      default: return 'secondary';
    }
  };

  const getEmploymentTypeColor = (type: string) => {
    switch (type) {
      case 'full_time': return 'default';
      case 'part_time': return 'secondary';
      case 'contract': return 'outline';
      case 'intern': return 'outline';
      default: return 'secondary';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Employee Management</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Manage your team and employee information
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Stats Cards - Mobile Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-lg sm:text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {employees.filter(e => e.employment_status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Full-Time</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {employees.filter(e => e.employment_type === 'full_time').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Avg Salary</p>
                <p className="text-lg sm:text-2xl font-bold">
                  ₱{employees.length > 0 ? Math.round(employees.reduce((sum, e) => sum + e.base_salary, 0) / employees.length).toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
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

      {/* Tabs - Mobile Responsive */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All ({employees.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm">
              Active ({employees.filter(e => e.employment_status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="full_time" className="text-xs sm:text-sm">
              Full-Time ({employees.filter(e => e.employment_type === 'full_time').length})
            </TabsTrigger>
            <TabsTrigger value="part_time" className="text-xs sm:text-sm">
              Part-Time ({employees.filter(e => e.employment_type === 'part_time').length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredEmployees.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 sm:py-12">
                <Users className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No employees found</h3>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first employee'}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Employee
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredEmployees.map((employee) => (
                <Card 
                  key={employee.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setEditingEmployee(employee)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                      <div className="flex items-center min-w-0 flex-1">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3">
                          <AvatarImage src={employee.avatar_url} />
                          <AvatarFallback className="text-xs sm:text-sm">
                            {getInitials(employee.first_name, employee.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold text-sm sm:text-base">
                            {getEmployeeDisplayName(employee)}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate">
                            {employee.employee_id}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-1">
                        <Badge variant={getStatusColor(employee.employment_status)} className="text-xs">
                          {employee.employment_status}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3">
                    <div className="text-sm font-medium text-primary truncate">
                      {employee.job_title}
                    </div>
                    
                    {employee.department && (
                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                        <Building className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{employee.department}</span>
                      </div>
                    )}
                    
                    {employee.email && (
                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{employee.email}</span>
                      </div>
                    )}
                    
                    {(employee.phone || employee.mobile) && (
                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{employee.mobile || employee.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 text-xs">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Hired {new Date(employee.hire_date).getFullYear()}</span>
                      </div>
                      <Badge variant={getEmploymentTypeColor(employee.employment_type)} className="text-xs">
                        {employee.employment_type.replace('_', ' ')}
                      </Badge>
                    </div>

                    {employee.base_salary > 0 && (
                      <div className="text-right text-sm font-semibold text-primary">
                        ₱{employee.base_salary.toLocaleString()}
                        <span className="text-xs text-muted-foreground ml-1">
                          /{employee.salary_type}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog - Mobile Responsive */}
      <Dialog open={showCreateDialog || !!editingEmployee} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingEmployee(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
          </DialogHeader>
          <EmployeeForm 
            employee={editingEmployee}
            onClose={() => {
              setShowCreateDialog(false);
              setEditingEmployee(null);
            }}
            onSaved={fetchEmployees}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}