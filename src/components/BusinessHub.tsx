import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckSquare, 
  Clock, 
  Users, 
  FileText, 
  TrendingUp,
  Calendar,
  Plus,
  MoreHorizontal,
  AlertCircle,
  Star
} from "lucide-react";

const BusinessHub = () => {
  const projects = [
    {
      id: 1,
      name: "Website Redesign",
      progress: 75,
      dueDate: "2024-12-15",
      status: "In Progress",
      priority: "High",
      assignee: "Both",
      tasks: 12,
      completedTasks: 9
    },
    {
      id: 2,
      name: "Marketing Campaign",
      progress: 45,
      dueDate: "2024-12-20",
      status: "In Progress", 
      priority: "Medium",
      assignee: "Partner",
      tasks: 8,
      completedTasks: 4
    },
    {
      id: 3,
      name: "Client Proposal",
      progress: 90,
      dueDate: "2024-12-08",
      status: "Review",
      priority: "High",
      assignee: "You",
      tasks: 6,
      completedTasks: 5
    }
  ];

  const recentTasks = [
    { id: 1, title: "Update homepage design", project: "Website Redesign", priority: "High", completed: false },
    { id: 2, title: "Review marketing copy", project: "Marketing Campaign", priority: "Medium", completed: true },
    { id: 3, title: "Client meeting prep", project: "Client Proposal", priority: "High", completed: false },
    { id: 4, title: "Upload new photos", project: "Website Redesign", priority: "Low", completed: true },
    { id: 5, title: "Social media calendar", project: "Marketing Campaign", priority: "Medium", completed: false }
  ];

  const documents = [
    { name: "Business Plan 2024.pdf", lastModified: "2 hours ago", size: "2.4 MB", type: "PDF" },
    { name: "Marketing Strategy.docx", lastModified: "1 day ago", size: "890 KB", type: "DOC" },
    { name: "Client Contracts", lastModified: "3 days ago", size: "folder", type: "FOLDER" },
    { name: "Financial Reports", lastModified: "1 week ago", size: "folder", type: "FOLDER" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/30 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-display font-bold gradient-text mb-2">
                Business Hub
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your shared projects and grow your business together
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg">
                <FileText size={20} />
                New Document
              </Button>
              <Button variant="elegant" size="lg">
                <Plus size={20} />
                New Project
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="card-elegant">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center">
                    <CheckSquare className="text-white" size={24} />
                  </div>
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    +15%
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-primary mb-1">18</h3>
                <p className="text-muted-foreground text-sm">Active Tasks</p>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-secondary to-secondary-light rounded-full flex items-center justify-center">
                    <TrendingUp className="text-white" size={24} />
                  </div>
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                    3 Active
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-secondary mb-1">3</h3>
                <p className="text-muted-foreground text-sm">Projects</p>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-warning to-warning/80 rounded-full flex items-center justify-center">
                    <Clock className="text-white" size={24} />
                  </div>
                  <Badge variant="secondary" className="bg-warning/10 text-warning">
                    Due Soon
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-warning mb-1">5</h3>
                <p className="text-muted-foreground text-sm">Deadlines</p>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-success to-success/80 rounded-full flex items-center justify-center">
                    <FileText className="text-white" size={24} />
                  </div>
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    Organized
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-success mb-1">47</h3>
                <p className="text-muted-foreground text-sm">Documents</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="card-elegant">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-display mb-2">{project.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant={project.priority === 'High' ? 'destructive' : project.priority === 'Medium' ? 'default' : 'secondary'} className="text-xs">
                            {project.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal size={16} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <CheckSquare size={14} className="text-muted-foreground" />
                        <span>{project.completedTasks}/{project.tasks} tasks</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} className="text-muted-foreground" />
                        <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users size={14} className="text-muted-foreground" />
                        <span className="text-sm">{project.assignee}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card className="card-elegant">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-display">Recent Tasks</CardTitle>
                  <Button variant="outline">
                    <Plus size={16} />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                      <div className="flex-shrink-0">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          task.completed 
                            ? 'bg-success border-success' 
                            : 'border-muted-foreground'
                        }`}>
                          {task.completed && <CheckSquare className="text-white" size={12} />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-muted-foreground">{task.project}</span>
                          <Badge variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'default' : 'secondary'} className="text-xs">
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card className="card-elegant">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-display">Recent Documents</CardTitle>
                  <Button variant="outline">
                    <Plus size={16} />
                    Upload File
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="text-primary" size={20} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{doc.name}</p>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                          <span>Modified {doc.lastModified}</span>
                          <span>{doc.size}</span>
                          <Badge variant="secondary" className="text-xs">
                            {doc.type}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessHub;