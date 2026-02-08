import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  RefreshCw,
  Smartphone,
  Tablet,
  Monitor,
  ExternalLink,
  Maximize2,
  Terminal,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Send,
  Copy,
  Check,
  Search
} from 'lucide-react';
import { loadProject, loadProjectFast, reloadProjectFiles, updateProjectFiles, isWebContainerReady } from '@/services/webcontainer';
import { initializeLogCapture } from '@/services/browserLogs';
import { API_URL } from '@/services/api';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

export interface SelectedElementData {
  elementId: string;
  tagName: string;
  className: string;
  selector: string;
  innerText: string;
  attributes: Record<string, string>;
  source?: {
    fileName: string;
    lineNumber: number;
  };
}

interface PreviewPanelProps {
  projectId: number;
  isLoading?: boolean;
  onReload?: () => void;
  onReportError?: (errorMessage: string) => void;
  onPreviewReady?: (url: string) => void;
  // Visual Editor Props
  isVisualMode?: boolean;
  onElementSelected?: (data: SelectedElementData) => void;
}

interface ConsoleLog {
  type: 'info' | 'log' | 'warn' | 'error';
  message: string;
  timestamp: string;
}

// Known compatibility issues with solutions
interface CompatibilityWarning {
  id: string;
  title: string;
  description: string;
  solution: string;
  codeExample?: string;
}

const KNOWN_ISSUES: Record<string, CompatibilityWarning> = {
  turbopack: {
    id: 'turbopack',
    title: 'Turbopack Compatibility Issue',
    description: 'Next.js 15+ uses Turbopack which requires native bindings not available in WebContainer. Preview automatically uses Next.js 14 for compatibility. Your actual code remains unchanged.',
    solution: 'This is auto-fixed in preview. Your code still uses the original Next.js version.',
  },
  wasm_bindings: {
    id: 'wasm_bindings',
    title: 'WASM Bindings Error',
    description: 'Some features require native bindings that are not supported in the browser-based WebContainer environment.',
    solution: 'The preview automatically downgrades Next.js for compatibility. Deploy to Vercel for full Next.js 15+ support.',
  }
};

export interface PreviewPanelRef {
  reload: () => void;
  handleRefresh: () => void;  // Preferred method for refreshing WebContainer
  updateStyle: (property: string, value: string) => void;
  captureAndSendScreenshot: () => Promise<boolean>;
  applyFileUpdates: (files: Array<{ path: string, content: string }>) => Promise<void>;
}

export const PreviewPanel = forwardRef<PreviewPanelRef, PreviewPanelProps>(
  ({ projectId, isLoading: externalLoading, onReload, onReportError, onPreviewReady, isVisualMode, onElementSelected }, ref) => {
    const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
    const [showConsole, setShowConsole] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isInitializing, setIsInitializing] = useState(true);
    const [initError, setInitError] = useState<string>('');
    const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
    const [urlCopied, setUrlCopied] = useState(false);
    const [isQuickInspect, setIsQuickInspect] = useState(false);
    const [detectedWarnings, setDetectedWarnings] = useState<CompatibilityWarning[]>([]);
    const [dismissedWarnings, setDismissedWarnings] = useState<Set<string>>(new Set());
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isVisualModeRef = useRef<boolean>(isVisualMode);

    const deviceWidths = {
      mobile: 'max-w-[375px]',
      tablet: 'max-w-[768px]',
      desktop: 'w-full',
    };

    // Detect known compatibility issues from log messages
    const detectKnownIssues = (message: string) => {
      // Turbopack / WASM bindings error
      if (message.includes('turbo.createProject') && message.includes('wasm bindings')) {
        setDetectedWarnings(prev => {
          if (!prev.find(w => w.id === 'turbopack')) {
            return [...prev, KNOWN_ISSUES.turbopack];
          }
          return prev;
        });
      }
      // General WASM bindings error
      else if (message.includes('not supported by the wasm bindings') && !message.includes('turbo')) {
        setDetectedWarnings(prev => {
          if (!prev.find(w => w.id === 'wasm_bindings')) {
            return [...prev, KNOWN_ISSUES.wasm_bindings];
          }
          return prev;
        });
      }
    };

    const addLog = (type: ConsoleLog['type'], message: string) => {
      const timestamp = new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      setConsoleLogs(prev => [...prev, { type, message, timestamp }]);

      // Check for known issues
      if (type === 'error' || message.toLowerCase().includes('error')) {
        detectKnownIssues(message);
      }
    };

    // Helper to filter out benign Vite errors that are expected during normal operation
    const isIgnorableError = (message: string) => {
      const ignoredPatterns = [
        'The build was canceled',  // Vite HMR restart (normal behavior)
      ];
      return ignoredPatterns.some(pattern => message.includes(pattern));
    };

    // Get only reportable errors (exclude ignorable ones)
    const getReportableErrors = () => {
      return consoleLogs.filter(log => log.type === 'error' && !isIgnorableError(log.message));
    };

    // Keep ref in sync with prop
    useEffect(() => {
      isVisualModeRef.current = isVisualMode;
    }, [isVisualMode]);

    // Communicate visual mode change to iframe
    // Also re-send when previewUrl changes (when WebContainer reloads)
    useEffect(() => {
      if (!iframeRef.current?.contentWindow || !previewUrl) return;

      // Send message multiple times with increasing delays to ensure it's received
      // This handles cases where the iframe is still loading
      const delays = [1000, 2000, 3000, 4000];
      const timers: NodeJS.Timeout[] = [];

      delays.forEach(delay => {
        const timer = setTimeout(() => {
          if (iframeRef.current?.contentWindow) {
            // eslint-disable-next-line no-console
            console.log(`[PreviewPanel] Sending visual-editor:toggle-mode (delay: ${delay}ms, enabled: ${isVisualMode})`);
            iframeRef.current.contentWindow.postMessage({
              type: 'visual-editor:toggle-mode',
              enabled: isVisualMode
            }, '*');
          }
        }, delay);
        timers.push(timer);
      });

      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }, [isVisualMode, previewUrl]);

    // Communicate Quick Inspect mode change to iframe
    useEffect(() => {
      if (!iframeRef.current?.contentWindow || !previewUrl) return;

      // Send message multiple times with increasing delays to ensure it's received
      const delays = [500, 1500, 2500];
      const timers: NodeJS.Timeout[] = [];

      delays.forEach(delay => {
        const timer = setTimeout(() => {
          if (iframeRef.current?.contentWindow) {
            console.log(`[PreviewPanel] Sending quick-inspect:toggle-mode (delay: ${delay}ms, enabled: ${isQuickInspect})`);
            iframeRef.current.contentWindow.postMessage({
              type: 'quick-inspect:toggle-mode',
              enabled: isQuickInspect
            }, '*');
          }
        }, delay);
        timers.push(timer);
      });

      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }, [isQuickInspect, previewUrl]);

    // Listen for browser logs AND visual editor events from the iframe
    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        // Security: verify the message is from our WebContainer (roughly)
        // Ideally we check origin, but WebContainer origin is dynamic

        if (event.data?.type === 'console-log') {
          const { logType, message } = event.data;
          addLog(logType as ConsoleLog['type'], message);
        } else if (event.data?.type === 'quick-inspect:copied') {
          // Show toast or feedback that classes were copied
          addLog('info', `📋 Copied: ${event.data.classes}`);
        } else if (event.data?.type === 'visual-editor:selected') {
          const { elementId, tagName, className, selector, innerText, attributes, source } = event.data;
          if (onElementSelected) {
            onElementSelected({
              elementId,
              tagName,
              className,
              selector,
              innerText,
              attributes,
              source
            });
          }
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, [onElementSelected]);

    const captureScreenshot = async (): Promise<string | null> => {
      // Wait a bit to ensure iframe is fully loaded
      if (!iframeRef.current?.contentWindow) {
        console.error('[Screenshot] Iframe ref not available');
        return null;
      }

      // For WebContainer iframe (cross-origin), we can't check readyState
      // Just wait a moment to ensure it's ready
      console.log('[Screenshot] Waiting 2s for iframe content to load...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        console.log('[Screenshot] Requesting screenshot from WebContainer via postMessage...');
        console.log('[Screenshot] Iframe URL:', iframeRef.current.src);

        // Create a promise that resolves when we receive the screenshot
        const screenshotPromise = new Promise<string | null>((resolve) => {
          const timeoutId = setTimeout(() => {
            console.error('[Screenshot] Timeout waiting for response');
            cleanup();
            resolve(null);
          }, 15000); // Increased to 15 second timeout

          const handleMessage = (event: MessageEvent) => {
            console.log('[Screenshot] Received message:', event.data.type, 'from:', event.origin);
            if (event.data.type === 'screenshot-captured') {
              console.log('[Screenshot] Received screenshot from WebContainer');
              cleanup();
              resolve(event.data.data);
            } else if (event.data.type === 'screenshot-error') {
              console.error('[Screenshot] Error from WebContainer:', event.data.error);
              cleanup();
              resolve(null);
            }
          };

          const cleanup = () => {
            clearTimeout(timeoutId);
            window.removeEventListener('message', handleMessage);
          };

          window.addEventListener('message', handleMessage);

          // Send capture request to iframe after listener is set up
          // Use a small delay to ensure listener is registered
          setTimeout(() => {
            console.log('[Screenshot] Sending capture-screenshot message to iframe');
            iframeRef.current?.contentWindow?.postMessage({ type: 'capture-screenshot' }, '*');
          }, 100);
        });

        return await screenshotPromise;
      } catch (error) {
        console.error('[Screenshot] Capture failed:', error);
        return null;
      }
    };

    const sendScreenshotToBackend = async (screenshotData: string) => {
      try {
        console.log('[Screenshot] Sending to backend...');
        const response = await fetch(`${API_URL}/projects/${projectId}/thumbnail/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ thumbnail: screenshotData }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save thumbnail: ${response.status}`);
        }

        console.log('[Screenshot] Successfully saved to backend');
        addLog('log', '✓ Project thumbnail captured');
      } catch (error) {
        console.error('[Screenshot] Failed to send to backend:', error);
        addLog('error', `✗ Failed to save thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    const initializeWebContainer = async () => {
      setIsInitializing(true);
      setInitError('');
      setConsoleLogs([]);
      setPreviewUrl('');
      setDetectedWarnings([]);
      setDismissedWarnings(new Set());

      // Use fast loading if WebContainer is pre-warmed
      const useFastLoad = isWebContainerReady();
      addLog('info', useFastLoad
        ? '[WebContainer] Using pre-warmed container ⚡'
        : '[WebContainer] Initializing...'
      );

      try {
        // Use loadProjectFast for pre-warmed container, fallback to loadProject
        const loadFn = useFastLoad ? loadProjectFast : loadProject;
        const result = await loadFn(
          projectId,
          (msg) => {
            // Determine log type from message
            if (msg.includes('ERROR') || msg.includes('error')) {
              addLog('error', msg);
            } else if (msg.includes('WARN') || msg.includes('warn')) {
              addLog('warn', msg);
            } else {
              addLog('info', msg);
            }
          },
          (msg) => {
            addLog('error', msg);
          }
        );

        setPreviewUrl(result.url);
        addLog('log', `✓ Application ready at ${result.url}`);
        setIsInitializing(false);

        // Notify parent component that preview is ready
        if (onPreviewReady) {
          onPreviewReady(result.url);
        }

        // Capture screenshot after preview is fully loaded (for first load)
        // Wait for iframe to be available and loaded
        setTimeout(async () => {
          console.log('[Screenshot] Attempting to capture project thumbnail...');

          // Wait for iframe to be available
          let attempts = 0;
          while (!iframeRef.current && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
          }

          if (!iframeRef.current) {
            console.error('[Screenshot] Iframe ref not available after waiting');
            return;
          }

          console.log('[Screenshot] Iframe ref is available, waiting 5s for screenshot helper to be ready...');
          // Wait additional time for screenshot helper to load and register listener
          await new Promise(resolve => setTimeout(resolve, 5000));

          console.log('[Screenshot] Proceeding with capture');
          const screenshot = await captureScreenshot();
          if (screenshot) {
            await sendScreenshotToBackend(screenshot);
          } else {
            console.log('[Screenshot] Initial capture failed, will try again on next load');
          }
        }, 3000); // Wait 3 seconds for iframe to be created, then wait 5 more for helper
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        setInitError(errorMsg);
        addLog('error', `✗ Failed to initialize: ${errorMsg}`);
        setIsInitializing(false);
      }
    };

    useEffect(() => {
      initializeWebContainer();
    }, [projectId]);

    // Initialize browser log capture when component mounts
    useEffect(() => {
      console.log('[PreviewPanel] Initializing browser log capture listener');
      initializeLogCapture();
    }, []);

    // Lightweight reload: only update files without reinstalling or restarting
    const reloadFiles = async () => {
      if (!previewUrl) {
        // If not initialized yet, do full initialization
        initializeWebContainer();
        return;
      }

      addLog('info', '[WebContainer] Reloading files...');

      try {
        await reloadProjectFiles(
          projectId,
          (msg) => {
            addLog('info', msg);
          }
        );
        addLog('log', '✓ Files reloaded successfully');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        addLog('error', `✗ Failed to reload files: ${errorMsg}`);
      }
    };

    // Define handleRefresh first so it can be referenced
    const handleRefresh = () => {
      if (onReload) {
        onReload();
      }
      initializeWebContainer();
    };

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      reload: async () => {
        // Lightweight reload - just reinitialize WebContainer
        handleRefresh();

        // After reload, re-apply visual mode if it's enabled
        // Send multiple times to ensure it's received
        // Use ref to get current value, not the captured prop value
        if (isVisualModeRef.current) {
          const delays = [2000, 3000, 4000, 5000];
          delays.forEach(delay => {
            setTimeout(() => {
              if (iframeRef.current?.contentWindow) {
                // eslint-disable-next-line no-console
                console.log(`[PreviewPanel] reload() sending visual-editor:toggle-mode (delay: ${delay}ms)`);
                iframeRef.current.contentWindow.postMessage({
                  type: 'visual-editor:toggle-mode',
                  enabled: true
                }, '*');
              }
            }, delay);
          });
        }
      },
      handleRefresh,  // Expose handleRefresh directly
      updateStyle: (property: string, value: string) => {
        if (!iframeRef.current?.contentWindow) return;
        iframeRef.current.contentWindow.postMessage({
          type: 'visual-editor:update-style',
          property,
          value
        }, '*');
      },
      captureAndSendScreenshot: async () => {
        console.log('[PreviewPanel] Manual screenshot capture requested');
        const screenshot = await captureScreenshot();
        if (screenshot) {
          await sendScreenshotToBackend(screenshot);
          return true;
        }
        return false;
        return false;
      },
      applyFileUpdates: async (files: Array<{ path: string, content: string }>) => {
        try {
          await updateProjectFiles(files, (msg) => {
            if (msg.includes('ERROR')) addLog('error', msg);
            else addLog('info', msg);
          });

          // If we're in visual mode, re-send visual mode state after update
          // Send multiple times to ensure it's received after HMR
          // Use ref to get current value
          if (isVisualModeRef.current && iframeRef.current?.contentWindow) {
            const delays = [500, 1000, 1500, 2000];
            delays.forEach(delay => {
              setTimeout(() => {
                if (iframeRef.current?.contentWindow) {
                  // eslint-disable-next-line no-console
                  console.log(`[PreviewPanel] applyFileUpdates() sending visual-editor:toggle-mode (delay: ${delay}ms)`);
                  iframeRef.current.contentWindow.postMessage({
                    type: 'visual-editor:toggle-mode',
                    enabled: true
                  }, '*');
                }
              }, delay);
            });
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          addLog('error', `[Push] Update failed: ${msg}`);
        }
      }
    }));

    const getLogIcon = (type: ConsoleLog['type']) => {
      switch (type) {
        case 'error':
          return <AlertCircle className="w-3 h-3 text-red-400" />;
        case 'warn':
          return <AlertCircle className="w-3 h-3 text-yellow-400" />;
        case 'info':
          return <CheckCircle2 className="w-3 h-3 text-blue-400" />;
        default:
          return <span className="text-muted-foreground">›</span>;
      }
    };

    const handleReportErrors = () => {
      const errors = getReportableErrors();
      if (errors.length === 0) {
        return;
      }

      const errorReport = errors.map(err => `[${err.timestamp}] ${err.message}`).join('\n');
      const fullReport = `[BUG FIX] I found ${errors.length} error(s) in the console:\n\n${errorReport}\n\nPlease help me fix these errors.`;

      if (onReportError) {
        onReportError(fullReport);
      }
    };

    const handleCopyUrl = async () => {
      if (!previewUrl) return;

      try {
        await navigator.clipboard.writeText(previewUrl);
        setUrlCopied(true);
        setTimeout(() => setUrlCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    };

    const handleFullscreen = () => {
      const element = containerRef.current;
      if (!element) return;

      if (!document.fullscreenElement) {
        element.requestFullscreen().catch(err => {
          console.error('Error attempting to enable fullscreen:', err);
        });
      } else {
        document.exitFullscreen();
      }
    };

    const isLoading = externalLoading || isInitializing;

    return (
      <div ref={containerRef} className="h-full flex flex-col bg-gradient-to-br from-slate-100 to-slate-50 dark:from-gray-900 dark:to-gray-950">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-white/80 dark:bg-gray-900 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 hover:bg-secondary rounded-xl transition-all text-muted-foreground hover:text-foreground disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Device Toggle - iOS Segmented Control */}
            <div className="flex items-center bg-secondary/60 rounded-xl p-1 border border-border/30">
              <button
                onClick={() => setDevice('mobile')}
                className={`p-1.5 rounded-lg transition-all duration-200 ${device === 'mobile' ? 'bg-white dark:bg-gray-700 text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                title="Mobile view"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevice('tablet')}
                className={`p-1.5 rounded-lg transition-all duration-200 ${device === 'tablet' ? 'bg-white dark:bg-gray-700 text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                title="Tablet view"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevice('desktop')}
                className={`p-1.5 rounded-lg transition-all duration-200 ${device === 'desktop' ? 'bg-white dark:bg-gray-700 text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                title="Desktop view"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* URL Bar - iOS Style */}
          <div className="flex-1 mx-4">
            <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-4 py-2 max-w-md mx-auto border border-border/30">
              <div className={`w-2 h-2 rounded-full ${previewUrl ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`} />
              <span className="text-xs text-muted-foreground truncate font-medium">
                {previewUrl || 'Initializing...'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-secondary/50 rounded-xl p-1">
            {/* Quick Inspect Toggle */}
            <button
              onClick={() => setIsQuickInspect(!isQuickInspect)}
              className={`p-2 rounded-lg transition-all relative ${isQuickInspect ? 'bg-violet-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-gray-700'
                }`}
              title={isQuickInspect ? "Disable Quick Inspect" : "Enable Quick Inspect - hover to see classes"}
            >
              <Search className="w-4 h-4" />
              {isQuickInspect && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setShowConsole(!showConsole)}
              className={`p-2 rounded-lg transition-all relative ${showConsole ? 'bg-white dark:bg-gray-700 text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              title="Toggle console"
            >
              <Terminal className="w-4 h-4" />
              {getReportableErrors().length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>

            <button
              onClick={handleFullscreen}
              className="p-2 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded-lg transition-all text-muted-foreground hover:text-foreground"
              title="Toggle fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview and Console Area */}
        <ResizablePanelGroup id="preview-console-panel-group" direction="vertical" className="flex-1">
          {/* Preview Area */}
          <ResizablePanel id="preview-iframe-panel" defaultSize={showConsole ? 85 : 100} minSize={40}>
            <div className="h-full overflow-auto flex flex-col bg-gradient-to-br from-slate-100 via-slate-50 to-white">
              {/* Compatibility Warnings */}
              {detectedWarnings.filter(w => !dismissedWarnings.has(w.id)).map((warning) => (
                <div
                  key={warning.id}
                  className="mx-4 mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                          {warning.title}
                        </h4>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                          {warning.description}
                        </p>
                        <div className="mt-3">
                          <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                            {warning.solution}
                          </p>
                          {warning.codeExample && (
                            <div className="mt-2 p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg font-mono text-xs text-amber-900 dark:text-amber-200 overflow-x-auto">
                              <code>{warning.codeExample}</code>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setDismissedWarnings(prev => new Set([...prev, warning.id]))}
                      className="p-1 hover:bg-amber-200 dark:hover:bg-amber-800 rounded-lg transition-colors shrink-0"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Preview Container */}
              <div className="flex-1 p-6 flex justify-center">
              <div
                className={`${deviceWidths[device]} w-full h-full bg-white
                            rounded-2xl overflow-hidden shadow-2xl border border-border/20 transition-all duration-300`}
              >
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-white to-blue-50/30">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-blue-600 animate-pulse" />
                      <div className="absolute inset-1 rounded-xl bg-white flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground mb-1">
                        {isInitializing ? 'Starting WebContainer' : 'Loading Preview'}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2 justify-center">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                        {isInitializing ? 'Installing dependencies...' : 'Preparing...'}
                      </p>
                    </div>
                  </div>
                ) : initError ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-red-50 to-white p-8">
                    <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-sm text-red-600 font-semibold">Failed to start preview</p>
                    <p className="text-xs text-muted-foreground text-center max-w-md">
                      {initError}
                    </p>
                    <button
                      onClick={handleRefresh}
                      className="mt-4 px-6 py-2.5 bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-primary/25"
                    >
                      Retry
                    </button>
                  </div>
                ) : previewUrl ? (
                  <iframe
                    ref={iframeRef}
                    src={previewUrl}
                    className="w-full h-full border-0"
                    title="Preview"
                    allow="cross-origin-isolated"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gradient-to-br from-white to-slate-50">
                    <p className="text-sm text-muted-foreground">No preview available</p>
                  </div>
                )}
              </div>
              </div>
            </div>
          </ResizablePanel>

          {/* Console */}
          {showConsole && (
            <>
              <ResizableHandle />
              <ResizablePanel id="console-panel" defaultSize={15} minSize={10} maxSize={50}>
                <div className="h-full border-t border-border/30 bg-white dark:bg-gray-950 flex flex-col">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-white/80 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground">Console</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-secondary text-muted-foreground font-medium">
                          {consoleLogs.length}
                        </span>
                        {getReportableErrors().length > 0 && (
                          <span className="text-xs px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium">
                            {getReportableErrors().length} errors
                          </span>
                        )}
                        {consoleLogs.filter(l => l.type === 'warn').length > 0 && (
                          <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-medium">
                            {consoleLogs.filter(l => l.type === 'warn').length} warnings
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getReportableErrors().length > 0 && (
                        <button
                          onClick={handleReportErrors}
                          className="text-xs px-3 py-1.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-xl transition-all text-red-600 dark:text-red-400 flex items-center gap-1.5 font-medium"
                          title="Send browser errors to AI for fixing"
                        >
                          <Send className="w-3 h-3" />
                          Report to AI
                        </button>
                      )}
                      <button
                        onClick={() => setConsoleLogs([])}
                        className="text-xs px-3 py-1.5 hover:bg-secondary rounded-xl transition-all text-muted-foreground font-medium"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setShowConsole(false)}
                        className="p-1.5 hover:bg-secondary rounded-lg transition-all"
                      >
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 p-3 font-mono text-xs space-y-1 overflow-auto">
                    {consoleLogs.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground/50">
                        No console output
                      </div>
                    ) : (
                      consoleLogs.map((log, i) => (
                        <div key={i} className="flex items-start gap-2 hover:bg-secondary/50 dark:hover:bg-gray-800/50 px-2 py-1 rounded-lg transition-colors">
                          <span className="text-gray-400 dark:text-gray-500 w-20 shrink-0 font-mono">{log.timestamp}</span>
                          <span className="shrink-0">{getLogIcon(log.type)}</span>
                          <span className={`flex-1 break-all ${log.type === 'error' ? 'text-red-600 dark:text-red-400' :
                            log.type === 'warn' ? 'text-amber-600 dark:text-amber-400' :
                              'text-foreground'
                            }`}>{log.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    );
  }
);

PreviewPanel.displayName = 'PreviewPanel';
