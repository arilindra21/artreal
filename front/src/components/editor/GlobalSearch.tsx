import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, FileCode, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  filepath: string;
  filename: string;
  matches: {
    line: number;
    content: string;
    matchStart: number;
    matchEnd: number;
  }[];
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  files: { filepath: string; content: string }[];
  onResultClick: (filepath: string, line: number) => void;
}

export function GlobalSearch({ isOpen, onClose, files, onResultClick }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Perform search
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    // Search in all files
    const searchResults: SearchResult[] = [];
    const lowerQuery = searchQuery.toLowerCase();

    files.forEach(file => {
      const lines = file.content.split('\n');
      const matches: SearchResult['matches'] = [];

      lines.forEach((line, index) => {
        const lowerLine = line.toLowerCase();
        let matchIndex = lowerLine.indexOf(lowerQuery);

        if (matchIndex !== -1) {
          matches.push({
            line: index + 1,
            content: line.trim(),
            matchStart: matchIndex,
            matchEnd: matchIndex + searchQuery.length
          });
        }
      });

      if (matches.length > 0) {
        const filename = file.filepath.split('/').pop() || file.filepath;
        searchResults.push({
          filepath: file.filepath,
          filename,
          matches: matches.slice(0, 10) // Limit matches per file
        });
      }
    });

    // Sort by number of matches
    searchResults.sort((a, b) => b.matches.length - a.matches.length);

    setResults(searchResults.slice(0, 20)); // Limit total results
    setIsSearching(false);
    setSelectedIndex(0);
  }, [files]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const flatResults = results.flatMap(r => r.matches.map(m => ({ filepath: r.filepath, line: m.line })));

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, flatResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (flatResults[selectedIndex]) {
          onResultClick(flatResults[selectedIndex].filepath, flatResults[selectedIndex].line);
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [results, selectedIndex, onResultClick, onClose]);

  // Scroll selected into view
  useEffect(() => {
    const selected = resultsRef.current?.querySelector('[data-selected="true"]');
    selected?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Calculate total matches
  const totalMatches = results.reduce((acc, r) => acc + r.matches.length, 0);

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-violet-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search in all files..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm"
          />
          {isSearching && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="py-12 text-center text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Type at least 2 characters to search</p>
              <p className="text-xs mt-1 text-gray-500">Searches across all project files</p>
            </div>
          ) : results.length === 0 && !isSearching ? (
            <div className="py-12 text-center text-gray-400">
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-2">
              {results.map((result) => (
                <div key={result.filepath} className="mb-2">
                  {/* File header */}
                  <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                    <FileCode className="w-3.5 h-3.5" />
                    <span className="truncate">{result.filepath}</span>
                    <span className="ml-auto text-gray-400 dark:text-gray-500">
                      {result.matches.length} match{result.matches.length > 1 ? 'es' : ''}
                    </span>
                  </div>

                  {/* Matches */}
                  {result.matches.map((match) => {
                    flatIndex++;
                    const isSelected = flatIndex === selectedIndex;

                    return (
                      <button
                        key={`${result.filepath}-${match.line}`}
                        data-selected={isSelected}
                        onClick={() => {
                          onResultClick(result.filepath, match.line);
                          onClose();
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                          isSelected
                            ? "bg-violet-100 dark:bg-violet-900/30 text-violet-900 dark:text-violet-100"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                        )}
                      >
                        <span className="w-8 text-right text-xs font-mono text-gray-400">
                          {match.line}
                        </span>
                        <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                        <span className="flex-1 text-sm font-mono truncate">
                          {highlightMatch(match.content, query)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="text-xs text-gray-400">
              {totalMatches} result{totalMatches > 1 ? 's' : ''} in {results.length} file{results.length > 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">↵</kbd>
                Open
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to highlight matching text
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <>
      {before}
      <span className="bg-yellow-200 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-200 px-0.5 rounded">
        {match}
      </span>
      {after}
    </>
  );
}
