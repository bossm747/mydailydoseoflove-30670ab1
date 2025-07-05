import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TransactionFormProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const categories = [
  'Business Expenses',
  'Office Supplies',
  'Marketing',
  'Travel',
  'Meals & Entertainment',
  'Professional Services',
  'Technology',
  'Utilities',
  'Revenue',
  'Investment',
  'Other'
];

const currencies = [
  { code: 'PHP', symbol: '₱' },
  { code: 'AED', symbol: 'د.إ' },
  { code: 'USD', symbol: '$' }
];

export default function TransactionForm({ onSuccess, trigger }: TransactionFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'PHP',
    description: '',
    category: '',
    transaction_type: 'expense',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            amount: parseFloat(formData.amount),
            description: `${formData.currency} ${formData.description}`,
            category: formData.category,
            transaction_type: formData.transaction_type,
            transaction_date: format(date, 'yyyy-MM-dd')
          }
        ]);

      if (error) throw error;

      toast({
        title: "Transaction recorded",
        description: `${formData.currency} ${formData.amount} ${formData.transaction_type} has been added.`,
      });

      setFormData({
        amount: '',
        currency: 'PHP',
        description: '',
        category: '',
        transaction_type: 'expense',
        notes: ''
      });
      setDate(new Date());
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Failed to add transaction",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span>Record Business Transaction</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Transaction Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Transaction Type</Label>
                  <Select value={formData.transaction_type} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, transaction_type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, currency: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Amount */}
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Business meeting, office supplies, client payment..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              {/* Category */}
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div>
                <Label>Transaction Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Recording..." : "Record Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}