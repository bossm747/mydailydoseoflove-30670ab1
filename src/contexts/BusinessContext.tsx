import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

type Business = Tables<'businesses'>;
type BusinessInsert = TablesInsert<'businesses'>;

interface BusinessMember {
  id: string;
  business_id: string;
  user_id: string;
  role: string;
  permissions: any;
  is_active: boolean;
}

interface BusinessContextType {
  currentBusiness: Business | null;
  businesses: Business[];
  businessMembers: BusinessMember[];
  setCurrentBusiness: (business: Business | null) => void;
  loadBusinesses: () => Promise<void>;
  createBusiness: (businessData: Omit<BusinessInsert, 'owner_id'>) => Promise<Business | null>;
  updateBusiness: (id: string, businessData: Partial<Business>) => Promise<void>;
  isLoading: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const useBusinessContext = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusinessContext must be used within a BusinessProvider');
  }
  return context;
};

interface BusinessProviderProps {
  children: ReactNode;
}

export const BusinessProvider: React.FC<BusinessProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessMembers, setBusinessMembers] = useState<BusinessMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadBusinesses = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load owned businesses
      const { data: ownedBusinesses, error: ownedError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('business_name');

      if (ownedError) throw ownedError;

      // Load businesses where user is a member
      const { data: membershipData, error: membershipError } = await supabase
        .from('business_members')
        .select(`
          *,
          businesses:business_id (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (membershipError) throw membershipError;

      setBusinessMembers(membershipData || []);

      const memberBusinesses = membershipData?.map(m => m.businesses).filter(Boolean) || [];
      const allBusinesses = [...(ownedBusinesses || []), ...memberBusinesses];
      
      // Remove duplicates
      const uniqueBusinesses = allBusinesses.filter((business, index, self) =>
        index === self.findIndex(b => b.id === business.id)
      );

      setBusinesses(uniqueBusinesses);

      // Set current business if none selected
      if (!currentBusiness && uniqueBusinesses.length > 0) {
        const savedBusinessId = localStorage.getItem('currentBusinessId');
        const businessToSet = savedBusinessId 
          ? uniqueBusinesses.find(b => b.id === savedBusinessId) 
          : uniqueBusinesses[0];
        
        if (businessToSet) {
          setCurrentBusiness(businessToSet);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error loading businesses",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createBusiness = async (businessData: Omit<BusinessInsert, 'owner_id'>): Promise<Business | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          ...businessData,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await loadBusinesses();
      return data;
    } catch (error: any) {
      toast({
        title: "Error creating business",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateBusiness = async (id: string, businessData: Partial<Business>) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update(businessData)
        .eq('id', id);

      if (error) throw error;

      await loadBusinesses();
      
      if (currentBusiness?.id === id) {
        setCurrentBusiness(prev => prev ? { ...prev, ...businessData } : null);
      }
    } catch (error: any) {
      toast({
        title: "Error updating business",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSetCurrentBusiness = (business: Business | null) => {
    setCurrentBusiness(business);
    if (business) {
      localStorage.setItem('currentBusinessId', business.id);
    } else {
      localStorage.removeItem('currentBusinessId');
    }
  };

  useEffect(() => {
    if (user) {
      loadBusinesses();
    }
  }, [user]);

  const value: BusinessContextType = {
    currentBusiness,
    businesses,
    businessMembers,
    setCurrentBusiness: handleSetCurrentBusiness,
    loadBusinesses,
    createBusiness,
    updateBusiness,
    isLoading,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};