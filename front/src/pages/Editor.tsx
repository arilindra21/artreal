import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  PanelLeftClose,
  PanelLeft,
  FileText,
} from 'lucide-react';
import { useProject } from '@/hooks/useProjects';
import { useUpdateFile } from '@/hooks/useFiles';
import { useQueryClient } from '@tanstack/react-query';
import { API_URL } from '@/services/api';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { FileExplorer } from '@/components/editor/FileExplorer';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { ChatPanel } from '@/components/editor/ChatPanel';
import { PreviewPanel, PreviewPanelRef, SelectedElementData } from '@/components/editor/PreviewPanelWithWebContainer';
import { EditorTabs } from '@/components/editor/EditorTabs';
import { SketchCanvas } from '@/components/editor/SketchCanvas';
import { SketchCanvasData } from '@/components/editor/sketch-types';
import { GitHistoryModal } from '@/components/editor/GitHistoryModal';
import { GitConfigModal } from '@/components/editor/GitConfigModal';
import { ModelSettingsModal } from '@/components/editor/ModelSettingsModal';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { CommandPalette } from '@/components/CommandPalette';
import { ProjectTemplates } from '@/components/ProjectTemplates';
import { AIWorkingOverlay, AIWorkingBadge } from '@/components/editor/AIWorkingOverlay';
import { EditorTutorial, TUTORIAL_STORAGE_KEY, TutorialActions } from '@/components/editor/EditorTutorial';
import { APIKeyModal, API_KEY_TYPE_KEY } from '@/components/APIKeyModal';
import { GlobalSearch } from '@/components/editor/GlobalSearch';
import { DiffViewer, FileDiff } from '@/components/editor/DiffViewer';
import { preWarmWebContainer, onPreWarmStatus, PreWarmStatus } from '@/services/webcontainer';

const Editor = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: project, isLoading: projectLoading } = useProject(Number(projectId));
  const updateFileMutation = useUpdateFile();

  const [selectedFile, setSelectedFile] = useState<{ name: string; id: number; content: string; filepath: string } | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // Split Editor state
  const [isSplitEditor, setIsSplitEditor] = useState(false);
  const [secondSelectedFile, setSecondSelectedFile] = useState<{ name: string; id: number; content: string; filepath: string } | null>(null);
  const [secondEditedContent, setSecondEditedContent] = useState<string>('');
  const [activeEditorPane, setActiveEditorPane] = useState<'left' | 'right'>('left');
  const [activeView, setActiveView] = useState<'code' | 'preview' | 'split' | 'sketch'>('preview');
  const [showExplorer, setShowExplorer] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [tabs, setTabs] = useState<Array<{ id: string; name: string; isActive: boolean; fileId?: number }>>([]);
  const [showGitHistory, setShowGitHistory] = useState(false);
  const [showGitConfig, setShowGitConfig] = useState(false);
  const [showModelSettings, setShowModelSettings] = useState(false);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [currentModel, setCurrentModel] = useState(() => {
    // Initialize from localStorage
    return localStorage.getItem('artreal_model') || 'gemini-3-flash-preview';
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isVisualMode, setIsVisualMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElementData | undefined>(undefined);
  const [initialMessageSent, setInitialMessageSent] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isAIWorking, setIsAIWorking] = useState(false);
  const [aiWorkingFile, setAIWorkingFile] = useState<string | undefined>(undefined);
  const [aiWorkingAction, setAIWorkingAction] = useState<string | undefined>(undefined);
  const [aiFilesModified, setAIFilesModified] = useState<string[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(false);
  const [apiKeyType, setApiKeyType] = useState<string | null>(null);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  // Diff Viewer state
  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [fileDiffs, setFileDiffs] = useState<FileDiff[]>([]);
  const [filesBeforeAI, setFilesBeforeAI] = useState<Map<string, string>>(new Map());
  const [hasNewDiffs, setHasNewDiffs] = useState(false);

  // Load API key type on mount
  useEffect(() => {
    setApiKeyType(localStorage.getItem(API_KEY_TYPE_KEY));
  }, []);

  // WebContainer pre-warm status
  const [preWarmStatus, setPreWarmStatus] = useState<PreWarmStatus>({ stage: 'idle', message: 'Idle', progress: 0 });

  // Pre-warm WebContainer on Editor mount (background task)
  useEffect(() => {
    console.log('[Editor] 🚀 Starting WebContainer pre-warm...');

    // Subscribe to status updates
    const unsubscribe = onPreWarmStatus((status) => {
      setPreWarmStatus(status);
      console.log(`[Editor] Pre-warm status: ${status.stage} - ${status.message} (${status.progress}%)`);
    });

    // Start pre-warming in background
    preWarmWebContainer((msg) => {
      console.log(msg);
    }).catch((err) => {
      console.error('[Editor] Pre-warm failed:', err);
    });

    return unsubscribe;
  }, []);

  const chatPanelRef = useRef<{ sendMessage: (message: string, attachments?: any[]) => void }>(null);
  const previewPanelRef = useRef<PreviewPanelRef>(null);

  useEffect(() => {
    if (!projectId || isNaN(Number(projectId))) {
      navigate('/projects');
    }
  }, [projectId, navigate]);

  // Log when project files are updated (for debugging file sync timing)
  useEffect(() => {
    if (project?.files) {
      console.log('[Editor] 🔄 Project files updated:', project.files.length, 'files');
      console.log('[Editor] 🔄 File list:', project.files.map(f => f.filename).join(', '));
    }
  }, [project?.files]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPreviewLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch current branch on mount
  useEffect(() => {
    const fetchBranch = async () => {
      if (!projectId) return;
      try {
        const response = await fetch(`${API_URL}/projects/${projectId}/git/branch`);
        if (response.ok) {
          const data = await response.json();
          setCurrentBranch(data.branch);
        }
      } catch (error) {
        console.error('Error fetching branch:', error);
      }
    };
    fetchBranch();
  }, [projectId]);

  // Auto-select App.tsx when project loads
  useEffect(() => {
    if (project?.files && project.files.length > 0 && !selectedFile) {
      // Try to find App.tsx in src/ folder first
      const appTsx = project.files.find(file =>
        file.filepath === 'src/App.tsx' || file.filename === 'App.tsx'
      );

      if (appTsx) {
        handleFileSelect({
          name: appTsx.filename,
          id: appTsx.id,
          content: appTsx.content || '',
          filepath: appTsx.filepath
        });
      }
    }
  }, [project?.files, selectedFile]);

  // Auto-send initial message if provided from homepage (ONE-TIME ONLY)
  useEffect(() => {
    const state = location.state as { initialMessage?: string; attachments?: any[] };
    const initialMessage = state?.initialMessage;
    const attachments = state?.attachments;

    if (initialMessage && !initialMessageSent) {
      console.log('[Editor] Initial message detected:', initialMessage);
      if (attachments) {
        console.log('[Editor] Attachments detected:', attachments.length);
      }

      // Wait for chat panel to be fully ready
      const timer = setTimeout(() => {
        if (chatPanelRef.current) {
          console.log('[Editor] Sending initial message to chat panel');
          chatPanelRef.current.sendMessage(initialMessage, attachments);
          setInitialMessageSent(true);

          // IMPORTANT: Clear location state to prevent re-sending on page reload
          window.history.replaceState({}, document.title);
          console.log('[Editor] Location state cleared to prevent duplicate sends');
        } else {
          console.warn('[Editor] Chat panel ref not ready yet');
        }
      }, 1500); // Increased delay to ensure chat panel is ready

      return () => clearTimeout(timer);
    }
  }, [location.state, initialMessageSent]);

  // Keyboard shortcuts (Ctrl+S for save, Ctrl+K for command palette, Ctrl+Shift+F for global search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S - Save file
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges && selectedFile) {
          handleSaveFile();
        }
      }
      // Ctrl+K - Command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
      // Ctrl+Shift+F - Global search
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        setShowGlobalSearch(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges, selectedFile, editedContent]);

  const handleFileSelect = (file: { name: string; id: number; content: string; filepath: string }) => {
    setSelectedFile(file);
    setEditedContent(file.content);
    setHasUnsavedChanges(false);
    const existingTab = tabs.find(t => t.fileId === file.id);
    if (!existingTab) {
      setTabs(prev => [
        ...prev.map(t => ({ ...t, isActive: false })),
        { id: file.id.toString(), name: file.name, isActive: true, fileId: file.id }
      ]);
    } else {
      setTabs(prev => prev.map(t => ({ ...t, isActive: t.fileId === file.id })));
    }
  };

  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent);
    setHasUnsavedChanges(newContent !== selectedFile?.content);
  };

  const handleSaveFile = async () => {
    if (!selectedFile || !hasUnsavedChanges) return;

    try {
      await updateFileMutation.mutateAsync({
        projectId: Number(projectId),
        fileId: selectedFile.id,
        data: {
          content: editedContent,
          filepath: selectedFile.filepath
        }
      });

      setSelectedFile({ ...selectedFile, content: editedContent });
      setHasUnsavedChanges(false);

      // Reload WebContainer to reflect manual changes
      if (previewPanelRef.current) {
        previewPanelRef.current.handleRefresh();
      }

      toast({
        title: "File saved",
        description: `${selectedFile.name} has been saved successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error saving file",
        description: "There was an error saving the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTabClose = (id: string) => {
    setTabs(prev => {
      const filtered = prev.filter(t => t.id !== id);
      if (filtered.length === 0) {
        setSelectedFile(null);
        return [];
      }
      if (prev.find(t => t.id === id)?.isActive && selectedFile) {
        filtered[filtered.length - 1].isActive = true;
      }
      return filtered;
    });
  };

  const handleTabSelect = (id: string) => {
    // Mark the tab as active
    setTabs(prev => prev.map(t => ({ ...t, isActive: t.id === id })));

    // Find the tab and load its file content
    const tab = tabs.find(t => t.id === id);
    if (tab?.fileId && project?.files) {
      const file = project.files.find(f => f.id === tab.fileId);
      if (file) {
        setSelectedFile({
          name: file.filename,
          id: file.id,
          content: file.content || '',
          filepath: file.filepath
        });
        setEditedContent(file.content || '');
        setHasUnsavedChanges(false);
      }
    }
  };

  const handleCodeChange = () => {
    setIsPreviewLoading(true);
    setTimeout(() => {
      setIsPreviewLoading(false);
    }, 1000);

    // Refetch files to update the file explorer
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project', Number(projectId)] });
    }
  };

  const handleReportError = (errorMessage: string) => {
    if (chatPanelRef.current) {
      chatPanelRef.current.sendMessage(errorMessage);
    }
  };

  const handleRunProject = () => {
    // Just refresh the preview - no need to save if nothing changed
    if (previewPanelRef.current) {
      previewPanelRef.current.handleRefresh();
    }
    toast({
      title: "Running project",
      description: "Reloading preview to run the latest code...",
    });
  };

  const handleShowGitHistory = () => {
    setShowGitHistory(true);
  };

  const handleGitSync = async () => {
    if (!projectId) return;

    setIsSyncing(true);
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/git/sync`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Sync failed');

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Sync completed",
          description: (
            <div className="text-xs space-y-1">
              <div>{data.fetch}</div>
              <div>{data.pull}</div>
              <div>{data.commit}</div>
              <div>{data.push}</div>
            </div>
          ),
          duration: 5000,
        });
      } else {
        toast({
          title: "⚠️ Sync incomplete",
          description: data.message,
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: "Error syncing",
        description: "Failed to sync with remote repository",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGitConfig = () => {
    setShowGitConfig(true);
  };

  const handlePreviewReady = (url: string) => {
    console.log('[Editor] Preview ready with URL:', url);
    setPreviewUrl(url);
  };

  // Screenshot is now handled automatically by PreviewPanelWithWebContainer
  // using postMessage communication with the iframe
  const handleManualScreenshot = () => {
    toast({
      title: "Auto-capture enabled",
      description: "Screenshots are captured automatically when the preview loads",
      duration: 3000,
    });
  };

  const handleDownloadProject = async () => {
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/download`);

      if (!response.ok) {
        throw new Error('Failed to download project');
      }

      // Get the filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'project.zip';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob from response
      const blob = await response.blob();

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: `${filename} is being downloaded`,
        duration: 3000,
      });
    } catch (error) {
      console.error('[Download] Failed:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReloadPreview = (data: { message: string }) => {
    console.log('[Editor] Reload preview requested:', data);

    // Refetch files to update the file explorer
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project', Number(projectId)] });
    }

    // Use reload() to properly reinitialize WebContainer and re-apply visual mode
    if (previewPanelRef.current) {
      previewPanelRef.current.reload();
    }
  };

  const handleVisualModeChange = (isVisual: boolean) => {
    setIsVisualMode(isVisual);
    if (!isVisual) {
      setSelectedElement(undefined);
    }
  };

  const handleElementSelected = (data: SelectedElementData) => {
    setSelectedElement(data);
  };

  const handleStyleUpdate = (property: string, value: string) => {
    if (previewPanelRef.current) {
      previewPanelRef.current.updateStyle(property, value);
    }
  };

  const handleFileUpdate = (files: Array<{ path: string, content: string }>) => {
    if (previewPanelRef.current) {
      console.log(`[Editor] 🚀 Pushing ${files.length} file updates to preview panel`);
      previewPanelRef.current.applyFileUpdates(files);
    }
  };

  const handleGenerateFromSketch = (prompt: string, canvasData: SketchCanvasData) => {
    console.log('[Editor] Generate from sketch:', { prompt, canvasData });

    if (chatPanelRef.current) {
      // Send the sketch prompt to the AI
      chatPanelRef.current.sendMessage(prompt);

      // Switch to split view so user can see both code generation and preview
      setActiveView('split');

      // Make sure chat is visible
      if (!showChat) {
        setShowChat(true);
      }

      toast({
        title: "Generating from Sketch",
        description: `Creating app from ${canvasData.elements.length} elements and ${canvasData.connections.length} connections...`,
        duration: 5000,
      });
    }
  };

  // Handle template selection
  const handleSelectTemplate = (prompt: string, templateName: string) => {
    setShowTemplates(false);
    if (chatPanelRef.current) {
      chatPanelRef.current.sendMessage(prompt);
      toast({
        title: `Using "${templateName}" template`,
        description: "AI is generating your project...",
        duration: 5000,
      });
    }
  };

  // Handle AI working state from chat panel
  const handleAIWorkingChange = (working: boolean, file?: string, action?: string) => {
    if (working && !isAIWorking) {
      // AI just started working - capture current file states
      const beforeMap = new Map<string, string>();
      project?.files?.forEach(f => {
        beforeMap.set(f.filepath, f.content || '');
      });
      setFilesBeforeAI(beforeMap);
      setHasNewDiffs(false);
    }

    setIsAIWorking(working);
    setAIWorkingFile(file);
    setAIWorkingAction(action);

    if (!working) {
      // Clear files modified list when AI stops working
      setTimeout(() => setAIFilesModified([]), 2000);
    }
  };

  // Compute diffs after AI finishes and files are updated
  useEffect(() => {
    if (!isAIWorking && filesBeforeAI.size > 0 && aiFilesModified.length > 0 && project?.files) {
      const diffs: FileDiff[] = [];

      aiFilesModified.forEach(filepath => {
        const originalContent = filesBeforeAI.get(filepath) || '';
        const file = project.files?.find(f => f.filepath === filepath);
        const modifiedContent = file?.content || '';

        if (originalContent !== modifiedContent) {
          diffs.push({
            filepath,
            filename: filepath.split('/').pop() || filepath,
            original: originalContent,
            modified: modifiedContent
          });
        }
      });

      if (diffs.length > 0) {
        setFileDiffs(diffs);
        setHasNewDiffs(true);
      }
    }
  }, [isAIWorking, project?.files, aiFilesModified, filesBeforeAI]);

  // Handle starting the tutorial
  const handleStartTutorial = () => {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
    setShowTutorial(true);
  };

  // Handle tutorial step changes - open panels and change views as needed
  const handleTutorialStepChange = useCallback((stepId: string, actions?: TutorialActions) => {
    if (!actions) return;

    // Apply actions with a small delay to allow UI to update
    setTimeout(() => {
      if (actions.showChat !== undefined) {
        setShowChat(actions.showChat);
      }
      if (actions.showExplorer !== undefined) {
        setShowExplorer(actions.showExplorer);
      }
      if (actions.setView !== undefined) {
        setActiveView(actions.setView);
      }
    }, 100);
  }, []);

  // Handle file modification notification
  const handleFileModified = (filepath: string) => {
    setAIFilesModified(prev => {
      if (prev.includes(filepath)) return prev;
      return [...prev, filepath];
    });
  };

  const handleGitCommit = async (data: { success: boolean; error?: string; message?: string; commit_count?: number }) => {
    // Capture screenshot on first user commit (commit_count == 2)
    // commit_count == 1 is the initial "Project created" commit
    // commit_count == 2 is the first actual code commit
    if (data.success && data.commit_count === 2) {
      console.log('[Editor] First commit detected - capturing screenshot');
      toast({
        title: "📸 Capturing project thumbnail",
        description: "Taking a screenshot of your project...",
        duration: 3000,
      });

      // Wait a moment for the preview to be fully rendered after commit
      setTimeout(async () => {
        if (previewPanelRef.current) {
          const success = await previewPanelRef.current.captureAndSendScreenshot();
          if (success) {
            console.log('[Editor] Screenshot captured and saved successfully');
            toast({
              title: "✅ Thumbnail saved",
              description: "Project thumbnail has been updated",
              duration: 3000,
            });
          } else {
            console.warn('[Editor] Failed to capture screenshot');
          }
        }
      }, 2000); // Wait 2 seconds after commit to ensure preview is updated
    }
  };

  if (projectLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <img
              src="/artreal_icon.png"
              alt="ArtReal"
              className="w-full h-full object-contain animate-pulse"
            />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Loading Project</h3>
          <p className="text-sm text-muted-foreground">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="text-center bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-border/50 p-8 max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <FileText className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Project Not Found</h3>
          <p className="text-sm text-muted-foreground mb-4">The project you're looking for doesn't exist or has been deleted.</p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden transition-colors duration-300">
      {/* Top Header Bar with API Key Status */}
      <header className="h-10 flex items-center justify-between px-4 border-b border-border/30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img
              src="/artreal_icon.png"
              alt="ArtReal"
              className="h-6 w-6 object-contain"
            />
            <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">ArtReal</span>
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
            {project?.name || 'Project'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* API Key Status Badge - Prominent Position */}
          <button
            onClick={() => setShowAPIKeyModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
              apiKeyType === 'own'
                ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400 dark:hover:bg-green-900/60 border border-green-200 dark:border-green-800'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${
              apiKeyType === 'own' ? 'bg-green-500' : 'bg-blue-500'
            }`} />
            {apiKeyType === 'own' ? 'Own API Key' : 'Demo Mode'}
          </button>
        </div>
      </header>

      {/* Main Content with Resizable Panels */}
      <ResizablePanelGroup id="main-panel-group" direction="horizontal" className="flex-1" autoSaveId="main-layout">
        {/* Chat Panel */}
        {showChat && (
          <>
            <ResizablePanel id="chat-panel" defaultSize={35} minSize={20} maxSize={35} order={1}>
              <div className="h-full relative" data-tutorial="chat-panel">
                <ChatPanel
                  ref={chatPanelRef}
                  projectId={Number(projectId)}
                  onCodeChange={handleCodeChange}
                  onGitCommit={handleGitCommit}
                  onReloadPreview={handleReloadPreview}
                  onVisualModeChange={handleVisualModeChange}
                  onStyleUpdate={handleStyleUpdate}
                  selectedElement={selectedElement}
                  onFileUpdate={handleFileUpdate}
                  onAIWorkingChange={handleAIWorkingChange}
                />
                {/* Toggle Chat Button - positioned at right edge of chat panel */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full z-10">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setShowChat(false)}
                        className="p-1.5 bg-background border border-border/50 rounded-r-lg hover:bg-muted/20 transition-colors shadow-sm"
                      >
                        <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      Hide chat
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {/* File Explorer + Editor + Preview */}
        <ResizablePanel id="main-content-panel" defaultSize={showChat ? 75 : 100} order={2}>
          <div className="h-full flex flex-col">
            {/* Toggle Chat Button - Show when chat is hidden */}
            {!showChat && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowChat(true)}
                      className="p-1.5 bg-background border border-border/50 rounded-r-lg hover:bg-muted/20 transition-colors shadow-sm"
                    >
                      <PanelLeft className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Show chat
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            <ResizablePanelGroup id="explorer-editor-panel-group" direction="horizontal" className="flex-1" autoSaveId="explorer-editor-layout">
              {/* File Explorer */}
              {showExplorer && activeView !== 'preview' && activeView !== 'sketch' && (
                <>
                  <ResizablePanel id="explorer-panel" defaultSize={18} minSize={15} maxSize={30} order={1}>
                    <div data-tutorial="explorer-panel" className="h-full">
                    <FileExplorer
                      projectId={Number(projectId)}
                      selectedFile={selectedFile?.name || ''}
                      onSelectFile={handleFileSelect}
                      hasUnsavedChanges={hasUnsavedChanges}
                      onSaveFile={handleSaveFile}
                      isSaving={updateFileMutation.isPending}
                    />
                    </div>
                  </ResizablePanel>
                  <ResizableHandle />
                </>
              )}

              {/* Editor & Preview Area */}
              <ResizablePanel id="editor-preview-container-panel" defaultSize={showExplorer && activeView !== 'preview' && activeView !== 'sketch' ? 82 : 100} order={2}>
                <div className="h-full flex flex-col overflow-visible">
                  <div data-tutorial="view-mode-tabs" className="relative z-10 shrink-0">
                  <EditorTabs
                    activeView={activeView}
                    onViewChange={setActiveView}
                    tabs={tabs}
                    onTabClose={handleTabClose}
                    onTabSelect={handleTabSelect}
                    onRunProject={handleRunProject}
                    onShowGitHistory={handleShowGitHistory}
                    currentBranch={currentBranch}
                    onGitSync={handleGitSync}
                    onGitConfig={handleGitConfig}
                    isSyncing={isSyncing}
                    onManualScreenshot={handleManualScreenshot}
                    onDownloadProject={handleDownloadProject}
                    onModelSettings={() => setShowModelSettings(true)}
                    currentModel={currentModel}
                    isVisualMode={isVisualMode}
                    onToggleVisualMode={() => setIsVisualMode(!isVisualMode)}
                    onOpenCommandPalette={() => setShowCommandPalette(true)}
                    isSplitEditor={isSplitEditor}
                    onToggleSplitEditor={() => {
                      if (!isSplitEditor && !secondSelectedFile && project?.files && project.files.length > 0) {
                        // Auto-select a different file for the second pane
                        const otherFile = project.files.find(f => f.id !== selectedFile?.id);
                        if (otherFile) {
                          setSecondSelectedFile({
                            name: otherFile.filename,
                            id: otherFile.id,
                            content: otherFile.content || '',
                            filepath: otherFile.filepath
                          });
                          setSecondEditedContent(otherFile.content || '');
                        }
                      }
                      setIsSplitEditor(!isSplitEditor);
                    }}
                  />
                  </div>

                  <ResizablePanelGroup id="code-preview-panel-group" direction="horizontal" className="flex-1" autoSaveId="editor-preview-layout">
                    {/* Code Editor */}
                    {(activeView === 'code' || activeView === 'split') && (
                      <ResizablePanel id="code-editor-panel" defaultSize={activeView === 'split' ? 50 : 100} order={1}>
                        {isSplitEditor ? (
                          /* Split Editor View - Two CodeEditors side by side */
                          <ResizablePanelGroup direction="horizontal" className="h-full">
                            {/* Left Editor Pane */}
                            <ResizablePanel defaultSize={50} minSize={25}>
                              <div
                                className={`relative h-full ${activeEditorPane === 'left' ? 'ring-2 ring-blue-500/50 ring-inset' : ''}`}
                                onClick={() => setActiveEditorPane('left')}
                              >
                                {/* File selector for left pane */}
                                <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-1 px-2 py-1 bg-gray-100/90 dark:bg-gray-800/90 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm">
                                  <select
                                    value={selectedFile?.id || ''}
                                    onChange={(e) => {
                                      const file = project?.files?.find(f => f.id === Number(e.target.value));
                                      if (file) {
                                        setSelectedFile({
                                          name: file.filename,
                                          id: file.id,
                                          content: file.content || '',
                                          filepath: file.filepath
                                        });
                                        setEditedContent(file.content || '');
                                      }
                                    }}
                                    className="flex-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    {project?.files?.map(f => (
                                      <option key={f.id} value={f.id}>{f.filepath}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="h-full pt-8">
                                  <CodeEditor
                                    selectedFile={selectedFile ? { ...selectedFile, content: editedContent } : null}
                                    isTyping={isTyping}
                                    onContentChange={handleContentChange}
                                    onAskAgent={(data) => {
                                      if (chatPanelRef.current) {
                                        const contextMessage = `I have a question about the file \`${data.filepath}\` (lines ${data.startLine}-${data.endLine}):\n\n\`\`\`${selectedFile?.name.split('.').pop() || ''}\n${data.content}\n\`\`\`\n\nQ: ${data.message}`;
                                        chatPanelRef.current.sendMessage(contextMessage);
                                        if (!showChat) setShowChat(true);
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            {/* Right Editor Pane */}
                            <ResizablePanel defaultSize={50} minSize={25}>
                              <div
                                className={`relative h-full ${activeEditorPane === 'right' ? 'ring-2 ring-blue-500/50 ring-inset' : ''}`}
                                onClick={() => setActiveEditorPane('right')}
                              >
                                {/* File selector for right pane */}
                                <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-1 px-2 py-1 bg-gray-100/90 dark:bg-gray-800/90 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm">
                                  <select
                                    value={secondSelectedFile?.id || ''}
                                    onChange={(e) => {
                                      const file = project?.files?.find(f => f.id === Number(e.target.value));
                                      if (file) {
                                        setSecondSelectedFile({
                                          name: file.filename,
                                          id: file.id,
                                          content: file.content || '',
                                          filepath: file.filepath
                                        });
                                        setSecondEditedContent(file.content || '');
                                      }
                                    }}
                                    className="flex-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    {project?.files?.map(f => (
                                      <option key={f.id} value={f.id}>{f.filepath}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="h-full pt-8">
                                  <CodeEditor
                                    selectedFile={secondSelectedFile ? { ...secondSelectedFile, content: secondEditedContent } : null}
                                    isTyping={false}
                                    onContentChange={(content) => setSecondEditedContent(content)}
                                    onAskAgent={(data) => {
                                      if (chatPanelRef.current) {
                                        const contextMessage = `I have a question about the file \`${data.filepath}\` (lines ${data.startLine}-${data.endLine}):\n\n\`\`\`${secondSelectedFile?.name.split('.').pop() || ''}\n${data.content}\n\`\`\`\n\nQ: ${data.message}`;
                                        chatPanelRef.current.sendMessage(contextMessage);
                                        if (!showChat) setShowChat(true);
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </ResizablePanel>
                          </ResizablePanelGroup>
                        ) : (
                          /* Single Editor View */
                          <div className="relative h-full" data-tutorial="code-editor-panel">
                            <CodeEditor
                              selectedFile={selectedFile ? { ...selectedFile, content: editedContent } : null}
                              isTyping={isTyping}
                              onContentChange={handleContentChange}
                              onAskAgent={(data) => {
                                if (chatPanelRef.current) {
                                  const contextMessage = `I have a question about the file \`${data.filepath}\` (lines ${data.startLine}-${data.endLine}):\n\n\`\`\`${selectedFile?.name.split('.').pop() || ''}\n${data.content}\n\`\`\`\n\nQ: ${data.message}`;
                                  chatPanelRef.current.sendMessage(contextMessage);
                                  if (!showChat) setShowChat(true);
                                }
                              }}
                            />
                            {/* AI Working Overlay on Code Editor (only show in pure code mode) */}
                            {activeView === 'code' && (
                              <AIWorkingOverlay
                                isWorking={isAIWorking}
                                currentFile={aiWorkingFile}
                                currentAction={aiWorkingAction}
                                filesModified={aiFilesModified}
                              />
                            )}
                          </div>
                        )}
                      </ResizablePanel>
                    )}

                    {activeView === 'split' && <ResizableHandle withHandle />}

                    {/* Preview */}
                    {(activeView === 'preview' || activeView === 'split') && (
                      <ResizablePanel id="preview-panel" defaultSize={activeView === 'split' ? 50 : 100} order={2}>
                        <div className="relative h-full" data-tutorial="preview-panel">
                          <PreviewPanel
                            ref={previewPanelRef}
                            projectId={Number(projectId)}
                            isLoading={isPreviewLoading}
                            onReload={handleCodeChange}
                            onReportError={handleReportError}
                            onPreviewReady={handlePreviewReady}
                            isVisualMode={isVisualMode}
                            onElementSelected={handleElementSelected}
                          />
                          {/* AI Working Overlay on Preview */}
                          <AIWorkingOverlay
                            isWorking={isAIWorking}
                            currentFile={aiWorkingFile}
                            currentAction={aiWorkingAction}
                            filesModified={aiFilesModified}
                          />
                        </div>
                      </ResizablePanel>
                    )}

                    {/* Sketch Canvas */}
                    {activeView === 'sketch' && (
                      <ResizablePanel id="sketch-panel" defaultSize={100} order={1}>
                        <SketchCanvas onGenerateFromSketch={handleGenerateFromSketch} />
                      </ResizablePanel>
                    )}
                  </ResizablePanelGroup>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Status Bar */}
      <footer className="h-7 flex items-center justify-between px-4 border-t border-border/30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-xs text-muted-foreground shrink-0">
        <div className="flex items-center gap-3">
          {/* WebContainer Pre-warm Status */}
          {preWarmStatus.stage !== 'ready' && preWarmStatus.stage !== 'idle' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-md">
              <div className="w-3 h-3 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              <span className="font-medium">{preWarmStatus.message}</span>
              {preWarmStatus.progress !== undefined && (
                <span className="text-amber-600 dark:text-amber-500">{preWarmStatus.progress}%</span>
              )}
            </div>
          )}
          {preWarmStatus.stage === 'ready' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="font-medium">Preview Ready</span>
            </div>
          )}
          {/* AI Working Badge */}
          <AIWorkingBadge isWorking={isAIWorking} />
          {/* View Changes Button - show when there are new diffs */}
          {hasNewDiffs && fileDiffs.length > 0 && (
            <button
              onClick={() => setShowDiffViewer(true)}
              className="flex items-center gap-1.5 px-2 py-0.5 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded-md hover:bg-violet-200 dark:hover:bg-violet-900/60 transition-colors animate-pulse"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
              <span className="font-medium">View Changes ({fileDiffs.length})</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* API Key Status */}
          <button
            onClick={() => setShowAPIKeyModal(true)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors ${
              apiKeyType === 'own'
                ? 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
            }`}
          >
            <span className="font-medium">
              {apiKeyType === 'own' ? 'Own Key' : 'Demo'}
            </span>
          </button>
          <Link to="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <img
              src="/artreal_icon.png"
              alt="ArtReal"
              className="h-4 w-4 object-contain"
            />
          </Link>
        </div>
      </footer>

      {/* Git History Modal */}
      <GitHistoryModal
        projectId={Number(projectId)}
        isOpen={showGitHistory}
        onClose={() => setShowGitHistory(false)}
      />

      {/* Git Config Modal */}
      <GitConfigModal
        projectId={Number(projectId)}
        isOpen={showGitConfig}
        onClose={() => setShowGitConfig(false)}
      />

      {/* Model Settings Modal */}
      <ModelSettingsModal
        isOpen={showModelSettings}
        onClose={() => setShowModelSettings(false)}
        onModelChange={(model) => {
          setCurrentModel(model);
          toast({
            title: "Model Updated",
            description: `AI model changed to ${model}`,
            duration: 3000,
          });
        }}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNewProject={() => setShowTemplates(true)}
        onViewChange={setActiveView}
        onModelSettings={() => setShowModelSettings(true)}
        onDownloadProject={handleDownloadProject}
        onStartTutorial={handleStartTutorial}
        onChangeAPIKey={() => setShowAPIKeyModal(true)}
        onGlobalSearch={() => setShowGlobalSearch(true)}
        onShowDiffViewer={() => setShowDiffViewer(true)}
        hasDiffs={hasNewDiffs && fileDiffs.length > 0}
        currentView={activeView}
      />

      {/* Project Templates */}
      <ProjectTemplates
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Editor Tutorial - shows on first visit or when triggered from Command Palette */}
      <EditorTutorial
        isOpen={showTutorial ? true : undefined}
        onComplete={() => setShowTutorial(false)}
        onStepChange={handleTutorialStepChange}
      />

      {/* API Key Modal */}
      <APIKeyModal
        isOpen={showAPIKeyModal}
        onClose={() => setShowAPIKeyModal(false)}
        onKeySet={(key, type) => {
          setApiKeyType(type);
          setShowAPIKeyModal(false);
          toast({
            title: "API Key Updated",
            description: type === 'own' ? "Using your personal API key" : "Using demo mode",
          });
        }}
      />

      {/* Global Search */}
      <GlobalSearch
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
        files={project?.files?.map(f => ({ filepath: f.filepath, content: f.content })) || []}
        onResultClick={(filepath, line) => {
          // Find the file and select it
          const file = project?.files?.find(f => f.filepath === filepath);
          if (file) {
            handleFileSelect({
              name: file.filename,
              id: file.id,
              content: file.content,
              filepath: file.filepath
            });
            // Switch to code view to show the file
            if (activeView === 'preview' || activeView === 'sketch') {
              setActiveView('code');
            }
            // TODO: Scroll to specific line in CodeEditor (would require editor ref)
            toast({
              title: "File opened",
              description: `${file.filename} at line ${line}`,
            });
          }
        }}
      />

      {/* Diff Viewer */}
      <DiffViewer
        isOpen={showDiffViewer}
        onClose={() => {
          setShowDiffViewer(false);
          setHasNewDiffs(false);
        }}
        diffs={fileDiffs}
        onAcceptAll={() => {
          setShowDiffViewer(false);
          setHasNewDiffs(false);
          setFileDiffs([]);
          toast({
            title: "Changes Accepted",
            description: "All AI changes have been accepted",
          });
        }}
        onRevertFile={(filepath) => {
          // Revert this specific file to original content
          const diff = fileDiffs.find(d => d.filepath === filepath);
          if (diff) {
            const file = project?.files?.find(f => f.filepath === filepath);
            if (file) {
              updateFileMutation.mutate({
                projectId: Number(projectId),
                fileId: file.id,
                data: { content: diff.original }
              }, {
                onSuccess: () => {
                  toast({
                    title: "File Reverted",
                    description: `${filepath} has been restored to original`,
                  });
                  // Remove this diff from the list
                  setFileDiffs(prev => prev.filter(d => d.filepath !== filepath));
                  // Refresh project
                  queryClient.invalidateQueries({ queryKey: ['project', Number(projectId)] });
                }
              });
            }
          }
        }}
      />
    </div>
  );
};

export default Editor;
