import { Link, useNavigate } from 'react-router-dom';
import { useProjects, useCreateProject, useDeleteProject } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Plus, Folder, ArrowRight, Sparkles, Search, LayoutGrid, List, Clock, SortAsc, Github } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GitHubImportModal } from "@/components/GitHubImportModal";
import { APIKeyModal, API_KEY_TYPE_KEY } from "@/components/APIKeyModal";

const Projects = () => {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [deleteProjectId, setDeleteProjectId] = useState<number | null>(null);
  const [deleteProjectName, setDeleteProjectName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGitHubImport, setShowGitHubImport] = useState(false);
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(false);
  const [pendingGitHubImport, setPendingGitHubImport] = useState(false);

  // Handle opening GitHub import with API key check
  const handleOpenGitHubImport = () => {
    const keyType = localStorage.getItem(API_KEY_TYPE_KEY);
    if (!keyType) {
      setPendingGitHubImport(true);
      setShowAPIKeyModal(true);
      return;
    }
    setShowGitHubImport(true);
  };

  // Handle API key set - continue with pending action
  const handleAPIKeySet = (key: string, type: 'demo' | 'own') => {
    setShowAPIKeyModal(false);
    if (pendingGitHubImport) {
      setPendingGitHubImport(false);
      setTimeout(() => setShowGitHubImport(true), 100);
    }
  };

  const sortedProjects = projects?.slice().sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const filteredProjects = sortedProjects?.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      return;
    }

    try {
      await createProject.mutateAsync({
        name: projectName,
        description: projectDescription || 'A new project',
      });
      setShowCreateDialog(false);
      setProjectName('');
      setProjectDescription('');
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleDeleteProject = (id: number, name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteProjectId(id);
    setDeleteProjectName(name);
  };

  const confirmDeleteProject = async () => {
    if (!deleteProjectId) return;

    try {
      await deleteProject.mutateAsync(deleteProjectId);
      toast({
        title: "Project deleted",
        description: `${deleteProjectName} has been deleted successfully.`,
      });
      setDeleteProjectId(null);
      setDeleteProjectName('');
    } catch (error: any) {
      // Check for status on ApiError (error.status) or axios error (error.response?.status)
      const status = error.status || error.response?.status;
      if (status === 404) {
        toast({
          title: "Project not found",
          description: `${deleteProjectName} may have been already deleted. Refreshing list...`,
        });
      } else if (status === 403) {
        toast({
          title: "Not authorized",
          description: "You don't have permission to delete this project.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error deleting project",
          description: error.message || "There was an error deleting the project. Please try again.",
          variant: "destructive",
        });
      }
      setDeleteProjectId(null);
      setDeleteProjectName('');
    }
  };

  const showSkeleton = isLoading && !projects;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Navbar />

      {/* Main Content - grows to push footer down */}
      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">

            {/* Header Section */}
            <div className="mb-10">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    My Projects
                  </h1>
                  <p className="text-muted-foreground">
                    {projects?.length || 0} projects in your workspace
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleOpenGitHubImport}
                    variant="outline"
                    className="rounded-full border-gray-200 hover:bg-gray-50 px-5 h-11"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    Import from GitHub
                  </Button>
                  <Button
                    onClick={() => navigate('/')}
                    className="rounded-full bg-primary hover:bg-primary/90 text-white px-6 h-11 shadow-lg shadow-primary/20"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    New Project
                  </Button>
                </div>
              </div>
            </div>

            {/* Search & Filter Bar */}
            {projects && projects.length > 0 && (
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="h-12 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Recent
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Projects Grid */}
            {showSkeleton ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                    <div className="h-44 bg-gray-100 animate-pulse" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-gray-100 rounded-lg animate-pulse w-3/4" />
                      <div className="h-4 bg-gray-50 rounded-lg animate-pulse w-full" />
                      <div className="h-3 bg-gray-50 rounded-lg animate-pulse w-1/2 mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !projects || projects.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-primary/10 flex items-center justify-center">
                    <Folder className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3 text-foreground">No projects yet</h2>
                  <p className="text-muted-foreground mb-8">
                    Create your first project and start building amazing apps with AI
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                      onClick={handleOpenGitHubImport}
                      variant="outline"
                      className="rounded-full border-gray-200 hover:bg-gray-50 px-6 h-12 w-full sm:w-auto"
                    >
                      <Github className="w-5 h-5 mr-2" />
                      Import from GitHub
                    </Button>
                    <Button
                      onClick={() => navigate('/')}
                      className="rounded-full bg-primary hover:bg-primary/90 text-white px-8 h-12 shadow-lg shadow-primary/20 w-full sm:w-auto"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create New Project
                    </Button>
                  </div>
                </div>
              </div>
            ) : filteredProjects && filteredProjects.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-foreground">No results found</h2>
                  <p className="text-muted-foreground">
                    No projects match "{searchQuery}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects?.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                    onDelete={handleDeleteProject}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create New Project</DialogTitle>
            <DialogDescription className="text-base">
              Enter the details for your new AI-powered development project
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-3">
              <Label htmlFor="name" className="text-base font-medium">Project Name</Label>
              <Input
                id="name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Awesome App"
                className="h-12 rounded-xl"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && projectName.trim()) {
                    handleCreateProject();
                  }
                }}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description" className="text-base font-medium">Description (Optional)</Label>
              <Textarea
                id="description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="A brief description of your project..."
                rows={4}
                className="resize-none rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} size="lg" className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!projectName.trim() || createProject.isPending}
              size="lg"
              className="rounded-xl bg-primary hover:bg-primary/90 text-white"
            >
              {createProject.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteProjectId !== null} onOpenChange={() => setDeleteProjectId(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">Delete Project?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This will permanently delete <strong className="text-foreground">{deleteProjectName}</strong> and all its files. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11 rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-11 rounded-xl"
            >
              {deleteProject.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* GitHub Import Modal */}
      <GitHubImportModal
        isOpen={showGitHubImport}
        onClose={() => setShowGitHubImport(false)}
      />

      {/* API Key Modal */}
      <APIKeyModal
        isOpen={showAPIKeyModal}
        onClose={() => {
          setShowAPIKeyModal(false);
          setPendingGitHubImport(false);
        }}
        onKeySet={handleAPIKeySet}
      />
    </div>
  );
};

export default Projects;
