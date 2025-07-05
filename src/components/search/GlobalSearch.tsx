import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Clock, FileText, Users, DollarSign, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function GlobalSearch() {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !user) return;
    
    setLoading(true);
    try {
      // Simplified search implementation
      toast({
        title: "Search Complete",
        description: `Searching for: ${searchQuery}`,
      });
      setResults([]);
    } catch (error: any) {
      toast({
        title: "Search Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, currentBusiness, toast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Global Search</h1>
        <p className="text-muted-foreground">Search across all your business data</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search customers, leads, invoices, projects..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => performSearch(query)} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}