import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Undo2, Check, ArrowLeftRight } from 'lucide-react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { cn } from '@/lib/utils';

export interface FileDiff {
  filepath: string;
  filename: string;
  original: string;
  modified: string;
}

interface DiffViewerProps {
  isOpen: boolean;
  onClose: () => void;
  diffs: FileDiff[];
  onAcceptAll?: () => void;
  onRevertAll?: () => void;
  onAcceptFile?: (filepath: string) => void;
  onRevertFile?: (filepath: string) => void;
}

export function DiffViewer({
  isOpen,
  onClose,
  diffs,
  onAcceptAll,
  onRevertAll,
  onAcceptFile,
  onRevertFile
}: DiffViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'inline'>('side-by-side');

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  if (!isOpen || diffs.length === 0) return null;

  const currentDiff = diffs[currentIndex];
  const hasChanges = currentDiff.original !== currentDiff.modified;

  const getLanguage = (filename: string) => {
    if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return 'typescript';
    if (filename.endsWith('.jsx') || filename.endsWith('.js')) return 'javascript';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.md')) return 'markdown';
    return 'plaintext';
  };

  const countChanges = (original: string, modified: string) => {
    const originalLines = original.split('\n');
    const modifiedLines = modified.split('\n');
    let additions = 0;
    let deletions = 0;

    // Simple line-based diff count
    const maxLines = Math.max(originalLines.length, modifiedLines.length);
    for (let i = 0; i < maxLines; i++) {
      if (originalLines[i] !== modifiedLines[i]) {
        if (i >= originalLines.length) additions++;
        else if (i >= modifiedLines.length) deletions++;
        else {
          additions++;
          deletions++;
        }
      }
    }

    return { additions, deletions };
  };

  const { additions, deletions } = countChanges(currentDiff.original, currentDiff.modified);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[95vw] h-[90vh] max-w-7xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="w-5 h-5 text-violet-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Changes Review
            </h2>
            <span className="px-2 py-0.5 text-xs font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full">
              {diffs.length} file{diffs.length > 1 ? 's' : ''} modified
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('side-by-side')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  viewMode === 'side-by-side'
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                Side by Side
              </button>
              <button
                onClick={() => setViewMode('inline')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  viewMode === 'inline'
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                Inline
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* File Navigation */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentIndex + 1} / {diffs.length}
            </span>
            <button
              onClick={() => setCurrentIndex(Math.min(diffs.length - 1, currentIndex + 1))}
              disabled={currentIndex === diffs.length - 1}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
              {currentDiff.filepath}
            </span>
            {hasChanges && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-600 dark:text-green-400">+{additions}</span>
                <span className="text-red-600 dark:text-red-400">-{deletions}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onRevertFile && (
              <button
                onClick={() => onRevertFile(currentDiff.filepath)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Undo2 className="w-3.5 h-3.5" />
                Revert
              </button>
            )}
            {onAcceptFile && (
              <button
                onClick={() => onAcceptFile(currentDiff.filepath)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Accept
              </button>
            )}
          </div>
        </div>

        {/* File Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 overflow-x-auto">
          {diffs.map((diff, index) => (
            <button
              key={diff.filepath}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap",
                index === currentIndex
                  ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <span>{diff.filename}</span>
              {diff.original !== diff.modified && (
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              )}
            </button>
          ))}
        </div>

        {/* Diff Editor */}
        <div className="flex-1 overflow-hidden">
          {hasChanges ? (
            <DiffEditor
              original={currentDiff.original}
              modified={currentDiff.modified}
              language={getLanguage(currentDiff.filename)}
              theme="vs-dark"
              options={{
                readOnly: true,
                renderSideBySide: viewMode === 'side-by-side',
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                diffWordWrap: 'on',
                renderOverviewRuler: false,
                renderIndicators: true,
                enableSplitViewResizing: true,
                originalEditable: false,
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Check className="w-12 h-12 mb-3 text-green-500" />
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">No changes in this file</p>
              <p className="text-sm">The file content is identical</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 bg-red-200 dark:bg-red-900/50 rounded"></span>
              Removed
            </span>
            <span className="inline-flex items-center gap-1 ml-4">
              <span className="w-3 h-3 bg-green-200 dark:bg-green-900/50 rounded"></span>
              Added
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onRevertAll && (
              <button
                onClick={onRevertAll}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Undo2 className="w-4 h-4" />
                Revert All Changes
              </button>
            )}
            {onAcceptAll && (
              <button
                onClick={onAcceptAll}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg transition-all shadow-sm hover:shadow-md"
              >
                <Check className="w-4 h-4" />
                Accept All Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
