import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Share, 
  MoreHorizontal,
  Folder,
  Star,
  Clock,
  User,
  Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Document {
  id: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'XLSX' | 'PNG' | 'JPG' | 'OTHER';
  size: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  lastModified: string;
  isStarred: boolean;
  url?: string;
  description?: string;
  tags: string[];
}

interface Folder {
  id: string;
  name: string;
  documentCount: number;
  createdAt: string;
}

export default function DocumentManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    name: '',
    category: '',
    description: '',
    tags: [] as string[]
  });

  const categories = [
    'Business Documents',
    'Financial Records',
    'Contracts & Agreements',
    'Marketing Materials',
    'Reports & Analytics',
    'Legal Documents',
    'Personal Documents',
    'Other'
  ];

  const mockDocuments: Document[] = [
    {
      id: '1',
      name: 'Business Plan 2024.pdf',
      type: 'PDF',
      size: '2.4 MB',
      category: 'Business Documents',
      uploadedBy: 'Marc',
      uploadedAt: '2024-12-01',
      lastModified: '2024-12-01',
      isStarred: true,
      description: 'Comprehensive business plan for 2024 operations',
      tags: ['business', 'planning', '2024']
    },
    {
      id: '2',
      name: 'Q4 Financial Report.xlsx',
      type: 'XLSX',
      size: '1.8 MB',
      category: 'Financial Records',
      uploadedBy: 'Lyn',
      uploadedAt: '2024-11-30',
      lastModified: '2024-12-02',
      isStarred: false,
      description: 'Fourth quarter financial analysis and projections',
      tags: ['finance', 'Q4', 'report']
    },
    {
      id: '3',
      name: 'Client Contract - ABC Corp.docx',
      type: 'DOCX',
      size: '890 KB',
      category: 'Contracts & Agreements',
      uploadedBy: 'Marc',
      uploadedAt: '2024-11-28',
      lastModified: '2024-11-29',
      isStarred: true,
      description: 'Service agreement with ABC Corporation',
      tags: ['contract', 'client', 'ABC']
    },
    {
      id: '4',
      name: 'Marketing Strategy.pdf',
      type: 'PDF',
      size: '3.2 MB',
      category: 'Marketing Materials',
      uploadedBy: 'Lyn',
      uploadedAt: '2024-11-25',
      lastModified: '2024-11-26',
      isStarred: false,
      description: 'Digital marketing strategy for 2024',
      tags: ['marketing', 'strategy', 'digital']
    }
  ];

  const mockFolders: Folder[] = [
    { id: '1', name: 'Financial Records', documentCount: 12, createdAt: '2024-01-15' },
    { id: '2', name: 'Client Contracts', documentCount: 8, createdAt: '2024-02-01' },
    { id: '3', name: 'Marketing Assets', documentCount: 15, createdAt: '2024-03-10' },
    { id: '4', name: 'Legal Documents', documentCount: 5, createdAt: '2024-04-05' }
  ];

  useEffect(() => {
    setDocuments(mockDocuments);
    setFolders(mockFolders);
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In real implementation, this would handle file upload to Supabase Storage
      const newDocument: Document = {
        id: Date.now().toString(),
        name: uploadForm.name,
        type: 'PDF',
        size: '1.2 MB',
        category: uploadForm.category,
        uploadedBy: user?.user_metadata?.first_name || 'User',
        uploadedAt: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        isStarred: false,
        description: uploadForm.description,
        tags: uploadForm.tags
      };

      setDocuments(prev => [newDocument, ...prev]);
      
      toast({
        title: "Document uploaded",
        description: `${uploadForm.name} has been uploaded successfully.`,
      });

      setUploadForm({ name: '', category: '', description: '', tags: [] });
      setShowUploadDialog(false);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleStar = (docId: string) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === docId ? { ...doc, isStarred: !doc.isStarred } : doc
      )
    );
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF': return '📄';
      case 'DOCX': return '📝';
      case 'XLSX': return '📊';
      case 'PNG':
      case 'JPG': return '🖼️';
      default: return '📁';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold gradient-text">Document Manager</h2>
          <p className="text-muted-foreground">Organize and manage your business documents</p>
        </div>
        
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5 text-primary" />
                <span>Upload New Document</span>
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="doc-name">Document Name</Label>
                <Input
                  id="doc-name"
                  placeholder="Business Plan 2024.pdf"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select value={uploadForm.category} onValueChange={(value) => 
                  setUploadForm(prev => ({ ...prev, category: value }))
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

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the document..."
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Uploading..." : "Upload Document"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input 
            placeholder="Search documents by name, description, or tags..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex space-x-2">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Folders */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Folder className="h-5 w-5 text-primary" />
            <span>Folders</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <div key={folder.id} className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <Folder className="h-8 w-8 text-primary" />
                  <div>
                    <h4 className="font-medium text-sm">{folder.name}</h4>
                    <p className="text-xs text-muted-foreground">{folder.documentCount} documents</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card className="card-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-secondary" />
              <span>Documents ({filteredDocuments.length})</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getFileIcon(doc.type)}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{doc.name}</h4>
                          <p className="text-xs text-muted-foreground">{doc.size}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStar(doc.id)}
                        className="p-1"
                      >
                        <Star className={`h-4 w-4 ${doc.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Badge variant="secondary" className="text-xs">
                        {doc.category}
                      </Badge>
                      
                      {doc.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>By {doc.uploadedBy}</span>
                        <span>{format(new Date(doc.uploadedAt), 'MMM d')}</span>
                      </div>
                      
                      <div className="flex space-x-1 pt-2">
                        <Button variant="ghost" size="sm" className="p-1">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-1">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-1">
                          <Share className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-1">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <span className="text-xl">{getFileIcon(doc.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{doc.name}</h4>
                      {doc.isStarred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{doc.size}</span>
                      <Badge variant="secondary" className="text-xs">{doc.category}</Badge>
                      <span>By {doc.uploadedBy}</span>
                      <span>{format(new Date(doc.uploadedAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}