import { forwardRef, useState } from 'react';
import {
  X,
  Code,
  Eye,
  GitBranch,
  Play,
  RefreshCw,
  Settings,
  Camera,
  Download,
  Layers,
  Sparkles,
  Bot,
  MoreHorizontal,
  History,
  Sun,
  Moon,
  Columns
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface Tab {
  id: string;
  name: string;
  isActive: boolean;
}

interface EditorTabsProps {
  activeView: 'code' | 'preview' | 'split' | 'sketch';
  onViewChange: (view: 'code' | 'preview' | 'split' | 'sketch') => void;
  tabs: Tab[];
  onTabClose: (id: string) => void;
  onTabSelect: (id: string) => void;
  onRunProject?: () => void;
  onShowGitHistory?: () => void;
  currentBranch?: string;
  onGitSync?: () => void;
  onGitConfig?: () => void;
  isSyncing?: boolean;
  onManualScreenshot?: () => void;
  onDownloadProject?: () => void;
  onModelSettings?: () => void;
  currentModel?: string;
  // Visual Editor
  isVisualMode?: boolean;
  onToggleVisualMode?: () => void;
  // Command Palette
  onOpenCommandPalette?: () => void;
  // Split Editor
  isSplitEditor?: boolean;
  onToggleSplitEditor?: () => void;
}

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith('.tsx') || fileName.endsWith('.ts')) {
    return <span className="text-blue-500 text-[10px] font-bold">TS</span>;
  }
  if (fileName.endsWith('.css')) {
    return <span className="text-purple-500 text-[10px] font-bold">CSS</span>;
  }
  if (fileName.endsWith('.json')) {
    return <span className="text-amber-500 text-[10px] font-bold">{'{}'}</span>;
  }
  return <Code className="w-3 h-3 text-muted-foreground" />;
};

export const EditorTabs = forwardRef<HTMLDivElement, EditorTabsProps>(
  ({
    activeView,
    onViewChange,
    tabs,
    onTabClose,
    onTabSelect,
    onRunProject,
    onShowGitHistory,
    currentBranch = 'main',
    onGitSync,
    onGitConfig,
    isSyncing = false,
    onManualScreenshot,
    onDownloadProject,
    onModelSettings,
    currentModel = 'gemini-3-flash-preview',
    isVisualMode = false,
    onToggleVisualMode,
    onOpenCommandPalette,
    isSplitEditor = false,
    onToggleSplitEditor
  }, ref) => {
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const { theme, setTheme, resolvedTheme } = useTheme();

    // Get short model name for display
    const getShortModelName = (model: string) => {
      const parts = model.split('-');
      if (parts.length >= 3) {
        // e.g., "gemini-3-flash-preview" -> "Gemini 3 Flash"
        return `${parts[1]} ${parts[2].charAt(0).toUpperCase() + parts[2].slice(1)}`;
      }
      return model;
    };

    return (
      <div ref={ref} className="flex items-center justify-between bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-border/40 px-2 h-12 overflow-visible">
        {/* Left Section: File Tabs - Only show in Code or Split view */}
        <div className="flex items-center gap-1 overflow-x-auto flex-shrink min-w-0 max-w-[300px]">
          {(activeView === 'code' || activeView === 'split') && tabs.length > 0 ? (
            tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => onTabSelect(tab.id)}
                className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-pointer
                           text-xs transition-all duration-200 flex-shrink-0 ${
                  tab.isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                <span className="w-3.5 h-3.5 flex items-center justify-center">
                  {getFileIcon(tab.name)}
                </span>
                <span className="font-medium truncate max-w-[80px]">{tab.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 hover:text-red-500 rounded-full transition-all"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="w-[100px]" />
          )}
        </div>

        {/* Center Section: View Toggle & Visual Edit */}
        <div className="flex items-center gap-2">
          {/* View Toggle - Compact Segmented Control */}
          <div className="flex items-center bg-secondary/50 rounded-lg p-0.5 border border-border/30" data-tutorial="view-toggle">
            <button
              onClick={() => onViewChange('code')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeView === 'code'
                  ? 'bg-white dark:bg-gray-700 text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Code Editor"
              data-tutorial="view-code-btn"
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Code</span>
            </button>
            <button
              onClick={() => onViewChange('split')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeView === 'split'
                  ? 'bg-white dark:bg-gray-700 text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Split View"
              data-tutorial="view-split-btn"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => onViewChange('sketch')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeView === 'sketch'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Sketch to App"
              data-tutorial="view-sketch-btn"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sketch</span>
            </button>
            <button
              onClick={() => onViewChange('preview')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeView === 'preview'
                  ? 'bg-white dark:bg-gray-700 text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Preview"
              data-tutorial="view-preview-btn"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          {/* Split Editor Toggle - Only show in code view */}
          {(activeView === 'code' || activeView === 'split') && (
            <button
              onClick={onToggleSplitEditor}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                isSplitEditor
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                  : 'bg-secondary/50 text-muted-foreground hover:text-foreground border-border/30 hover:bg-secondary'
              }`}
              title={isSplitEditor ? "Close split editor" : "Split editor (view 2 files)"}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
          )}
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2">
          {/* Command Palette Button */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1 px-2 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-700 transition-colors"
            title="Command Palette (Ctrl+K)"
            data-tutorial="command-palette-btn"
          >
            <kbd className="text-[10px] font-medium text-gray-500 dark:text-gray-400 font-mono">Ctrl</kbd>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">+</span>
            <kbd className="text-[10px] font-medium text-gray-500 dark:text-gray-400 font-mono">K</kbd>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-secondary/50 hover:bg-secondary rounded-lg border border-border/30 transition-colors"
            title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-gray-600" />
            )}
          </button>

          {/* AI Model - Compact */}
          <button
            onClick={onModelSettings}
            className="flex items-center gap-1.5 bg-violet-50 dark:bg-violet-900/30 hover:bg-violet-100 dark:hover:bg-violet-900/50 rounded-lg px-2.5 py-1.5 border border-violet-200/50 dark:border-violet-700/50 transition-colors"
            title="AI Model Settings"
            data-tutorial="ai-model-btn"
          >
            <Bot className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-xs font-medium text-violet-700 dark:text-violet-300 hidden md:inline">{getShortModelName(currentModel)}</span>
          </button>

          {/* Git - Compact */}
          <div className="flex items-center gap-0.5 bg-secondary/50 rounded-lg px-1.5 py-1 border border-border/30" data-tutorial="git-controls">
            <div className="flex items-center gap-1 px-1.5">
              <GitBranch className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground hidden lg:inline">{currentBranch}</span>
            </div>
            <button
              onClick={onShowGitHistory}
              className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors"
              title="Git history"
            >
              <History className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={onGitSync}
              disabled={isSyncing}
              className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
              title="Sync with remote"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onGitConfig}
              className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors"
              title="Git settings"
            >
              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Run Button */}
          <button
            onClick={onRunProject}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700
                       text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
            title="Run project"
            data-tutorial="run-btn"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Run</span>
          </button>

          {/* More Actions Dropdown */}
          <div className="relative z-20">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
              title="More actions"
            >
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>

            {showMoreMenu && (
              <>
                <div
                  className="fixed inset-0 z-[55]"
                  onClick={() => setShowMoreMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-border/50 dark:border-gray-700 py-1 z-[60]">
                  <button
                    onClick={() => {
                      onManualScreenshot?.();
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-secondary/50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-muted-foreground" />
                    Capture Thumbnail
                  </button>
                  <button
                    onClick={() => {
                      onDownloadProject?.();
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-secondary/50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-muted-foreground" />
                    Download Project
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);

EditorTabs.displayName = 'EditorTabs';
