import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Github, GitBranch, Lock, Unlock, Loader2, AlertCircle,
  CheckCircle2, FolderGit2, Key, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { projectApi } from '@/services/api';

interface GitHubImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const GitHubImportModal: React.FC<GitHubImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract repo name from URL for preview
  const getRepoInfo = () => {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
      return { owner: match[1], name: match[2].replace('.git', '') };
    }
    return null;
  };

  const repoInfo = getRepoInfo();

  const handleImport = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    if (isPrivate && !githubToken.trim()) {
      setError('Please enter a GitHub token for private repositories');
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const result = await projectApi.importFromGitHub({
        repo_url: repoUrl.trim(),
        branch: branch.trim() || undefined,
        project_name: projectName.trim() || undefined,
        github_token: isPrivate ? githubToken.trim() : undefined,
      });

      if (result.success && result.project) {
        toast({
          title: "Import Successful!",
          description: `Imported ${result.files_count} files from ${repoInfo?.owner}/${repoInfo?.name}`,
        });

        onSuccess?.();
        onClose();

        // Navigate to the new project
        navigate(`/editor/${result.project.id}`);
      } else {
        setError(result.message || 'Failed to import repository');
      }
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to import repository');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    if (!isImporting) {
      setRepoUrl('');
      setBranch('');
      setProjectName('');
      setIsPrivate(false);
      setGithubToken('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Github className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Import from GitHub</h2>
                <p className="text-xs text-gray-400">Clone an existing repository</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isImporting}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Repository URL */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-muted-foreground" />
              Repository URL
            </Label>
            <Input
              value={repoUrl}
              onChange={(e) => {
                setRepoUrl(e.target.value);
                setError(null);
              }}
              placeholder="https://github.com/username/repository"
              className="h-11"
              disabled={isImporting}
            />
            {repoInfo && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                Will clone: <span className="font-medium">{repoInfo.owner}/{repoInfo.name}</span>
              </p>
            )}
          </div>

          {/* Branch */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-muted-foreground" />
              Branch
              <span className="text-xs text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main (default)"
              className="h-10"
              disabled={isImporting}
            />
          </div>

          {/* Project Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Project Name
              <span className="text-xs text-muted-foreground font-normal ml-2">(optional)</span>
            </Label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder={repoInfo?.name || "Use repository name"}
              className="h-10"
              disabled={isImporting}
            />
          </div>

          {/* Private Repository Toggle */}
          <div className="space-y-3">
            <button
              onClick={() => setIsPrivate(!isPrivate)}
              disabled={isImporting}
              className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                isPrivate
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
                  : 'border-muted hover:border-muted-foreground/30'
              }`}
            >
              <div className="flex items-center gap-3">
                {isPrivate ? (
                  <Lock className="w-5 h-5 text-amber-600" />
                ) : (
                  <Unlock className="w-5 h-5 text-muted-foreground" />
                )}
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {isPrivate ? 'Private Repository' : 'Public Repository'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isPrivate ? 'Requires GitHub token' : 'No authentication needed'}
                  </p>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors ${
                isPrivate ? 'bg-amber-500' : 'bg-muted'
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform mt-0.5 ${
                  isPrivate ? 'translate-x-4.5 ml-0.5' : 'translate-x-0.5'
                }`} />
              </div>
            </button>

            {/* GitHub Token Input */}
            {isPrivate && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-600" />
                  GitHub Personal Access Token
                </Label>
                <Input
                  type="password"
                  value={githubToken}
                  onChange={(e) => {
                    setGithubToken(e.target.value);
                    setError(null);
                  }}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="h-10 font-mono text-sm"
                  disabled={isImporting}
                />
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=ArtReal%20Import"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 hover:underline"
                >
                  Generate a new token
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Info Box */}
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <span className="font-medium">Note:</span> The repository will be cloned and you can edit it in ArtReal.
              npm install will run automatically when you preview the project.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/30 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClose}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white gap-2"
            onClick={handleImport}
            disabled={isImporting || !repoUrl.trim()}
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Github className="w-4 h-4" />
                Import Repository
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GitHubImportModal;
