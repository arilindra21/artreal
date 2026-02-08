import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sun,
  Moon,
  Monitor,
  FolderPlus,
  Code,
  Eye,
  Layers,
  Sparkles,
  Settings,
  Keyboard,
  FileCode,
  Palette,
  Zap,
  GitBranch,
  Download,
  Bot,
  Home,
  X,
  HelpCircle,
  Key,
  ArrowLeftRight
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  category: 'navigation' | 'view' | 'theme' | 'actions' | 'ai';
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewProject?: () => void;
  onViewChange?: (view: 'code' | 'preview' | 'split' | 'sketch') => void;
  onModelSettings?: () => void;
  onDownloadProject?: () => void;
  onStartTutorial?: () => void;
  onChangeAPIKey?: () => void;
  onGlobalSearch?: () => void;
  onShowDiffViewer?: () => void;
  hasDiffs?: boolean;
  currentView?: string;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNewProject,
  onViewChange,
  onModelSettings,
  onDownloadProject,
  onStartTutorial,
  onChangeAPIKey,
  onGlobalSearch,
  onShowDiffViewer,
  hasDiffs,
  currentView
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    {
      id: 'home',
      label: 'Go to Home',
      description: 'Return to project list',
      icon: <Home className="w-4 h-4" />,
      category: 'navigation',
      action: () => { navigate('/'); onClose(); }
    },
    {
      id: 'new-project',
      label: 'New Project',
      description: 'Create a new project',
      icon: <FolderPlus className="w-4 h-4" />,
      shortcut: 'Ctrl+N',
      category: 'navigation',
      action: () => { onNewProject?.(); onClose(); }
    },
    {
      id: 'global-search',
      label: 'Search in Files',
      description: 'Search across all project files',
      icon: <Search className="w-4 h-4" />,
      shortcut: 'Ctrl+Shift+F',
      category: 'navigation',
      action: () => { onGlobalSearch?.(); onClose(); }
    },

    // View
    {
      id: 'view-code',
      label: 'Code View',
      description: 'Switch to code editor',
      icon: <Code className="w-4 h-4" />,
      category: 'view',
      action: () => { onViewChange?.('code'); onClose(); }
    },
    {
      id: 'view-preview',
      label: 'Preview View',
      description: 'Switch to preview',
      icon: <Eye className="w-4 h-4" />,
      category: 'view',
      action: () => { onViewChange?.('preview'); onClose(); }
    },
    {
      id: 'view-split',
      label: 'Split View',
      description: 'Code and preview side by side',
      icon: <Layers className="w-4 h-4" />,
      category: 'view',
      action: () => { onViewChange?.('split'); onClose(); }
    },
    {
      id: 'view-sketch',
      label: 'Sketch Mode',
      description: 'Draw wireframes and generate code',
      icon: <Sparkles className="w-4 h-4" />,
      category: 'view',
      action: () => { onViewChange?.('sketch'); onClose(); }
    },

    // Theme
    {
      id: 'theme-light',
      label: 'Light Theme',
      description: 'Switch to light mode',
      icon: <Sun className="w-4 h-4" />,
      category: 'theme',
      action: () => { setTheme('light'); onClose(); }
    },
    {
      id: 'theme-dark',
      label: 'Dark Theme',
      description: 'Switch to dark mode',
      icon: <Moon className="w-4 h-4" />,
      category: 'theme',
      action: () => { setTheme('dark'); onClose(); }
    },
    {
      id: 'theme-system',
      label: 'System Theme',
      description: 'Follow system preference',
      icon: <Monitor className="w-4 h-4" />,
      category: 'theme',
      action: () => { setTheme('system'); onClose(); }
    },

    // Actions
    {
      id: 'download',
      label: 'Download Project',
      description: 'Export project as ZIP',
      icon: <Download className="w-4 h-4" />,
      category: 'actions',
      action: () => { onDownloadProject?.(); onClose(); }
    },
    {
      id: 'tutorial',
      label: 'Start Tutorial',
      description: 'Learn how to use the editor',
      icon: <HelpCircle className="w-4 h-4" />,
      category: 'actions',
      action: () => { onStartTutorial?.(); onClose(); }
    },
    {
      id: 'api-key',
      label: 'Change API Key',
      description: 'Update your Gemini API key',
      icon: <Key className="w-4 h-4" />,
      category: 'actions',
      action: () => { onChangeAPIKey?.(); onClose(); }
    },

    // AI
    {
      id: 'ai-model',
      label: 'AI Model Settings',
      description: 'Change AI model',
      icon: <Bot className="w-4 h-4" />,
      category: 'ai',
      action: () => { onModelSettings?.(); onClose(); }
    },
    ...(hasDiffs ? [{
      id: 'view-diffs',
      label: 'View AI Changes',
      description: 'Review before/after code changes',
      icon: <ArrowLeftRight className="w-4 h-4" />,
      category: 'ai' as const,
      action: () => { onShowDiffViewer?.(); onClose(); }
    }] : []),
  ], [navigate, onClose, onNewProject, onViewChange, setTheme, onModelSettings, onDownloadProject, onStartTutorial, onChangeAPIKey, onGlobalSearch, onShowDiffViewer, hasDiffs]);

  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    const lowerSearch = search.toLowerCase();
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(lowerSearch) ||
      cmd.description?.toLowerCase().includes(lowerSearch) ||
      cmd.category.toLowerCase().includes(lowerSearch)
    );
  }, [commands, search]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    view: 'View',
    theme: 'Theme',
    actions: 'Actions',
    ai: 'AI'
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No commands found
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category} className="mb-2">
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {categoryLabels[category] || category}
                </div>
                {items.map((cmd) => {
                  flatIndex++;
                  const isSelected = flatIndex === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(flatIndex)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        isSelected
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className={isSelected ? 'text-primary' : 'text-gray-400'}>
                        {cmd.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-xs text-gray-400 truncate">{cmd.description}</div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">↵</kbd>
              Select
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Keyboard className="w-3 h-3" />
            <span>Ctrl+K to open</span>
          </div>
        </div>
      </div>
    </div>
  );
}
