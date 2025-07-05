import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  FileText, 
  DollarSign, 
  CheckSquare, 
  Camera, 
  MessageCircle,
  Calendar,
  User,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  type: 'transaction' | 'task' | 'memory' | 'message' | 'document' | 'event';
  title: string;
  description: string;
  date: string;
  category?: string;
  url?: string;
  metadata?: any;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (type: string, id: string) => void;
}

export default function GlobalSearch({ open, onOpenChange, onNavigate }: GlobalSearchProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (query.length >= 2) {
      performSearch(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      // Mock search results - in real implementation, this would search across all tables
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'transaction',
          title: 'Office Supplies Purchase',
          description: 'PHP 2,500 - Business Expenses',
          date: '2024-12-01',
          category: 'expense',
          metadata: { amount: 2500, currency: 'PHP' }
        },
        {
          id: '2',
          type: 'task',
          title: 'Update Website Content',
          description: 'High priority - Due Dec 15',
          date: '2024-12-15',
          category: 'high',
          metadata: { status: 'pending', priority: 'high' }
        },
        {
          id: '3',
          type: 'memory',
          title: 'Business Launch Celebration',
          description: 'Milestone: First major client contract signed',
          date: '2024-11-20',
          category: 'business',
          metadata: { tags: ['milestone', 'business', 'celebration'] }
        },
        {
          id: '4',
          type: 'document',
          title: 'Q4 Financial Report.xlsx',
          description: 'Financial Records - 1.8 MB',
          date: '2024-11-30',
          category: 'financial',
          metadata: { size: '1.8 MB', type: 'XLSX' }
        },
        {
          id: '5',
          type: 'event',
          title: 'Client Meeting - ABC Corp',
          description: 'Business meeting at 2:00 PM',
          date: '2024-12-05',
          category: 'business',
          metadata: { time: '14:00', location: 'Office' }
        }
      ];

      // Filter results based on search query
      const filteredResults = mockResults.filter(result =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'transaction': return DollarSign;
      case 'task': return CheckSquare;
      case 'memory': return Camera;
      case 'message': return MessageCircle;
      case 'document': return FileText;
      case 'event': return Calendar;
      default: return FileText;
    }
  };

  const getResultTypeColor = (type: string) => {
    switch (type) {
      case 'transaction': return 'bg-success/10 text-success';
      case 'task': return 'bg-primary/10 text-primary';
      case 'memory': return 'bg-secondary/10 text-secondary';
      case 'message': return 'bg-blue-500/10 text-blue-600';
      case 'document': return 'bg-purple-500/10 text-purple-600';
      case 'event': return 'bg-orange-500/10 text-orange-600';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        onOpenChange(false);
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onNavigate?.(result.type, result.id);
    onOpenChange(false);
    setQuery('');
  };

  const quickActions = [
    { label: 'Add Transaction', type: 'transaction', icon: DollarSign },
    { label: 'Create Task', type: 'task', icon: CheckSquare },
    { label: 'Add Memory', type: 'memory', icon: Camera },
    { label: 'New Event', type: 'event', icon: Calendar }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground mr-3" />
          <Input
            ref={inputRef}
            placeholder="Search transactions, tasks, memories, documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 focus-visible:ring-0 text-sm"
          />
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          )}
        </div>

        <ScrollArea className="max-h-[400px]">
          {query.length === 0 && (
            <div className="p-4">
              <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.type}
                      variant="ghost"
                      className="justify-start h-auto p-3"
                      onClick={() => {
                        onNavigate?.(action.type, 'new');
                        onOpenChange(false);
                      }}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {query.length >= 2 && results.length === 0 && !loading && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No results found for "{query}"</p>
              <p className="text-sm">Try searching for transactions, tasks, memories, or documents</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="p-2">
              <h4 className="text-xs font-medium text-muted-foreground px-2 py-1 mb-2">
                Search Results ({results.length})
              </h4>
              {results.map((result, index) => {
                const Icon = getResultIcon(result.type);
                const isSelected = index === selectedIndex;
                
                return (
                  <div
                    key={result.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}
                    onClick={() => handleResultClick(result)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getResultTypeColor(result.type)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium truncate">{result.title}</h4>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {result.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {result.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{result.date}</span>
                      </div>
                    </div>
                    
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
            <div className="flex items-center space-x-2">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘</kbd>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">K</kbd>
              <span>to search</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}