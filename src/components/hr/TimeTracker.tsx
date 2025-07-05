import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, 
  Play, 
  Square, 
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  PauseCircle
} from 'lucide-react';
import { format, differenceInHours, parseISO } from 'date-fns';

interface TimeEntry {
  id: string;
  business_id?: string;
  user_id: string;
  employee_id: string;
  entry_date: string;
  clock_in?: string;
  clock_out?: string;
  break_duration: number;
  total_hours: number;
  overtime_hours: number;
  entry_type: string;
  status: string;
  notes?: string;
  location?: any;
  created_at: string;
  employees?: Employee;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  job_title: string;
}

export default function TimeTracker() {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTimeEntries = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('business_id', currentBusiness?.id || null)
        .order('entry_date', { ascending: false })
        .order('clock_in', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Fetch employee details separately to avoid join issues
      const entriesWithEmployees = await Promise.all(
        (data || []).map(async (entry) => {
          const { data: employee } = await supabase
            .from('employees')
            .select('id, first_name, last_name, employee_id, job_title')
            .eq('id', entry.employee_id)
            .single();
          
          return { ...entry, employees: employee };
        })
      );
      
      setTimeEntries(entriesWithEmployees);
    } catch (error: any) {
      toast({
        title: "Error fetching time entries",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, employee_id, job_title')
        .eq('business_id', currentBusiness?.id || null)
        .eq('employment_status', 'active')
        .order('first_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching employees",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTimeEntries();
    fetchEmployees();
  }, [user, currentBusiness]);

  const clockIn = async (employeeId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if employee already clocked in today
      const { data: existingEntry } = await supabase
        .from('time_entries')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('entry_date', today)
        .single();

      if (existingEntry && !existingEntry.clock_out) {
        toast({
          title: "Already clocked in",
          description: "Employee is already clocked in for today.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('time_entries')
        .insert([{
          business_id: currentBusiness?.id || null,
          user_id: user!.id,
          employee_id: employeeId,
          entry_date: today,
          clock_in: new Date().toISOString(),
          entry_type: 'regular',
          status: 'pending',
        }]);

      if (error) throw error;

      toast({
        title: "Clocked in",
        description: "Employee has been clocked in successfully.",
      });

      fetchTimeEntries();
    } catch (error: any) {
      toast({
        title: "Error clocking in",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const clockOut = async (entryId: string) => {
    try {
      const entry = timeEntries.find(e => e.id === entryId);
      if (!entry || !entry.clock_in) return;

      const clockInTime = parseISO(entry.clock_in);
      const clockOutTime = new Date();
      const totalHours = differenceInHours(clockOutTime, clockInTime) - (entry.break_duration / 60);
      const overtimeHours = Math.max(0, totalHours - 8); // Assuming 8 hour work day

      const { error } = await supabase
        .from('time_entries')
        .update({
          clock_out: clockOutTime.toISOString(),
          total_hours: totalHours,
          overtime_hours: overtimeHours,
        })
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: "Clocked out",
        description: "Employee has been clocked out successfully.",
      });

      fetchTimeEntries();
    } catch (error: any) {
      toast({
        title: "Error clocking out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string, clockOut?: string) => {
    if (!clockOut) return 'default'; // Currently clocked in
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getWorkingTime = (clockIn: string) => {
    const startTime = parseISO(clockIn);
    const duration = differenceInHours(currentTime, startTime);
    const hours = Math.floor(duration);
    const minutes = Math.floor((duration - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  const todayEntries = timeEntries.filter(entry => 
    entry.entry_date === new Date().toISOString().split('T')[0]
  );

  const pendingEntries = timeEntries.filter(entry => entry.status === 'pending');
  const activeClockIns = timeEntries.filter(entry => entry.clock_in && !entry.clock_out);

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
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Time Tracker</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Track employee attendance and working hours
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-bold">
            {format(currentTime, 'HH:mm:ss')}
          </div>
          <div className="text-sm text-muted-foreground">
            {format(currentTime, 'EEEE, MMMM d, yyyy')}
          </div>
        </div>
      </div>

      {/* Stats Cards - Mobile Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-lg sm:text-2xl font-bold">{activeClockIns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Today</p>
                <p className="text-lg sm:text-2xl font-bold">{todayEntries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <PauseCircle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-lg sm:text-2xl font-bold">{pendingEntries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {timeEntries.filter(e => e.status === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Clock In/Out for Active Employees */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Quick Clock In/Out</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {employees.map((employee) => {
              const todayEntry = todayEntries.find(e => e.employee_id === employee.id);
              const isActive = todayEntry && todayEntry.clock_in && !todayEntry.clock_out;
              
              return (
                <div key={employee.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate text-sm sm:text-base">
                      {employee.first_name} {employee.last_name}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground truncate">
                      {employee.job_title}
                    </div>
                    {isActive && todayEntry?.clock_in && (
                      <div className="text-xs text-primary font-medium">
                        Working: {getWorkingTime(todayEntry.clock_in)}
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    {isActive ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => clockOut(todayEntry.id)}
                        className="text-xs sm:text-sm"
                      >
                        <Square className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Out
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => clockIn(employee.id)}
                        className="text-xs sm:text-sm"
                        disabled={!!todayEntry && !todayEntry.clock_out}
                      >
                        <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        In
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Entries */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="today" className="text-xs sm:text-sm">
              Today ({todayEntries.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm">
              Active ({activeClockIns.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm">
              Pending ({pendingEntries.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All ({timeEntries.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          {(activeTab === 'today' ? todayEntries :
            activeTab === 'active' ? activeClockIns :
            activeTab === 'pending' ? pendingEntries :
            timeEntries).length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 sm:py-12">
                <Clock className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No time entries found</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  {activeTab === 'today' ? 'No entries for today yet' : 
                   activeTab === 'active' ? 'No active clock-ins' :
                   activeTab === 'pending' ? 'No pending entries' :
                   'No time entries recorded'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {(activeTab === 'today' ? todayEntries :
                activeTab === 'active' ? activeClockIns :
                activeTab === 'pending' ? pendingEntries :
                timeEntries).map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate text-sm sm:text-base">
                              {entry.employees ? 
                                `${entry.employees.first_name} ${entry.employees.last_name}` :
                                'Unknown Employee'
                              }
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground truncate">
                              {entry.employees?.job_title} • {entry.employees?.employee_id}
                            </div>
                          </div>
                          <Badge variant={getStatusColor(entry.status, entry.clock_out)} className="text-xs">
                            {entry.clock_out ? entry.status : 'Active'}
                          </Badge>
                        </div>
                        
                        <div className="mt-2 sm:mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <span className="text-muted-foreground">Date:</span>
                            <div className="font-medium">
                              {format(parseISO(entry.entry_date), 'MMM d')}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Clock In:</span>
                            <div className="font-medium">
                              {entry.clock_in ? format(parseISO(entry.clock_in), 'HH:mm') : '-'}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Clock Out:</span>
                            <div className="font-medium">
                              {entry.clock_out ? format(parseISO(entry.clock_out), 'HH:mm') : 
                               entry.clock_in ? getWorkingTime(entry.clock_in) : '-'}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total:</span>
                            <div className="font-medium">
                              {entry.total_hours ? `${entry.total_hours.toFixed(1)}h` : '-'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {!entry.clock_out && entry.clock_in && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => clockOut(entry.id)}
                          className="w-full sm:w-auto"
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Clock Out
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}