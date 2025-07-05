import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, FileText, DollarSign, Calendar, User, Eye, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { QuoteForm } from './QuoteForm';

interface Quote {
  id: string;
  quote_number: string;
  customer_id: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function QuoteManager() {
  const { user } = useAuth();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  useEffect(() => {
    if (user) {
      fetchQuotes();
    }
  }, [user, currentBusiness]);

  const fetchQuotes = async () => {
    try {
      let query = supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (currentBusiness) {
        query = query.eq('business_id', currentBusiness.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      setQuotes(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch quotes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuote = async (quoteData: any) => {
    try {
      if (selectedQuote) {
        const { error } = await supabase
          .from('quotes')
          .update(quoteData)
          .eq('id', selectedQuote.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Quote updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('quotes')
          .insert([{
            ...quoteData,
            user_id: user!.id,
            business_id: currentBusiness?.id || null,
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Quote created successfully",
        });
      }

      fetchQuotes();
      setIsFormOpen(false);
      setSelectedQuote(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { label: 'Draft', variant: 'outline' as const },
      'sent': { label: 'Sent', variant: 'secondary' as const },
      'accepted': { label: 'Accepted', variant: 'default' as const },
      'rejected': { label: 'Rejected', variant: 'destructive' as const },
      'expired': { label: 'Expired', variant: 'secondary' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (quote.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || quote.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalValue = filteredQuotes.reduce((sum, quote) => sum + quote.total_amount, 0);
  const acceptedQuotes = filteredQuotes.filter(quote => quote.status === 'accepted').length;
  const pendingQuotes = filteredQuotes.filter(quote => quote.status === 'sent').length;

  if (loading) {
    return <div className="flex justify-center p-8">Loading quotes...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Quote Management</h1>
        <p className="text-muted-foreground">Create and manage sales quotes and proposals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Quotes</p>
                <p className="text-2xl font-bold">{filteredQuotes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">₱{totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold">{acceptedQuotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingQuotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedQuote(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Quote
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {selectedQuote ? 'Edit Quote' : 'Create New Quote'}
              </DialogTitle>
              <DialogDescription>
                {selectedQuote ? 'Update quote details' : 'Create a new sales quote or proposal'}
              </DialogDescription>
            </DialogHeader>
            <QuoteForm
              quote={selectedQuote}
              onSave={handleSaveQuote}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quotes found</h3>
            <p className="text-muted-foreground mb-4">
              Start by creating your first sales quote
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Quote
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredQuotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{quote.quote_number}</h3>
                      {getStatusBadge(quote.status)}
                    </div>
                    <p className="text-muted-foreground">Customer ID: {quote.customer_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ₱{quote.total_amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {quote.currency}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className="text-sm">{quote.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Currency:</span>
                    <span className="text-sm">{quote.currency}</span>
                  </div>
                </div>

                {quote.notes && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {quote.notes}
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  {quote.status === 'draft' && (
                    <Button variant="outline" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedQuote(quote);
                      setIsFormOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View/Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}