import { useState, useRef, useEffect } from 'react';
import {
  Menu, Sparkles, Square, MousePointer, Type, AlignLeft,
  Image, List, FileText, Minus, PanelLeft, LayoutGrid, X, GripVertical,
  Wand2, Loader2, Check, MessageSquare
} from 'lucide-react';
import { SketchElement as SketchElementType, SketchElementType as ElementType, snapToGrid } from './sketch-types';
import { API_URL } from '@/services/api';

interface SketchElementProps {
  element: SketchElementType;
  isSelected: boolean;
  gridSize: number;
  onSelect: (id: string) => void;
  onMove: (id: string, position: { x: number; y: number }) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
  onLabelChange: (id: string, label: string) => void;
  onDelete: (id: string) => void;
  onAiDetailsChange?: (id: string, details: string) => void;
  onConnectionStart?: (id: string) => void;
  canvasScale?: number;
}

const ELEMENT_ICONS: Record<ElementType, React.ReactNode> = {
  navbar: <Menu className="w-5 h-5" />,
  hero: <Sparkles className="w-5 h-5" />,
  card: <Square className="w-5 h-5" />,
  button: <MousePointer className="w-5 h-5" />,
  input: <Type className="w-5 h-5" />,
  text: <AlignLeft className="w-5 h-5" />,
  image: <Image className="w-5 h-5" />,
  list: <List className="w-5 h-5" />,
  form: <FileText className="w-5 h-5" />,
  footer: <Minus className="w-5 h-5" />,
  sidebar: <PanelLeft className="w-5 h-5" />,
  modal: <Square className="w-5 h-5" />,
  section: <LayoutGrid className="w-5 h-5" />,
};

const ELEMENT_COLORS: Record<ElementType, string> = {
  navbar: 'from-blue-500 to-blue-600',
  hero: 'from-purple-500 to-purple-600',
  card: 'from-emerald-500 to-emerald-600',
  button: 'from-orange-500 to-orange-600',
  input: 'from-cyan-500 to-cyan-600',
  text: 'from-slate-500 to-slate-600',
  image: 'from-pink-500 to-pink-600',
  list: 'from-indigo-500 to-indigo-600',
  form: 'from-violet-500 to-violet-600',
  footer: 'from-gray-500 to-gray-600',
  sidebar: 'from-teal-500 to-teal-600',
  modal: 'from-rose-500 to-rose-600',
  section: 'from-amber-500 to-amber-600',
};

export const SketchElementComponent: React.FC<SketchElementProps> = ({
  element,
  isSelected,
  gridSize,
  onSelect,
  onMove,
  onResize,
  onLabelChange,
  onDelete,
  onAiDetailsChange,
  onConnectionStart,
  canvasScale = 1,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // AI Details state
  const [showAiPopover, setShowAiPopover] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowAiPopover(false);
      }
    };

    if (showAiPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAiPopover]);

  // Generate AI details
  const generateAiDetails = async () => {
    if (!aiPrompt.trim() && !element.aiDetails) return;

    setIsGenerating(true);
    setAiError(null);

    try {
      const response = await fetch(`${API_URL}/sketch/element/details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          element_type: element.type,
          element_label: element.label,
          user_prompt: aiPrompt.trim() || `Describe this ${element.type} element`,
          existing_details: element.aiDetails || ''
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to generate details');
      }

      const data = await response.json();

      if (data.details && onAiDetailsChange) {
        onAiDetailsChange(element.id, data.details);
        setAiPrompt('');
        setShowAiPopover(false);
      }
    } catch (err) {
      console.error('AI details error:', err);
      setAiError(err instanceof Error ? err.message : 'Failed to generate details');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    e.stopPropagation();
    onSelect(element.id);

    setIsDragging(true);
    setDragStart({
      x: e.clientX / canvasScale - element.position.x,
      y: e.clientY / canvasScale - element.position.y,
    });
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.size.width,
      height: element.size.height,
    });
  };

  // Global mouse move and up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = snapToGrid(e.clientX / canvasScale - dragStart.x, gridSize);
        const newY = snapToGrid(e.clientY / canvasScale - dragStart.y, gridSize);
        onMove(element.id, { x: Math.max(0, newX), y: Math.max(0, newY) });
      }

      if (isResizing) {
        const deltaX = (e.clientX - resizeStart.x) / canvasScale;
        const deltaY = (e.clientY - resizeStart.y) / canvasScale;
        const newWidth = snapToGrid(Math.max(80, resizeStart.width + deltaX), gridSize);
        const newHeight = snapToGrid(Math.max(40, resizeStart.height + deltaY), gridSize);
        onResize(element.id, { width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, element.id, gridSize, canvasScale, onMove, onResize]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleLabelBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsEditing(false);
    onLabelChange(element.id, e.target.value || element.type);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onLabelChange(element.id, (e.target as HTMLInputElement).value || element.type);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={elementRef}
      className={`absolute select-none transition-shadow duration-200 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      } ${isSelected ? 'z-50' : ''}`}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        zIndex: isSelected ? 1000 : element.zIndex,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Element Container */}
      <div
        className={`w-full h-full rounded-xl border-2 flex flex-col items-center justify-center gap-2 backdrop-blur-sm transition-all duration-200 ${
          element.aiDetails
            ? 'border-solid bg-gradient-to-br from-violet-50/90 via-purple-50/90 to-pink-50/90 dark:from-violet-950/50 dark:via-purple-950/50 dark:to-pink-950/50'
            : 'border-dashed bg-white/80'
        } ${
          isSelected
            ? element.aiDetails
              ? 'border-purple-500 shadow-lg shadow-purple-500/30 ring-2 ring-purple-400/50'
              : 'border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/30'
            : element.aiDetails
              ? 'border-purple-400 hover:border-purple-500 hover:shadow-md hover:shadow-purple-500/20'
              : 'border-slate-300 hover:border-slate-400 hover:shadow-md'
        }`}
      >
        {/* Element Icon */}
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ELEMENT_COLORS[element.type]} flex items-center justify-center text-white shadow-md`}>
          {ELEMENT_ICONS[element.type]}
        </div>

        {/* Element Label */}
        {isEditing ? (
          <input
            type="text"
            defaultValue={element.label}
            onBlur={handleLabelBlur}
            onKeyDown={handleLabelKeyDown}
            autoFocus
            className="px-2 py-1 text-xs font-medium text-center bg-white border border-primary rounded-lg outline-none focus:ring-2 focus:ring-primary/30 w-[80%]"
          />
        ) : (
          <span className="text-xs font-medium text-slate-600 text-center px-2 truncate w-full">
            {element.label}
          </span>
        )}

        {/* AI Details Preview - Always visible inside shape */}
        {element.aiDetails && (
          <div className="w-[90%] px-2 py-1.5 bg-purple-100/80 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-[9px] text-purple-700 dark:text-purple-300 line-clamp-2 text-center italic">
              "{element.aiDetails}"
            </p>
          </div>
        )}

        {/* Element Type Badge */}
        <span className="absolute bottom-2 right-2 text-[10px] text-slate-400 uppercase font-semibold">
          {element.type}
        </span>

        {/* AI Details Badge with Tooltip */}
        {element.aiDetails && (
          <div className="absolute top-2 left-2 group/ai">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white text-[9px] font-medium shadow-md animate-pulse cursor-help">
              <Wand2 className="w-2.5 h-2.5" />
              <span>AI Enhanced</span>
            </div>
            {/* Tooltip with AI Details preview */}
            <div className="absolute left-0 top-full mt-1 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl opacity-0 invisible group-hover/ai:opacity-100 group-hover/ai:visible transition-all duration-200 z-[100] pointer-events-none">
              <div className="font-semibold text-purple-300 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI will generate:
              </div>
              <p className="text-gray-300 line-clamp-3">{element.aiDetails}</p>
              <div className="absolute -top-1 left-3 w-2 h-2 bg-gray-900 rotate-45" />
            </div>
          </div>
        )}
      </div>

      {/* Selection Controls */}
      {isSelected && (
        <>
          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(element.id);
            }}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-colors z-10"
          >
            <X className="w-3 h-3" />
          </button>

          {/* AI Details Button */}
          {onAiDetailsChange && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAiPopover(true);
              }}
              className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all z-10 ${
                element.aiDetails
                  ? 'bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'
                  : 'bg-gradient-to-br from-slate-400 to-slate-500 hover:from-violet-500 hover:to-purple-600'
              } text-white`}
              title={element.aiDetails ? 'Edit AI details' : 'Add AI details'}
            >
              <Wand2 className="w-3 h-3" />
            </button>
          )}

          {/* AI Details Popover */}
          {showAiPopover && (
            <div
              ref={popoverRef}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute left-0 -top-2 -translate-y-full w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-purple-500" />
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">AI Details</span>
                </div>
                <button
                  onClick={() => setShowAiPopover(false)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>

              {/* Element Info */}
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${ELEMENT_COLORS[element.type]} flex items-center justify-center text-white`}>
                    {ELEMENT_ICONS[element.type]}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{element.label}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{element.type}</p>
                  </div>
                </div>
              </div>

              {/* Current AI Details */}
              {element.aiDetails && (
                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                  <label className="text-[10px] font-medium text-purple-600 dark:text-purple-400 mb-1 block flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Current Details:
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3">{element.aiDetails}</p>
                </div>
              )}

              {/* Prompt Input */}
              <div className="p-3">
                <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                  {element.aiDetails ? 'Update details:' : 'Describe this element:'}
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={`e.g., "modern card with product image, title, price, and add to cart button"`}
                  className="w-full px-2.5 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                  rows={3}
                />

                {aiError && (
                  <p className="text-[10px] text-red-500 mt-1">{aiError}</p>
                )}

                <button
                  onClick={generateAiDetails}
                  disabled={isGenerating || (!aiPrompt.trim() && !element.aiDetails)}
                  className="w-full mt-2.5 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-xs font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      {element.aiDetails ? 'Regenerate Details' : 'Generate Details'}
                    </>
                  )}
                </button>

                {/* Quick suggestions */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {['modern', 'minimal', 'animated', 'dark theme'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setAiPrompt((prev) => prev ? `${prev}, ${tag}` : tag)}
                      className="px-2 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Connection Handle */}
          {onConnectionStart && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConnectionStart(element.id);
              }}
              className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center shadow-lg transition-colors z-10"
              title="Draw connection"
            >
              <GripVertical className="w-3 h-3" />
            </button>
          )}

          {/* Resize Handle */}
          <div
            onMouseDown={handleResizeStart}
            className="absolute -bottom-2 -right-2 w-5 h-5 bg-primary rounded-full cursor-se-resize shadow-lg flex items-center justify-center z-10"
          >
            <div className="w-2 h-2 border-r-2 border-b-2 border-white rotate-45 -translate-x-0.5 -translate-y-0.5" />
          </div>

          {/* Corner Resize Handles (visual only for now) */}
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full shadow" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full shadow" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full shadow" />
        </>
      )}
    </div>
  );
};

export default SketchElementComponent;
