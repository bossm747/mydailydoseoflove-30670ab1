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
  Calendar, 
  Plus, 
  Search, 
  Users,
  Clock,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { LeaveRequestForm } from './LeaveRequestForm';

interface LeaveType {
  id: string;
  business_id?: string;
  user_id: string;
  leave_name: string;
  leave_code: string;
  days_allowed: number;
  carry_forward: boolean;
  requires_approval: boolean;
  is_paid: boolean;
  is_active: boolean;
}

interface LeaveRequest {
  id: string;
  business_id?: string;
  user_id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason?: string;
  status: string;
  applied_at?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_reason?: string;
  created_at: string;
  employee?: {
    first_name: string;
    last_name: string;
    employee_id: string;
  } | null;
  leave_type?: {
    leave_name: string;
    leave_code: string;
  } | null;
}

export default function LeaveManager() {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);
  const [activeTab, setActiveTab] = useState('requests');

  const fetchLeaveTypes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('leave_types')
        .select('*')
        .or(`business_id.eq.${currentBusiness?.id || 'null'},business_id.is.null`)
        .eq('is_active', true)
        .order('leave_name');

      if (error) throw error;
      setLeaveTypes(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching leave types",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchLeaveRequests = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          employee:employees(first_name, last_name, employee_id),
          leave_type:leave_types(leave_name, leave_code)
        `)
        .eq('business_id', currentBusiness?.id || null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeaveRequests((data as unknown as LeaveRequest[]) || []);
    } catch (error: any) {
      toast({
        title: "Error fetching leave requests",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
    fetchLeaveRequests();
  }, [user, currentBusiness]);

  const filteredRequests = leaveRequests.filter(request => 
    searchTerm === '' || 
    request.employee?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.employee?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.employee?.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.leave_type?.leave_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      default: return AlertCircle;
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Leave request approved",
        description: "The leave request has been approved successfully.",
      });

      fetchLeaveRequests();
    } catch (error: any) {
      toast({
        title: "Error approving request",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: 'rejected',
          rejected_reason: reason,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Leave request rejected",
        description: "The leave request has been rejected.",
      });

      fetchLeaveRequests();
    } catch (error: any) {
      toast({
        title: "Error rejecting request",
        description: error.message,
        variant: "destructive",
      });
    }
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
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Leave Management</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Manage employee leave requests and approvals
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Leave Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-lg sm:text-2xl font-bold">{leaveRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {leaveRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {leaveRequests.filter(r => r.status === 'approved').length}
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
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Leave Types</p>
                <p className="text-lg sm:text-2xl font-bold">{leaveTypes.length}</p>
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
            placeholder="Search leave requests..."
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
            <TabsTrigger value="requests" className="text-xs sm:text-sm">
              Leave Requests ({leaveRequests.length})
            </TabsTrigger>
            <TabsTrigger value="types" className="text-xs sm:text-sm">
              Leave Types ({leaveTypes.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="requests" className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 sm:py-12">
                <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No leave requests found</h3>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by creating your first leave request'}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Leave Request
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const StatusIcon = getStatusIcon(request.status);
                return (
                  <Card key={request.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="h-4 w-4" />
                            <h4 className="font-medium">
                              {request.employee?.first_name} {request.employee?.last_name}
                            </h4>
                            <Badge variant={getStatusColor(request.status)} className="text-xs">
                              {request.status}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>
                              <span className="font-medium">Leave Type:</span> {request.leave_type?.leave_name} ({request.leave_type?.leave_code})
                            </div>
                            <div>
                              <span className="font-medium">Duration:</span> {request.days_requested} day(s)
                            </div>
                            <div>
                              <span className="font-medium">Dates:</span> {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                            </div>
                            {request.reason && (
                              <div>
                                <span className="font-medium">Reason:</span> {request.reason}
                              </div>
                            )}
                          </div>
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleApproveRequest(request.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRejectRequest(request.id, 'Rejected by manager')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {leaveTypes.map((type) => (
              <Card key={type.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center justify-between">
                    <span className="truncate">{type.leave_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {type.leave_code}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Days Allowed:</span>
                      <span className="font-medium">{type.days_allowed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Paid Leave:</span>
                      <span className={type.is_paid ? "text-green-600" : "text-red-600"}>
                        {type.is_paid ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Requires Approval:</span>
                      <span className={type.requires_approval ? "text-yellow-600" : "text-green-600"}>
                        {type.requires_approval ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carry Forward:</span>
                      <span className={type.carry_forward ? "text-green-600" : "text-red-600"}>
                        {type.carry_forward ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <Dialog open={showCreateDialog || !!editingRequest} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingRequest(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingRequest ? 'Edit Leave Request' : 'Create New Leave Request'}
            </DialogTitle>
          </DialogHeader>
          <LeaveRequestForm 
            request={editingRequest}
            leaveTypes={leaveTypes}
            onClose={() => {
              setShowCreateDialog(false);
              setEditingRequest(null);
            }}
            onSaved={fetchLeaveRequests}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}