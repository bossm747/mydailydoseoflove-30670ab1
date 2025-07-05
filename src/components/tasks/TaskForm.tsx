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
import { CalendarIcon, Plus, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TaskFormProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-muted' },
  { value: 'medium', label: 'Medium', color: 'bg-warning' },
  { value: 'high', label: 'High', color: 'bg-destructive' }
];

const statuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

export default function TaskForm({ onSuccess, trigger }: TaskFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dueDate, setDueDate] = useState<Date>();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    assigned_to: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .insert([
          {
            user_id: user.id,
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            status: formData.status,
            assigned_to: formData.assigned_to || user.id,
            due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null
          }
        ]);

      if (error) throw error;

      toast({
        title: "Task created",
        description: `${formData.title} has been added to your business tasks.`,
      });

      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        assigned_to: ''
      });
      setDueDate(undefined);
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Failed to create task",
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
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <span>Create Business Task</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="Update website, prepare proposal, client meeting..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of the task requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, priority: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${priority.color}`}></div>
                            <span>{priority.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <Label>Due Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : <span>Set due date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
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
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}