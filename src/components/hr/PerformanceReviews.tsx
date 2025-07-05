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
  Star, 
  Plus, 
  Search, 
  Users,
  Filter,
  Calendar,
  Award,
  TrendingUp
} from 'lucide-react';

interface PerformanceReview {
  id: string;
  business_id?: string;
  user_id: string;
  employee_id: string;
  reviewer_id: string;
  review_period_start: string;
  review_period_end: string;
  review_type: string;
  overall_rating?: number;
  goals_met: any;
  strengths?: string;
  areas_for_improvement?: string;
  development_goals?: string;
  manager_comments?: string;
  employee_comments?: string;
  status: string;
  completed_at?: string;
  created_at: string;
  employee?: {
    first_name: string;
    last_name: string;
    employee_id: string;
  } | null;
  reviewer?: {
    first_name: string;
    last_name: string;
  } | null;
}

export default function PerformanceReviews() {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingReview, setEditingReview] = useState<PerformanceReview | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchReviews = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('performance_reviews')
        .select(`
          *,
          employee:employees!performance_reviews_employee_id_fkey(first_name, last_name, employee_id),
          reviewer:employees!performance_reviews_reviewer_id_fkey(first_name, last_name)
        `)
        .eq('business_id', currentBusiness?.id || null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews((data as unknown as PerformanceReview[]) || []);
    } catch (error: any) {
      toast({
        title: "Error fetching performance reviews",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [user, currentBusiness]);

  const filteredReviews = reviews.filter(review => 
    searchTerm === '' || 
    review.employee?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.employee?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.employee?.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.review_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'draft': return 'secondary';
      case 'in_progress': return 'outline';
      default: return 'secondary';
    }
  };

  const getRatingStars = (rating?: number) => {
    if (!rating) return null;
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
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
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Performance Reviews</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Manage employee performance evaluations and feedback
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Review
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Award className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Reviews</p>
                <p className="text-lg sm:text-2xl font-bold">{reviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {reviews.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {reviews.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {reviews.length > 0 
                    ? (reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / reviews.length).toFixed(1)
                    : '0.0'
                  }
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
            placeholder="Search performance reviews..."
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
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All Reviews ({reviews.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm">
              Completed ({reviews.filter(r => r.status === 'completed').length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm">
              Pending ({reviews.filter(r => r.status === 'draft' || r.status === 'in_progress').length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredReviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 sm:py-12">
                <Award className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No performance reviews found</h3>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by creating your first performance review'}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Review
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredReviews.map((review) => (
                <Card 
                  key={review.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setEditingReview(review)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                      <div className="truncate font-semibold">
                        {review.employee?.first_name} {review.employee?.last_name}
                      </div>
                      <Badge variant={getStatusColor(review.status)} className="text-xs">
                        {review.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="capitalize">{review.review_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Period:</span>
                        <span>{new Date(review.review_period_start).toLocaleDateString()} - {new Date(review.review_period_end).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reviewer:</span>
                        <span>{review.reviewer?.first_name} {review.reviewer?.last_name}</span>
                      </div>
                    </div>
                    
                    {review.overall_rating && (
                      <div className="border-t pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Rating:</span>
                          <div className="flex space-x-1">
                            {getRatingStars(review.overall_rating)}
                          </div>
                        </div>
                      </div>
                    )}

                    {review.completed_at && (
                      <div className="text-xs text-muted-foreground">
                        Completed: {new Date(review.completed_at).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog - Placeholder for now */}
      <Dialog open={showCreateDialog || !!editingReview} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingReview(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingReview ? 'View Performance Review' : 'Create New Performance Review'}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center text-muted-foreground">
            Performance review form will be implemented here.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}