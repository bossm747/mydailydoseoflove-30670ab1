import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Camera, Heart, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MemoryFormProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const commonTags = [
  'business', 'milestone', 'achievement', 'meeting', 'travel', 'celebration',
  'anniversary', 'success', 'partnership', 'growth', 'teamwork', 'innovation'
];

export default function MemoryForm({ onSuccess, trigger }: MemoryFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [memoryDate, setMemoryDate] = useState<Date>(new Date());
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    location: ''
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('memories')
        .insert([
          {
            user_id: user.id,
            title: formData.title,
            description: formData.description,
            image_url: formData.image_url || null,
            memory_date: format(memoryDate, 'yyyy-MM-dd'),
            tags: selectedTags.length > 0 ? selectedTags : null
          }
        ]);

      if (error) throw error;

      toast({
        title: "Memory archived",
        description: `${formData.title} has been added to your business memories.`,
      });

      setFormData({
        title: '',
        description: '',
        image_url: '',
        location: ''
      });
      setSelectedTags([]);
      setMemoryDate(new Date());
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error adding memory:', error);
      toast({
        title: "Failed to add memory",
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
          <Button className="btn-secondary">
            <Camera className="h-4 w-4 mr-2" />
            Add Memory
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-secondary" />
            <span>Archive Business Memory</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">Memory Title</Label>
                <Input
                  id="title"
                  placeholder="First client meeting, product launch, team celebration..."
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
                  placeholder="Describe this important business moment..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Image URL */}
              <div>
                <Label htmlFor="image_url">Image URL (Optional)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="image_url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Memory Date */}
              <div>
                <Label>Memory Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !memoryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {memoryDate ? format(memoryDate, "PPP") : <span>When did this happen?</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={memoryDate}
                      onSelect={setMemoryDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {commonTags.map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTag(tag)}
                      className="text-xs"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {selectedTags.join(', ')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="btn-secondary">
              {loading ? "Archiving..." : "Archive Memory"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}