import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BusinessForm } from './BusinessForm';
import { Building, Edit, Users, Settings, Plus } from 'lucide-react';

export default function BusinessManager() {
  const { businesses, currentBusiness, isLoading } = useBusinessContext();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Business Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your businesses and switch between different company contexts
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Business
        </Button>
      </div>

      {currentBusiness && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Current Business
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{currentBusiness.business_name}</h3>
                <div className="flex items-center space-x-2 mt-2">
                  {currentBusiness.business_type && (
                    <Badge variant="secondary">{currentBusiness.business_type}</Badge>
                  )}
                  {currentBusiness.industry && (
                    <Badge variant="outline">{currentBusiness.industry}</Badge>
                  )}
                </div>
                {currentBusiness.description && (
                  <p className="text-muted-foreground mt-2">{currentBusiness.description}</p>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditingBusiness(currentBusiness)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((business) => (
          <Card key={business.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Building className="h-5 w-5 mr-2" />
                {business.business_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  {business.business_type && (
                    <Badge variant="secondary">{business.business_type}</Badge>
                  )}
                  {business.industry && (
                    <Badge variant="outline">{business.industry}</Badge>
                  )}
                </div>
                
                {business.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {business.description}
                  </p>
                )}

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  {business.website && (
                    <span>🌐 Website</span>
                  )}
                  {business.phone && (
                    <span>📞 Phone</span>
                  )}
                  {business.email && (
                    <span>✉️ Email</span>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingBusiness(business)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {currentBusiness?.id === business.id && (
                    <Badge variant="default">Current</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {businesses.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Building className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No businesses yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first business to start managing multiple companies
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Business
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showCreateDialog || !!editingBusiness} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingBusiness(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBusiness ? 'Edit Business' : 'Create New Business'}
            </DialogTitle>
          </DialogHeader>
          <BusinessForm 
            onClose={() => {
              setShowCreateDialog(false);
              setEditingBusiness(null);
            }}
            editingBusiness={editingBusiness}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}