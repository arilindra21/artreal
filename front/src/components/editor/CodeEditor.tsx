import { forwardRef, useRef, useEffect, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { Share2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface CodeEditorProps {
  selectedFile: {
    name: string;
    id: number;
    content: string;
    filepath: string;
  } | null;
  isTyping: boolean;
  onContentChange?: (content: string) => void;
  onAskAgent?: (data: { filepath: string; startLine: number; endLine: number; content: string; message: string }) => void;
}

// Get language from file extension
const getLanguage = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'tsx':
      return 'typescript'; // TypeScript React
    case 'ts':
      return 'typescript';
    case 'jsx':
      return 'javascript'; // JavaScript React
    case 'js':
      return 'javascript';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'html':
      return 'html';
    case 'md':
      return 'markdown';
    default:
      return 'typescript'; // Default to TypeScript for unknown files
  }
};

export const CodeEditor = forwardRef<HTMLDivElement, CodeEditorProps>(
  ({ selectedFile, isTyping, onContentChange, onAskAgent }, ref) => {
    const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof Monaco | null>(null);
    const { resolvedTheme } = useTheme();

    const [selection, setSelection] = useState<{
      rect: { top: number; left: number };
      visible: boolean;
      range: { startLine: number; endLine: number; content: string };
    }>({ rect: { top: 0, left: 0 }, visible: false, range: { startLine: 0, endLine: 0, content: '' } });

    const handleEditorDidMount: OnMount = (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Handle selection changes
      editor.onDidChangeCursorSelection((e) => {
        const selection = e.selection;
        const model = editor.getModel();

        if (selection.isEmpty() || !model) {
          setSelection(prev => ({ ...prev, visible: false }));
          return;
        }

        const selectedContent = model.getValueInRange(selection);
        if (!selectedContent.trim()) {
          setSelection(prev => ({ ...prev, visible: false }));
          return;
        }

        // Get coordinates for the selection
        const scrolledVisiblePosition = editor.getScrolledVisiblePosition(selection.getEndPosition());
        const domNode = editor.getDomNode();

        if (scrolledVisiblePosition && domNode) {
          // Adjust position so it's slight above or below the selection
          // We must implement proper positioning logic relative to the editor container
          const rect = domNode.getBoundingClientRect();
          setSelection({
            rect: {
              top: scrolledVisiblePosition.top + 20,
              left: scrolledVisiblePosition.left
            },
            visible: true,
            range: {
              startLine: selection.startLineNumber,
              endLine: selection.endLineNumber,
              content: selectedContent
            }
          });
        }
      });
      // Handle scrolling to hide/update widget position (simplified: hide on scroll)
      editor.onDidScrollChange(() => {
        setSelection(prev => ({ ...prev, visible: false }));
      });

      // ... existing configuration ...

      // Configure TypeScript compiler options
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.Latest,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: 'React',
        allowJs: true,
        typeRoots: ['node_modules/@types'],
        skipLibCheck: true,
        paths: {
          '@/*': ['./src/*']
        }
      });

      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.Latest,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        allowJs: true
      });

      // Add type definitions for all common libraries
      const typeDefinitions = `
        // React types
        declare module 'react' {
          export function useState<T>(initialState: T | (() => T)): [T, (value: T) => void];
          export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
          export function useRef<T>(initialValue: T): { current: T };
          export function useMemo<T>(factory: () => T, deps: any[]): T;
          export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
          export const Fragment: any;
          export default any;
          export interface FC<P = {}> {
            (props: P): any;
          }
          export interface SVGProps<T> {
            className?: string;
            style?: any;
            [key: string]: any;
          }
        }

        // Lucide React - allow all icon imports
        declare module 'lucide-react' {
          import { FC, SVGProps } from 'react';
          export type LucideIcon = FC<SVGProps<SVGSVGElement>>;
          const Icon: LucideIcon;
          export default Icon;
          export const Menu: LucideIcon;
          export const X: LucideIcon;
          export const Search: LucideIcon;
          export const User: LucideIcon;
          export const ShoppingBag: LucideIcon;
          export const ChevronRight: LucideIcon;
          export const ChevronDown: LucideIcon;
          export const File: LucideIcon;
          export const Folder: LucideIcon;
          export const MoreHorizontal: LucideIcon;
          export const Plus: LucideIcon;
          export const Trash2: LucideIcon;
          export const FilePlus: LucideIcon;
          export const Sparkles: LucideIcon;
          export const Settings: LucideIcon;
          export const Share2: LucideIcon;
          export const ChevronLeft: LucideIcon;
          export const PanelLeftClose: LucideIcon;
          export const PanelLeft: LucideIcon;
          export const Cloud: LucideIcon;
          export const Zap: LucideIcon;
          export const History: LucideIcon;
          export const Save: LucideIcon;
          export const FileText: LucideIcon;
          // Allow any other icon
          [key: string]: LucideIcon;
        }

        // Wildcard module declarations for common patterns
        declare module '@/*' {
          const content: any;
          export default content;
          export const [key: string]: any;
        }

        declare module '@/components/*' {
          const content: any;
          export default content;
        }

        declare module '@/hooks/*' {
          const content: any;
          export default content;
        }

        declare module '@/lib/*' {
          const content: any;
          export default content;
        }

        declare module '@/services/*' {
          const content: any;
          export default content;
        }

        // Allow all .css imports
        declare module '*.css' {
          const content: { [className: string]: string };
          export default content;
        }

        // Allow all image imports
        declare module '*.png' {
          const content: string;
          export default content;
        }
        declare module '*.jpg' {
          const content: string;
          export default content;
        }
        declare module '*.svg' {
          const content: string;
          export default content;
        }
      `;

      monaco.languages.typescript.typescriptDefaults.addExtraLib(typeDefinitions, 'file:///global.d.ts');

      // Configure diagnostics - disable module resolution errors
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
        diagnosticCodesToIgnore: [
          2792, // Cannot find module
          2307, // Cannot find module
          7027, // Unreachable code
          6133, // Unused variable
          6192, // All imports unused
          80001, // Implicit any
          8006  // 'interface' declarations can only be used in TypeScript files
        ]
      });

      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
        diagnosticCodesToIgnore: [2792, 2307, 7027, 6133, 6192, 80001, 8006]
      });
    };

    const handleEditorChange = (value: string | undefined) => {
      if (value !== undefined && !isTyping) {
        onContentChange?.(value);
      }
    };

    // Update editor content when file changes
    useEffect(() => {
      if (editorRef.current && selectedFile) {
        const currentValue = editorRef.current.getValue();
        if (currentValue !== selectedFile.content) {
          editorRef.current.setValue(selectedFile.content);
        }
      }
    }, [selectedFile?.id]);

    // Hide widget on file change
    useEffect(() => {
      setSelection(prev => ({ ...prev, visible: false }));
    }, [selectedFile?.id]);

    const language = selectedFile ? getLanguage(selectedFile.name) : 'plaintext';
    const value = selectedFile?.content || '// Select a file to view its contents';

    const [message, setMessage] = useState('');

    const handleAskAgent = () => {
      if (!message.trim() || !onAskAgent || !selectedFile) return;

      onAskAgent({
        filepath: selectedFile.filepath,
        startLine: selection.range.startLine,
        endLine: selection.range.endLine,
        content: selection.range.content,
        message: message
      });

      setMessage('');
      setSelection(prev => ({ ...prev, visible: false }));
    };

    return (
      <div ref={ref} className="h-full bg-white dark:bg-gray-950 relative group border-l border-border/30">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
          options={{
            readOnly: !selectedFile || isTyping,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'off',
            padding: { top: 16, bottom: 16 },
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            renderLineHighlight: 'gutter',
            lineDecorationsWidth: 8,
          }}
        />

        {/* Inline Ask Agent Widget */}
        {selection.visible && (
          <div
            className="fixed z-[9999] bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-border/50 dark:border-gray-700 shadow-xl rounded-2xl p-2.5 flex gap-2 items-center animate-in fade-in zoom-in-95 duration-200"
            style={{
              top: selection.rect.top,
              left: selection.rect.left + 50, // Slight offset
              maxWidth: '400px'
            }}
          >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAgent()}
              placeholder="Ask Agent about this code..."
              className="h-9 text-sm text-foreground bg-secondary/50 dark:bg-gray-700 border border-border/30 dark:border-gray-600 rounded-xl px-3 w-[260px] focus:ring-2 focus:ring-primary/30 focus:border-primary/30 focus:outline-none transition-all"
              autoFocus
            />
            <button
              onClick={handleAskAgent}
              className="h-9 w-9 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 flex items-center justify-center transition-all shadow-md shadow-primary/25"
            >
              <Share2 className="w-4 h-4 text-white -rotate-45 translate-y-0.5 -translate-x-0.5" />
            </button>
          </div>
        )}
      </div>
    );
  }
);

CodeEditor.displayName = 'CodeEditor';
