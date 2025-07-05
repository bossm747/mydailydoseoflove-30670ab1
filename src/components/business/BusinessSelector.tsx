import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building, ChevronDown, Plus } from 'lucide-react';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BusinessForm } from './BusinessForm';
import { useState } from 'react';

export const BusinessSelector: React.FC = () => {
  const { currentBusiness, businesses, setCurrentBusiness } = useBusinessContext();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center space-x-2 min-w-[200px] justify-between bg-background/80 backdrop-blur-sm border-border/50"
          >
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4" />
              <span className="truncate">
                {currentBusiness ? currentBusiness.business_name : 'Personal'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[250px] bg-background/95 backdrop-blur-sm border-border/50">
          <DropdownMenuLabel>Select Business</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setCurrentBusiness(null)}>
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 opacity-60" />
              <span>Personal</span>
            </div>
          </DropdownMenuItem>
          
          {businesses.map((business) => (
            <DropdownMenuItem 
              key={business.id}
              onClick={() => setCurrentBusiness(business)}
              className={currentBusiness?.id === business.id ? 'bg-accent' : ''}
            >
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">{business.business_name}</div>
                  {business.business_type && (
                    <div className="text-xs text-muted-foreground">{business.business_type}</div>
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
            <div className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create New Business</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Business</DialogTitle>
          </DialogHeader>
          <BusinessForm onClose={() => setShowCreateDialog(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};