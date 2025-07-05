import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import memoryImage from "@/assets/memory-gallery.jpg";
import { 
  Camera, 
  Heart, 
  Calendar, 
  MapPin, 
  Search, 
  Filter,
  Upload,
  Play,
  Share,
  Star
} from "lucide-react";

const MemoryGallery = () => {
  // Sample memories data
  const memories = [
    {
      id: 1,
      type: "photo",
      title: "First Date Anniversary",
      date: "2024-12-01",
      location: "Central Park",
      tags: ["anniversary", "romantic"],
      thumbnail: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
      isFavorite: true
    },
    {
      id: 2,
      type: "video",
      title: "Business Launch Day",
      date: "2024-11-15",
      location: "Home Office",
      tags: ["business", "milestone"],
      thumbnail: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      isFavorite: false
    },
    {
      id: 3,
      type: "photo",
      title: "Weekend Getaway",
      date: "2024-11-08",
      location: "Mountain Lodge",
      tags: ["vacation", "nature"],
      thumbnail: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
      isFavorite: true
    },
    {
      id: 4,
      type: "photo",
      title: "Cooking Together",
      date: "2024-10-25",
      location: "Our Kitchen",
      tags: ["daily-life", "fun"],
      thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
      isFavorite: false
    },
    {
      id: 5, 
      type: "photo",
      title: "Movie Night",
      date: "2024-10-20",
      location: "Living Room",
      tags: ["date-night", "cozy"],
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
      isFavorite: false
    },
    {
      id: 6,
      type: "photo", 
      title: "Coffee Date",
      date: "2024-10-15",
      location: "Favorite Café",
      tags: ["date", "coffee"],
      thumbnail: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
      isFavorite: true
    }
  ];

  const milestones = [
    { date: "2024-12-01", title: "First Date Anniversary", count: 1 },
    { date: "2024-11-01", title: "Business Launch", count: 3 },
    { date: "2024-10-01", title: "Moved In Together", count: 8 },
    { date: "2024-09-01", title: "Started Dating", count: 12 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/30 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-display font-bold gradient-text mb-2">
                Memory Gallery
              </h1>
              <p className="text-muted-foreground text-lg">
                Capturing your beautiful journey together
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg">
                <Upload size={20} />
                Upload
              </Button>
              <Button variant="coral" size="lg">
                <Camera size={20} />
                Add Memory
              </Button>
            </div>
          </div>
          
          <div className="relative h-48 rounded-2xl overflow-hidden mb-8">
            <img 
              src={memoryImage} 
              alt="Memory Gallery" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 to-primary/80 flex items-center justify-center">
              <div className="text-center text-white">
                <Heart className="mx-auto mb-3 floating-heart" size={48} />
                <h2 className="text-2xl font-display font-semibold mb-2">847 Days Together</h2>
                <p className="text-lg opacity-90">Every moment is a treasure</p>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input 
                placeholder="Search memories by title, location, or tags..." 
                className="pl-10 h-12"
              />
            </div>
            <Button variant="outline" size="lg">
              <Filter size={20} />
              Filter
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-elegant text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gradient-to-r from-secondary to-secondary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-secondary mb-2">156</h3>
              <p className="text-muted-foreground">Total Memories</p>
            </CardContent>
          </Card>

          <Card className="card-elegant text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gradient-to-r from-warning to-warning/80 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-warning mb-2">23</h3>
              <p className="text-muted-foreground">Favorites</p>
            </CardContent>
          </Card>

          <Card className="card-elegant text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">15</h3>
              <p className="text-muted-foreground">Locations</p>
            </CardContent>
          </Card>

          <Card className="card-elegant text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gradient-to-r from-success to-success/80 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-success mb-2">12</h3>
              <p className="text-muted-foreground">This Month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Memory Grid */}
          <div className="lg:col-span-3">
            <Card className="card-elegant">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-display">Recent Memories</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Grid</Button>
                    <Button variant="ghost" size="sm">Timeline</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {memories.map((memory) => (
                    <div key={memory.id} className="group relative">
                      <Card className="overflow-hidden hover:shadow-medium transition-all duration-300 hover:scale-[1.02]">
                        <div className="relative aspect-square">
                          <img 
                            src={memory.thumbnail} 
                            alt={memory.title}
                            className="w-full h-full object-cover"
                          />
                          {memory.type === "video" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                <Play className="text-primary ml-1" size={20} />
                              </div>
                            </div>
                          )}
                          {memory.isFavorite && (
                            <div className="absolute top-3 right-3">
                              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                                <Heart className="text-white fill-current" size={16} />
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className="flex justify-between items-end">
                                <div className="text-white">
                                  <h4 className="font-semibold text-sm mb-1">{memory.title}</h4>
                                  <div className="flex items-center text-xs opacity-90">
                                    <MapPin size={12} className="mr-1" />
                                    {memory.location}
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                                  <Share size={16} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">
                              {new Date(memory.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {memory.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Button variant="outline" size="lg">
                    Load More Memories
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Sidebar */}
          <div>
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="text-xl font-display">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="relative">
                      {index !== milestones.length - 1 && (
                        <div className="absolute left-4 top-8 w-0.5 h-12 bg-border"></div>
                      )}
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-secondary to-secondary-light rounded-full flex items-center justify-center flex-shrink-0">
                          <Heart className="text-white" size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{milestone.title}</p>
                          <p className="text-xs text-muted-foreground mb-1">
                            {new Date(milestone.date).toLocaleDateString()}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {milestone.count} memories
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-6">
                  View Full Timeline
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="card-elegant mt-6">
              <CardHeader>
                <CardTitle className="text-lg font-display">This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">New memories</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Favorites added</span>
                  <span className="font-semibold">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Locations visited</span>
                  <span className="font-semibold">3</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryGallery;