import { useState, useEffect } from 'react';
import { X, GitBranch, Calendar, User, Hash, RotateCcw, AlertTriangle, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/services/api';

interface GitCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
}

interface GitHistoryModalProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
}

interface RestoreConfirmProps {
  commit: GitCommit | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isRestoring: boolean;
}

const RestoreConfirmDialog: React.FC<RestoreConfirmProps> = ({ commit, isOpen, onConfirm, onCancel, isRestoring }) => {
  if (!isOpen || !commit) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header with icon */}
        <div className="flex flex-col items-center pt-6 pb-4 px-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
            <History className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
            Restore Version
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Are you sure you want to restore?
          </p>
        </div>

        {/* Commit Info Card */}
        <div className="px-6 pb-4">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                <GitBranch className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                  {commit.message}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                    {commit.hash.substring(0, 7)}
                  </span>
                  <span>{new Date(commit.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="px-6 pb-4">
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              This will restore all files to this version and create a new commit. Your current changes will be preserved in git history.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isRestoring}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isRestoring}
            className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0"
          >
            {isRestoring ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Restoring...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore Version
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const GitHistoryModal: React.FC<GitHistoryModalProps> = ({ projectId, isOpen, onClose }) => {
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<GitCommit | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadGitHistory();
    }
  }, [isOpen, projectId]);

  const loadGitHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/git/history?limit=50`);
      if (!response.ok) throw new Error('Failed to load git history');

      const data = await response.json();
      setCommits(data.commits || []);
    } catch (error) {
      console.error('Error loading git history:', error);
      toast({
        title: "Error loading history",
        description: "Failed to load git commit history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreClick = (commit: GitCommit) => {
    setConfirmRestore(commit);
  };

  const handleRestoreConfirm = async () => {
    if (!confirmRestore) return;

    setIsRestoring(true);
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/git/restore/${confirmRestore.hash}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to restore commit');

      const data = await response.json();

      setConfirmRestore(null);

      toast({
        title: "Restored successfully",
        description: data.message,
      });

      // Reload history to show new commit
      loadGitHistory();

      // Reload page after 2 seconds to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error restoring commit:', error);
      toast({
        title: "Error restoring commit",
        description: "Failed to restore to the selected commit",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-lg shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Git Commit History</h2>
            {commits.length > 0 && (
              <span className="text-sm text-muted-foreground">({commits.length} commits)</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : commits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <GitBranch className="w-12 h-12 mb-4 opacity-50" />
              <p>No commits found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {commits.map((commit) => (
                <div
                  key={commit.hash}
                  className={`border rounded-lg p-4 transition-all ${
                    selectedCommit === commit.hash
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }`}
                  onClick={() => setSelectedCommit(commit.hash)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Commit Message */}
                      <div className="font-medium text-foreground mb-2 break-words">
                        {commit.message}
                      </div>

                      {/* Commit Info */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Hash className="w-3 h-3" />
                          <span className="font-mono">{commit.hash.substring(0, 7)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3" />
                          <span>{commit.author}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(commit.date).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Restore Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestoreClick(commit);
                      }}
                      className="gap-1.5 shrink-0"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restore
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Restore Confirmation Dialog */}
      <RestoreConfirmDialog
        commit={confirmRestore}
        isOpen={confirmRestore !== null}
        onConfirm={handleRestoreConfirm}
        onCancel={() => setConfirmRestore(null)}
        isRestoring={isRestoring}
      />
    </div>
  );
};
