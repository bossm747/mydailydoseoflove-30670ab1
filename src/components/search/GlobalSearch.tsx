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
      // Search across indexed content
      const { data, error } = await supabase
        .from('search_indexes')
        .select('*')
        .eq('user_id', user.id)
        .textSearch('search_vector', searchQuery)
        .limit(20);

      if (error) throw error;

      setResults(data || []);
      
      toast({
        title: "Search Complete",
        description: `Found ${data?.length || 0} results for: ${searchQuery}`,
      });
    } catch (error: any) {
      toast({
        title: "Search Error",
        description: error.message,
        variant: "destructive",
      });
      setResults([]);
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

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>{results.length} results found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result: any) => (
                <div key={result.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">{result.title}</h3>
                    <Badge variant="outline">{result.record_type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {result.content.substring(0, 200)}...
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{result.table_name}</span>
                    <span>•</span>
                    <span>{new Date(result.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}