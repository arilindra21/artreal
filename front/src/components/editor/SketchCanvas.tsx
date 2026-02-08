import { useState, useRef, useCallback, useEffect } from 'react';
import { Sparkles, ZoomIn, ZoomOut, Grid3X3, Trash2, RotateCcw, Layers, X, FileCode2, Wand2, Info, Hand, Move } from 'lucide-react';
import { SketchElementComponent } from './SketchElement';
import { SketchToolbar } from './SketchToolbar';
import { SketchConnectionLine } from './SketchConnection';
import { SketchTemplates } from './SketchTemplates';
import {
  SketchElement,
  SketchConnection,
  SketchCanvasData,
  SketchElementType,
  SketchTemplate,
  createSketchElement,
  createSketchConnection,
  buildSketchPrompt,
  snapToGrid,
  applyTemplate,
} from './sketch-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SketchCanvasProps {
  onGenerateFromSketch?: (prompt: string, canvasData: SketchCanvasData) => void;
}

const DEFAULT_GRID_SIZE = 20;
const DEFAULT_CANVAS_SIZE = { width: 1400, height: 900 };

export const SketchCanvas: React.FC<SketchCanvasProps> = ({ onGenerateFromSketch }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<SketchElement[]>([]);
  const [connections, setConnections] = useState<SketchConnection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize] = useState(DEFAULT_GRID_SIZE);
  const [canvasSize] = useState(DEFAULT_CANVAS_SIZE);

  // Connection drawing state
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [tempConnectionEnd, setTempConnectionEnd] = useState<{ x: number; y: number } | null>(null);

  // History for undo
  const [history, setHistory] = useState<{ elements: SketchElement[]; connections: SketchConnection[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Templates modal
  const [showTemplates, setShowTemplates] = useState(false);

  // Generate modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [componentName, setComponentName] = useState('');

  // Pan/scroll state
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOffsetStartRef = useRef({ x: 0, y: 0 });

  // Save state to history
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ elements: [...elements], connections: [...connections] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [elements, connections, history, historyIndex]);

  // Add element to canvas
  const handleAddElement = useCallback((type: SketchElementType) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    // Place element in center of visible canvas area
    const centerX = snapToGrid((canvasRect.width / 2 / scale) - 100, gridSize);
    const centerY = snapToGrid((canvasRect.height / 2 / scale) - 50, gridSize);

    const newElement = createSketchElement(type, { x: centerX, y: centerY }, elements);
    setElements(prev => [...prev, newElement]);
    setSelectedId(newElement.id);
    saveToHistory();
  }, [elements, scale, gridSize, saveToHistory]);

  // Handle element selection
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    // If we're drawing a connection and click another element, complete the connection
    if (connectionStart && connectionStart !== id) {
      const newConnection = createSketchConnection(connectionStart, id);
      setConnections(prev => [...prev, newConnection]);
      setConnectionStart(null);
      setTempConnectionEnd(null);
      saveToHistory();
    }
  }, [connectionStart, saveToHistory]);

  // Handle element move
  const handleMove = useCallback((id: string, position: { x: number; y: number }) => {
    setElements(prev => prev.map(el =>
      el.id === id ? { ...el, position } : el
    ));
  }, []);

  // Handle element resize
  const handleResize = useCallback((id: string, size: { width: number; height: number }) => {
    setElements(prev => prev.map(el =>
      el.id === id ? { ...el, size } : el
    ));
  }, []);

  // Handle label change
  const handleLabelChange = useCallback((id: string, label: string) => {
    setElements(prev => prev.map(el =>
      el.id === id ? { ...el, label } : el
    ));
    saveToHistory();
  }, [saveToHistory]);

  // Handle element delete
  const handleDelete = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setConnections(prev => prev.filter(conn => conn.fromId !== id && conn.toId !== id));
    setSelectedId(null);
    saveToHistory();
  }, [saveToHistory]);

  // Handle AI details change
  const handleAiDetailsChange = useCallback((id: string, details: string) => {
    setElements(prev => prev.map(el =>
      el.id === id ? { ...el, aiDetails: details } : el
    ));
    saveToHistory();
  }, [saveToHistory]);

  // Handle connection start
  const handleConnectionStart = useCallback((id: string) => {
    setConnectionStart(id);
  }, []);

  // Handle connection delete
  const handleConnectionDelete = useCallback((id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
    saveToHistory();
  }, [saveToHistory]);

  // Handle canvas click (deselect)
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('canvas-grid')) {
      setSelectedId(null);
      if (connectionStart) {
        setConnectionStart(null);
        setTempConnectionEnd(null);
      }
    }
  }, [connectionStart]);

  // Handle mouse move for temp connection line
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (connectionStart && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setTempConnectionEnd({
        x: (e.clientX - rect.left) / scale,
        y: (e.clientY - rect.top) / scale,
      });
    }
  }, [connectionStart, scale]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId && !(e.target instanceof HTMLInputElement)) {
          handleDelete(selectedId);
        }
      }
      if (e.key === 'Escape') {
        setSelectedId(null);
        setConnectionStart(null);
        setTempConnectionEnd(null);
      }
      // Undo: Ctrl+Z
      if (e.ctrlKey && e.key === 'z') {
        if (historyIndex > 0) {
          const prevState = history[historyIndex - 1];
          setElements(prevState.elements);
          setConnections(prevState.connections);
          setHistoryIndex(historyIndex - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, handleDelete, history, historyIndex]);

  // Clear canvas
  const handleClear = useCallback(() => {
    saveToHistory();
    setElements([]);
    setConnections([]);
    setSelectedId(null);
  }, [saveToHistory]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setElements(prevState.elements);
      setConnections(prevState.connections);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  // Pan handlers
  const handlePanStart = useCallback((e: React.MouseEvent) => {
    // Start panning with middle mouse button or when space is pressed
    if (e.button === 1 || spacePressed) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
      panOffsetStartRef.current = { ...panOffset };
      document.body.style.cursor = 'grabbing';
    }
  }, [spacePressed, panOffset]);

  const handlePanMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;

    const deltaX = e.clientX - panStartRef.current.x;
    const deltaY = e.clientY - panStartRef.current.y;

    setPanOffset({
      x: panOffsetStartRef.current.x + deltaX,
      y: panOffsetStartRef.current.y + deltaY,
    });
  }, [isPanning]);

  const handlePanEnd = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      document.body.style.cursor = spacePressed ? 'grab' : 'default';
    }
  }, [isPanning, spacePressed]);

  // Reset pan
  const handleResetPan = useCallback(() => {
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Keyboard events for space key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setSpacePressed(true);
        document.body.style.cursor = 'grab';
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
        if (!isPanning) {
          document.body.style.cursor = 'default';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPanning]);

  // Mouse wheel to pan (with Shift for horizontal)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    // If Ctrl is pressed, zoom instead of pan
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(s => Math.max(0.25, Math.min(2, s + delta)));
      return;
    }

    // Pan with mouse wheel
    setPanOffset(prev => ({
      x: prev.x - (e.shiftKey ? e.deltaY : e.deltaX),
      y: prev.y - (e.shiftKey ? e.deltaX : e.deltaY),
    }));
  }, []);

  // Open generate modal
  const handleOpenGenerateModal = useCallback(() => {
    if (elements.length === 0) return;

    // Try to infer component name from element labels
    const labels = elements.map(el => el.label.toLowerCase());
    let suggestedName = '';

    if (labels.some(l => l.includes('login') || l.includes('sign in'))) {
      suggestedName = 'LoginPage';
    } else if (labels.some(l => l.includes('register') || l.includes('sign up'))) {
      suggestedName = 'RegisterPage';
    } else if (labels.some(l => l.includes('dashboard'))) {
      suggestedName = 'Dashboard';
    } else if (labels.some(l => l.includes('contact'))) {
      suggestedName = 'ContactPage';
    } else if (labels.some(l => l.includes('pricing'))) {
      suggestedName = 'PricingPage';
    } else if (labels.some(l => l.includes('profile'))) {
      suggestedName = 'ProfilePage';
    } else if (elements.some(el => el.type === 'hero')) {
      suggestedName = 'LandingPage';
    }

    setComponentName(suggestedName);
    setShowGenerateModal(true);
  }, [elements]);

  // Generate from sketch (called from modal)
  const handleGenerate = useCallback(() => {
    if (elements.length === 0) return;

    const canvasData: SketchCanvasData = {
      elements,
      connections,
      canvasSize,
      gridSize,
    };

    const prompt = buildSketchPrompt(canvasData, componentName || undefined);
    onGenerateFromSketch?.(prompt, canvasData);
    setShowGenerateModal(false);
    setComponentName('');
  }, [elements, connections, canvasSize, gridSize, onGenerateFromSketch, componentName]);

  // Apply template
  const handleApplyTemplate = useCallback((template: SketchTemplate) => {
    saveToHistory();
    const { elements: newElements, connections: newConnections } = applyTemplate(template);
    setElements(newElements);
    setConnections(newConnections);
    setSelectedId(null);
  }, [saveToHistory]);

  // Get element center for connection lines
  const getElementCenter = (elementId: string): { x: number; y: number } | null => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return null;
    return {
      x: element.position.x + element.size.width / 2,
      y: element.position.y + element.size.height / 2,
    };
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Canvas Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm">Sketch Canvas</span>
            <span className="text-xs text-muted-foreground">
              ({elements.length} elements, {connections.length} connections)
            </span>
          </div>

          {/* Templates Button */}
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-orange-500/25"
          >
            <Layers className="w-3.5 h-3.5" />
            Templates
          </button>

          {/* Pan Hint */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-lg text-[10px] text-muted-foreground">
            <Hand className="w-3 h-3" />
            <span>Space+Drag atau Scroll untuk geser</span>
          </div>
        </div>

        {/* Canvas Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-secondary/60 rounded-xl p-1">
            <button
              onClick={() => setScale(s => Math.max(0.25, s - 0.1))}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-muted-foreground hover:text-foreground"
              title="Zoom out (Ctrl+Scroll)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium px-2 min-w-[50px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(s => Math.min(2, s + 0.1))}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-muted-foreground hover:text-foreground"
              title="Zoom in (Ctrl+Scroll)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-xl transition-all ${
              showGrid
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
            }`}
            title="Toggle grid"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>

          {/* Reset Pan */}
          {(panOffset.x !== 0 || panOffset.y !== 0) && (
            <button
              onClick={handleResetPan}
              className="p-2 rounded-xl bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-white hover:shadow-sm transition-all"
              title="Reset pan position"
            >
              <Move className="w-4 h-4" />
            </button>
          )}

          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-xl bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-white hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Clear */}
          <button
            onClick={handleClear}
            disabled={elements.length === 0}
            className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Generate Button */}
          <button
            onClick={handleOpenGenerateModal}
            disabled={elements.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            Generate from Sketch
          </button>
        </div>
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b bg-gradient-to-r from-violet-500/10 to-purple-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Wand2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Generate Component</h2>
                    <p className="text-xs text-muted-foreground">AI will create code from your sketch</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Component Name Input */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Component/Page Name (optional)</Label>
                <Input
                  value={componentName}
                  onChange={(e) => setComponentName(e.target.value)}
                  placeholder="e.g., LoginPage, Dashboard, ContactForm"
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  Helps AI understand what you're building
                </p>
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-blue-700 dark:text-blue-300">AI akan otomatis:</p>
                    <ul className="text-blue-600 dark:text-blue-400 space-y-1 text-xs">
                      <li>• Membaca file existing untuk match design style</li>
                      <li>• Menggunakan color palette & typography yang sama</li>
                      <li>• Menambahkan routing di App.tsx jika perlu</li>
                      <li>• Menggunakan komponen yang sudah ada (buttons, inputs)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sketch Summary */}
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 mb-2">
                  <FileCode2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Sketch Summary</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>{elements.length} elements: {elements.map(e => e.type).join(', ')}</p>
                  {connections.length > 0 && <p>{connections.length} connections defined</p>}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-muted/30 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowGenerateModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white gap-2"
                onClick={handleGenerate}
              >
                <Sparkles className="w-4 h-4" />
                Generate Code
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar */}
        <SketchToolbar onAddElement={handleAddElement} />

        {/* Canvas Container */}
        <div
          ref={canvasRef}
          className={`flex-1 overflow-hidden relative ${spacePressed || isPanning ? 'cursor-grab' : ''} ${isPanning ? 'cursor-grabbing' : ''}`}
          onClick={!isPanning ? handleCanvasClick : undefined}
          onMouseDown={handlePanStart}
          onMouseMove={(e) => {
            handlePanMove(e);
            if (!isPanning) handleCanvasMouseMove(e);
          }}
          onMouseUp={handlePanEnd}
          onMouseLeave={handlePanEnd}
          onWheel={handleWheel}
        >
          {/* Pannable Canvas */}
          <div
            className="relative"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
              transformOrigin: 'top left',
              width: canvasSize.width,
              height: canvasSize.height,
            }}
          >
            {/* Grid Background */}
            {showGrid && (
              <div
                className="canvas-grid absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
                  `,
                  backgroundSize: `${gridSize}px ${gridSize}px`,
                }}
              />
            )}

            {/* SVG Layer for Connections */}
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: canvasSize.width, height: canvasSize.height }}
            >
              {/* Existing Connections */}
              {connections.map(conn => {
                const fromCenter = getElementCenter(conn.fromId);
                const toCenter = getElementCenter(conn.toId);
                if (!fromCenter || !toCenter) return null;

                return (
                  <SketchConnectionLine
                    key={conn.id}
                    connection={conn}
                    fromPoint={fromCenter}
                    toPoint={toCenter}
                    onDelete={() => handleConnectionDelete(conn.id)}
                  />
                );
              })}

              {/* Temporary Connection Line */}
              {connectionStart && tempConnectionEnd && (
                <line
                  x1={getElementCenter(connectionStart)?.x || 0}
                  y1={getElementCenter(connectionStart)?.y || 0}
                  x2={tempConnectionEnd.x}
                  y2={tempConnectionEnd.y}
                  stroke="#007AFF"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                />
              )}
            </svg>

            {/* Elements */}
            {elements.map(element => (
              <SketchElementComponent
                key={element.id}
                element={element}
                isSelected={selectedId === element.id}
                gridSize={gridSize}
                onSelect={handleSelect}
                onMove={handleMove}
                onResize={handleResize}
                onLabelChange={handleLabelChange}
                onDelete={handleDelete}
                onAiDetailsChange={handleAiDetailsChange}
                onConnectionStart={handleConnectionStart}
                canvasScale={scale}
              />
            ))}

            {/* Empty State */}
            {elements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-violet-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    Start Your Sketch
                  </h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Drag elements from the toolbar to build your wireframe.
                    Connect elements to define navigation flow.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connection Mode Indicator */}
      {connectionStart && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl shadow-lg animate-pulse">
          Click another element to connect, or press Escape to cancel
        </div>
      )}

      {/* Templates Modal */}
      <SketchTemplates
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleApplyTemplate}
      />
    </div>
  );
};

export default SketchCanvas;
