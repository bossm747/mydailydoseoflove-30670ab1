import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Smile, Frown, Meh, Sun, Moon, Coffee, MapPin } from 'lucide-react';

const MOODS = [
  { value: 'happy', label: 'Happy', emoji: '😊', color: 'bg-yellow-100 text-yellow-800', icon: Smile },
  { value: 'excited', label: 'Excited', emoji: '🤩', color: 'bg-orange-100 text-orange-800', icon: Sun },
  { value: 'calm', label: 'Calm', emoji: '😌', color: 'bg-blue-100 text-blue-800', icon: Moon },
  { value: 'romantic', label: 'Romantic', emoji: '😍', color: 'bg-pink-100 text-pink-800', icon: Heart },
  { value: 'stressed', label: 'Stressed', emoji: '😤', color: 'bg-red-100 text-red-800', icon: Frown },
  { value: 'tired', label: 'Tired', emoji: '😴', color: 'bg-gray-100 text-gray-800', icon: Coffee },
  { value: 'grateful', label: 'Grateful', emoji: '🙏', color: 'bg-green-100 text-green-800', icon: Heart },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'bg-gray-100 text-gray-800', icon: Meh }
];

interface MoodShare {
  id: string;
  user_id: string;
  mood: string;
  intensity: number;
  note?: string;
  location?: string;
  is_private: boolean;
  created_at: string;
  profiles?: { first_name: string };
}

export default function MoodSharing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [moodShares, setMoodShares] = useState<MoodShare[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMoodShares = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('mood_shares')
      .select(`
        *,
        profiles(first_name)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      toast({
        title: "Error fetching mood shares",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setMoodShares(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMoodShares();
  }, [user]);

  const handleMoodShare = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const moodData = {
      user_id: user.id,
      mood: formData.get('mood') as string,
      intensity: parseInt(formData.get('intensity') as string),
      note: formData.get('note') as string || null,
      location: formData.get('location') as string || null,
      is_private: formData.get('is_private') === 'on',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    const { error } = await supabase
      .from('mood_shares')
      .insert([moodData]);

    if (error) {
      toast({
        title: "Error sharing mood",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Mood shared",
        description: "Your mood has been shared successfully.",
      });
      fetchMoodShares();
      (e.target as HTMLFormElement).reset();
    }
  };

  const getMoodData = (mood: string) => MOODS.find(m => m.value === mood) || MOODS[7];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2" />
            Share Your Mood
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMoodShare} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mood">Current Mood</Label>
                <Select name="mood" required>
                  <SelectTrigger>
                    <SelectValue placeholder="How are you feeling?" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOODS.map((mood) => (
                      <SelectItem key={mood.value} value={mood.value}>
                        <div className="flex items-center space-x-2">
                          <span>{mood.emoji}</span>
                          <span>{mood.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="intensity">Intensity (1-10)</Label>
                <Input
                  id="intensity"
                  name="intensity"
                  type="number"
                  min="1"
                  max="10"
                  defaultValue="5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">Location (optional)</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Where are you?"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_private"
                  name="is_private"
                  className="rounded"
                />
                <Label htmlFor="is_private">Keep private</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                name="note"
                placeholder="What's on your mind?"
                rows={2}
              />
            </div>

            <Button type="submit" className="w-full">Share Mood</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Mood Shares</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : moodShares.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No mood shares yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {moodShares.map((share) => {
                const moodData = getMoodData(share.mood);
                return (
                  <Card key={share.id} className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{moodData.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={moodData.color}>
                            {moodData.label}
                          </Badge>
                          <Badge variant="outline">
                            Intensity: {share.intensity}/10
                          </Badge>
                          {share.is_private && (
                            <Badge variant="outline">Private</Badge>
                          )}
                        </div>
                        
                        {share.note && (
                          <p className="text-sm mb-2">{share.note}</p>
                        )}
                        
                        <div className="flex items-center text-xs text-muted-foreground space-x-4">
                          <span>{new Date(share.created_at).toLocaleString()}</span>
                          {share.location && (
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {share.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}