import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Wand2, AlignLeft, AlignCenter, AlignRight, AlignJustify, Check, Palette, Pipette, Paintbrush, Type, Move, Square, Sparkles, Settings2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { projectApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface DragInputProps {
    value: number;
    onChange: (value: number) => void;
    label?: string;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
}

const DragInput: React.FC<DragInputProps> = ({
    value,
    onChange,
    label,
    min = 0,
    max = 999,
    step = 1,
    unit = 'px'
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const [inputValue, setInputValue] = useState(String(value));
    const inputRef = useRef<HTMLInputElement>(null);
    const startXRef = useRef(0);
    const startValueRef = useRef(0);

    useEffect(() => {
        setLocalValue(value);
        setInputValue(String(value));
    }, [value]);

    // Focus input when entering edit mode
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isEditing) return;
        e.preventDefault();
        setIsDragging(true);
        startXRef.current = e.clientX;
        startValueRef.current = localValue;
        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';
    };

    const handleDoubleClick = () => {
        setIsEditing(true);
        setInputValue(String(localValue));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        const parsed = parseInt(inputValue, 10);
        if (!isNaN(parsed)) {
            const clamped = Math.max(min, Math.min(max, parsed));
            setLocalValue(clamped);
            onChange(clamped);
        }
        setIsEditing(false);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        } else if (e.key === 'Escape') {
            setInputValue(String(localValue));
            setIsEditing(false);
        }
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            // Calculate sensitivity based on modifier keys
            let sensitivity = 5; // Default: 5px mouse = 1 unit
            if (e.shiftKey) sensitivity = 1; // Shift: faster (1px = 1 unit)
            if (e.altKey) sensitivity = 20; // Alt: slower (20px = 1 unit)

            const delta = Math.floor((e.clientX - startXRef.current) / sensitivity) * step;
            const newValue = Math.max(min, Math.min(max, startValueRef.current + delta));
            setLocalValue(newValue);
            onChange(newValue);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, onChange, min, max, step]);

    // Edit mode - show input
    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className="h-8 w-14 px-1 text-center text-[11px] font-mono font-medium
                           bg-background border-2 border-primary rounded-md
                           focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
        );
    }

    // Normal mode - draggable with click to edit
    return (
        <div
            className={`
                h-8 w-14 px-1.5 flex items-center justify-center
                bg-background border-2 rounded-md
                cursor-ew-resize select-none
                transition-all duration-150
                ${isDragging
                    ? 'border-primary bg-primary/10 shadow-md shadow-primary/20 scale-105'
                    : 'border-border/50 hover:border-primary/50 hover:bg-muted/50'
                }
            `}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            title="Drag to adjust, double-click to type"
        >
            <span className={`text-[11px] font-mono font-medium ${isDragging ? 'text-primary' : 'text-foreground'}`}>
                {localValue}
            </span>
        </div>
    );
};

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label }) => {
    const [isOpen, setIsOpen] = useState(false);

    const presetColors = [
        // Row 1: Grayscale
        { color: '#000000', name: 'Black' },
        { color: '#374151', name: 'Gray 700' },
        { color: '#6b7280', name: 'Gray 500' },
        { color: '#9ca3af', name: 'Gray 400' },
        { color: '#d1d5db', name: 'Gray 300' },
        { color: '#ffffff', name: 'White' },
        // Row 2: Colors
        { color: '#ef4444', name: 'Red' },
        { color: '#f97316', name: 'Orange' },
        { color: '#eab308', name: 'Yellow' },
        { color: '#22c55e', name: 'Green' },
        { color: '#06b6d4', name: 'Cyan' },
        { color: '#3b82f6', name: 'Blue' },
        // Row 3: More colors
        { color: '#6366f1', name: 'Indigo' },
        { color: '#8b5cf6', name: 'Violet' },
        { color: '#a855f7', name: 'Purple' },
        { color: '#d946ef', name: 'Fuchsia' },
        { color: '#ec4899', name: 'Pink' },
        { color: '#f43f5e', name: 'Rose' },
    ];

    const isLightColor = (hex: string) => {
        if (!hex || !hex.startsWith('#')) return false;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 155;
    };

    const displayValue = value || '';
    const hasValue = displayValue && displayValue !== 'inherit' && displayValue !== 'transparent';

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    className={`
                        w-full h-10 px-3 flex items-center gap-3
                        rounded-lg border-2 transition-all duration-200
                        hover:border-primary/50 hover:shadow-sm
                        ${isOpen ? 'border-primary shadow-md' : 'border-border'}
                        ${hasValue ? 'bg-gradient-to-r from-background to-muted/30' : 'bg-muted/30'}
                    `}
                >
                    {/* Color Preview Circle */}
                    <div className="relative">
                        <div
                            className={`
                                w-7 h-7 rounded-full shadow-inner
                                ring-2 ring-offset-2 ring-offset-background
                                transition-all duration-200
                                ${hasValue ? 'ring-primary/30' : 'ring-border'}
                            `}
                            style={{
                                background: hasValue
                                    ? displayValue
                                    : 'linear-gradient(135deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%), linear-gradient(135deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%)',
                                backgroundSize: hasValue ? 'auto' : '8px 8px',
                                backgroundPosition: hasValue ? 'auto' : '0 0, 4px 4px'
                            }}
                        />
                        {hasValue && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                                <Check className="w-2 h-2 text-primary-foreground" />
                            </div>
                        )}
                    </div>

                    {/* Color Value */}
                    <div className="flex-1 text-left">
                        <span className={`text-xs font-medium ${hasValue ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {hasValue ? displayValue.toUpperCase() : 'Pick a color'}
                        </span>
                    </div>

                    {/* Icon */}
                    <Palette className={`w-4 h-4 transition-colors ${isOpen ? 'text-primary' : 'text-muted-foreground'}`} />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0 overflow-hidden" align="start">
                {/* Header with large preview */}
                <div className="p-4 bg-gradient-to-br from-muted/50 to-muted border-b">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-14 h-14 rounded-xl shadow-lg ring-4 ring-background"
                            style={{
                                background: hasValue
                                    ? displayValue
                                    : 'linear-gradient(135deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%), linear-gradient(135deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%)',
                                backgroundSize: hasValue ? 'auto' : '12px 12px',
                                backgroundPosition: hasValue ? 'auto' : '0 0, 6px 6px'
                            }}
                        />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">
                                {hasValue ? 'Selected Color' : 'No Color'}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                                {hasValue ? displayValue.toUpperCase() : 'transparent'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {/* Custom Color Input */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium flex items-center gap-1.5">
                            <Pipette className="w-3 h-3" />
                            Custom Color
                        </Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">#</span>
                                <Input
                                    value={displayValue.replace('#', '')}
                                    onChange={(e) => {
                                        const hex = e.target.value.replace('#', '');
                                        if (/^[0-9A-Fa-f]{0,6}$/.test(hex)) {
                                            onChange(`#${hex}`);
                                        }
                                    }}
                                    className="h-9 text-xs font-mono pl-7 uppercase"
                                    placeholder="000000"
                                    maxLength={6}
                                />
                            </div>
                            <div className="relative">
                                <input
                                    type="color"
                                    value={displayValue.startsWith('#') && displayValue.length === 7 ? displayValue : '#000000'}
                                    onChange={(e) => onChange(e.target.value)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div
                                    className="h-9 w-9 rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors flex items-center justify-center"
                                    style={{ background: hasValue ? displayValue : undefined }}
                                >
                                    {!hasValue && <Palette className="w-4 h-4 text-muted-foreground" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preset Colors */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium">Preset Colors</Label>
                        <div className="grid grid-cols-6 gap-1.5">
                            {presetColors.map(({ color, name }) => {
                                const isSelected = displayValue.toLowerCase() === color.toLowerCase();
                                const isLight = isLightColor(color);
                                return (
                                    <button
                                        key={color}
                                        className={`
                                            w-9 h-9 rounded-lg transition-all duration-200
                                            hover:scale-110 hover:shadow-lg hover:z-10
                                            flex items-center justify-center
                                            ${isSelected
                                                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 shadow-lg z-10'
                                                : 'hover:ring-2 hover:ring-primary/30 hover:ring-offset-1'
                                            }
                                        `}
                                        style={{
                                            background: color,
                                            boxShadow: color === '#ffffff' ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : undefined
                                        }}
                                        onClick={() => {
                                            onChange(color);
                                        }}
                                        title={name}
                                    >
                                        {isSelected && (
                                            <Check
                                                className={`w-4 h-4 ${isLight ? 'text-gray-800' : 'text-white'}`}
                                                strokeWidth={3}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Reset Button */}
                    {hasValue && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-8 text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                            onClick={() => onChange('inherit')}
                        >
                            <X className="w-3 h-3 mr-1.5" />
                            Reset to Inherit
                        </Button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

interface VisualEditorPanelProps {
    onClose: () => void;
    onStyleUpdate: (property: string, value: string) => void;
    onAgentRequest: (prompt: string) => void;
    selectedElementId?: string;
    selectedElementTagName?: string;
    selectedElementFilepath?: string;
    selectedElementClassName?: string;
    selectedElementSelector?: string;  // Full CSS selector for precise targeting
    initialStyles?: Record<string, string>;
    onSave?: (styles: Record<string, string>) => void;
    projectId: number;
    onReloadPreview?: () => void;
    onFileUpdate?: (files: Array<{ path: string, content: string }>) => void;  // For HMR updates
}

export const VisualEditorPanel: React.FC<VisualEditorPanelProps> = ({
    onClose,
    onStyleUpdate,
    onAgentRequest,
    selectedElementId,
    selectedElementTagName,
    selectedElementFilepath,
    selectedElementClassName,
    selectedElementSelector,
    initialStyles = {},
    onSave,
    projectId,
    onReloadPreview,
    onFileUpdate
}) => {
    const { toast } = useToast();
    const [customPrompt, setCustomPrompt] = useState('');
    const [modifiedStyles, setModifiedStyles] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [editedClassName, setEditedClassName] = useState(selectedElementClassName || '');
    const [selectedAlignment, setSelectedAlignment] = useState<string>('');

    // Spacing values
    const [marginTop, setMarginTop] = useState(0);
    const [marginRight, setMarginRight] = useState(0);
    const [marginBottom, setMarginBottom] = useState(0);
    const [marginLeft, setMarginLeft] = useState(0);
    const [paddingTop, setPaddingTop] = useState(0);
    const [paddingRight, setPaddingRight] = useState(0);
    const [paddingBottom, setPaddingBottom] = useState(0);
    const [paddingLeft, setPaddingLeft] = useState(0);

    // Store previous element info to auto-save before switching
    const prevElementRef = useRef<{
        id?: string;
        tagName?: string;
        filepath?: string;
        className?: string;
        selector?: string;
        modifiedStyles: Record<string, string>;
        editedClassName: string;
    } | null>(null);

    // Auto-save when switching elements (before resetting state)
    useEffect(() => {
        const hasChanges = Object.keys(modifiedStyles).length > 0 || editedClassName !== (prevElementRef.current?.className || '');

        if (prevElementRef.current && hasChanges && prevElementRef.current.filepath) {
            console.log('[VisualEditor] Auto-saving changes before switching element...');

            // Save the previous element's changes asynchronously
            const saveChanges = async () => {
                try {
                    const relativePath = prevElementRef.current!.filepath!.replace(/^\/home\/[^/]+\//, '');
                    let elementSelector = prevElementRef.current!.selector || prevElementRef.current!.tagName || 'div';

                    const payload: any = {
                        filepath: relativePath,
                        element_selector: elementSelector,
                        original_class_name: prevElementRef.current!.className,
                    };

                    const hasStyleChanges = Object.keys(modifiedStyles).length > 0;
                    const hasClassNameChanges = editedClassName !== (prevElementRef.current!.className || '');

                    if (hasStyleChanges) {
                        payload.style_changes = modifiedStyles;
                    }

                    if (hasClassNameChanges) {
                        payload.class_name = editedClassName;
                    }

                    console.log('[VisualEditor] Auto-saving payload:', payload);

                    const result = await projectApi.applyVisualEdit(projectId, payload);

                    if (result.success) {
                        console.log('[VisualEditor] Auto-save successful');

                        // Push file update to WebContainer for instant HMR (no full reload!)
                        if (onFileUpdate && result.modified_content) {
                            console.log('[VisualEditor] Pushing file update for HMR...');
                            onFileUpdate([{
                                path: relativePath,
                                content: result.modified_content
                            }]);
                        }
                    } else {
                        console.warn('[VisualEditor] Auto-save failed:', result.message);
                    }
                } catch (error) {
                    console.error('[VisualEditor] Auto-save error:', error);
                }
            };

            saveChanges();
        }

        // Store current element info for next switch
        prevElementRef.current = {
            id: selectedElementId,
            tagName: selectedElementTagName,
            filepath: selectedElementFilepath,
            className: selectedElementClassName,
            selector: selectedElementSelector,
            modifiedStyles: { ...modifiedStyles },
            editedClassName: editedClassName
        };

        // Reset state for new element
        setModifiedStyles({});
        setEditedClassName(selectedElementClassName || '');
        setSelectedAlignment('');
        setMarginTop(0);
        setMarginRight(0);
        setMarginBottom(0);
        setMarginLeft(0);
        setPaddingTop(0);
        setPaddingRight(0);
        setPaddingBottom(0);
        setPaddingLeft(0);
    }, [selectedElementId, selectedElementSelector]);

    const handleStyleChange = (property: string, value: string) => {
        setModifiedStyles(prev => ({
            ...prev,
            [property]: value
        }));
        onStyleUpdate(property, value);
    };

    const handleAgentSubmit = () => {
        if (!customPrompt.trim()) return;
        onAgentRequest(customPrompt);
        setCustomPrompt('');
    };

    const handleSave = async () => {
        if (!selectedElementTagName || !selectedElementFilepath) {
            toast({
                title: "Cannot save",
                description: "No element selected or file path not available",
                variant: "destructive",
            });
            return;
        }

        const hasStyleChanges = Object.keys(modifiedStyles).length > 0;
        const hasClassNameChanges = editedClassName !== selectedElementClassName;

        if (!hasStyleChanges && !hasClassNameChanges) {
            toast({
                title: "No changes",
                description: "No changes to save",
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);

        try {
            // Extract relative path from WebContainer absolute path
            // WebContainer paths look like: /home/1cc9j47hh9g2sacuxjymmmjo48awol-se3b/src/components/HeroSection.tsx
            // We need just: src/components/HeroSection.tsx
            let relativePath = selectedElementFilepath;

            // Remove WebContainer home directory prefix if present
            const webContainerMatch = relativePath.match(/^\/home\/[^\/]+\/(.+)$/);
            if (webContainerMatch) {
                relativePath = webContainerMatch[1];
            }

            // Also handle cases where it might just start with /
            if (relativePath.startsWith('/') && !relativePath.startsWith('/home/')) {
                relativePath = relativePath.substring(1);
            }

            console.log('[VisualEditor] Original path:', selectedElementFilepath);
            console.log('[VisualEditor] Cleaned path:', relativePath);

            // Use the provided CSS selector if available (most accurate)
            // Otherwise build a selector from available data
            let elementSelector: string;

            if (selectedElementSelector) {
                // Use the precise selector from the element selection
                elementSelector = selectedElementSelector;
                console.log('[VisualEditor] Using provided selector:', elementSelector);
            } else {
                // Fallback: build selector from available data
                elementSelector = selectedElementTagName;
                if (selectedElementClassName && !hasClassNameChanges) {
                    // Only use className as selector if we're not changing it
                    // Use the first class for better specificity
                    const firstClass = selectedElementClassName.split(' ')[0];
                    if (firstClass) {
                        elementSelector = `${selectedElementTagName}.${firstClass}`;
                    }
                } else if (selectedElementId) {
                    // Use ID if available (most specific)
                    elementSelector = `${selectedElementTagName}#${selectedElementId}`;
                }
                console.log('[VisualEditor] Built selector:', elementSelector);
            }

            const payload: any = {
                filepath: relativePath,
                element_selector: elementSelector,
                original_class_name: selectedElementClassName, // Send original className for backend to match
            };

            if (hasStyleChanges) {
                payload.style_changes = modifiedStyles;
            }

            if (hasClassNameChanges) {
                payload.class_name = editedClassName;
            }

            const result = await projectApi.applyVisualEdit(projectId, payload);

            if (result.success) {
                toast({
                    title: "Changes applied",
                    description: `Successfully updated ${selectedElementTagName} in ${selectedElementFilepath}`,
                });

                // Push file update to WebContainer for instant HMR (no full reload!)
                if (onFileUpdate && result.modified_content) {
                    console.log('[VisualEditor] Pushing file update for HMR...');
                    onFileUpdate([{
                        path: relativePath,
                        content: result.modified_content
                    }]);
                }

                // Clear modified styles and reset className after successful save
                setModifiedStyles({});
                setEditedClassName(editedClassName); // Keep the new className as the baseline

                if (onSave) {
                    onSave(modifiedStyles);
                }
            } else {
                toast({
                    title: "Failed to apply styles",
                    description: result.message || "Could not find the element in the file",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('[VisualEditor] Save error:', error);
            toast({
                title: "Error saving styles",
                description: error instanceof Error ? error.message : "Failed to apply visual edits",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanges = Object.keys(modifiedStyles).length > 0 || editedClassName !== selectedElementClassName;

    return (
        <div className="flex-1 min-h-0 flex flex-col bg-gradient-to-b from-background to-muted/20">
            {/* Header */}
            <div className="flex-none border-b bg-gradient-to-r from-primary/5 via-background to-primary/5">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                            <Paintbrush className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">Visual Edits</h3>
                            {selectedElementTagName ? (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                                        &lt;{selectedElementTagName.toLowerCase()}&gt;
                                    </span>
                                    {selectedElementId && (
                                        <span className="text-xs text-muted-foreground">#{selectedElementId}</span>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground mt-0.5">Click an element to edit</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasChanges && (
                            <Button
                                size="sm"
                                className="h-8 text-xs bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-600/20 gap-1.5"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                <Save className="w-3.5 h-3.5" />
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5">

                {/* Colors Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center">
                            <Palette className="w-3.5 h-3.5 text-white" />
                        </div>
                        <h3 className="font-semibold text-sm">Colors</h3>
                    </div>

                    <div className="space-y-3 pl-8">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-muted-foreground">Text Color</Label>
                            <ColorPicker
                                value={modifiedStyles.color || initialStyles.color || ''}
                                onChange={(val) => handleStyleChange('color', val)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-muted-foreground">Background</Label>
                            <ColorPicker
                                value={modifiedStyles.backgroundColor || initialStyles.backgroundColor || ''}
                                onChange={(val) => handleStyleChange('backgroundColor', val)}
                            />
                        </div>
                    </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Typography - Only show for text elements */}
                {selectedElementTagName && ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'button', 'label'].includes(selectedElementTagName.toLowerCase()) && (
                    <>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                    <Type className="w-3.5 h-3.5 text-white" />
                                </div>
                                <h3 className="font-semibold text-sm">Typography</h3>
                            </div>

                            <div className="space-y-3 pl-8">
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Font size */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">Size</Label>
                                        <Select onValueChange={(val) => handleStyleChange('fontSize', val)}>
                                            <SelectTrigger className="h-9 text-xs">
                                                <SelectValue placeholder="Select size" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0.75rem">XS (12px)</SelectItem>
                                                <SelectItem value="0.875rem">SM (14px)</SelectItem>
                                                <SelectItem value="1rem">Base (16px)</SelectItem>
                                                <SelectItem value="1.125rem">LG (18px)</SelectItem>
                                                <SelectItem value="1.25rem">XL (20px)</SelectItem>
                                                <SelectItem value="1.5rem">2XL (24px)</SelectItem>
                                                <SelectItem value="1.875rem">3XL (30px)</SelectItem>
                                                <SelectItem value="2.25rem">4XL (36px)</SelectItem>
                                                <SelectItem value="3rem">5XL (48px)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Font weight */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">Weight</Label>
                                        <Select onValueChange={(val) => handleStyleChange('fontWeight', val)}>
                                            <SelectTrigger className="h-9 text-xs">
                                                <SelectValue placeholder="Select weight" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="300">Light</SelectItem>
                                                <SelectItem value="400">Normal</SelectItem>
                                                <SelectItem value="500">Medium</SelectItem>
                                                <SelectItem value="600">Semibold</SelectItem>
                                                <SelectItem value="700">Bold</SelectItem>
                                                <SelectItem value="800">Extra Bold</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Text alignment */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">Alignment</Label>
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {[
                                            { value: 'left', icon: AlignLeft, label: 'Left' },
                                            { value: 'center', icon: AlignCenter, label: 'Center' },
                                            { value: 'right', icon: AlignRight, label: 'Right' },
                                            { value: 'justify', icon: AlignJustify, label: 'Justify' },
                                        ].map(({ value, icon: Icon, label }) => {
                                            const isSelected = selectedAlignment === value || modifiedStyles.textAlign === value;
                                            return (
                                                <button
                                                    key={value}
                                                    className={`
                                                        h-9 rounded-lg flex items-center justify-center transition-all duration-200
                                                        ${isSelected
                                                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105'
                                                            : 'bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground'
                                                        }
                                                    `}
                                                    onClick={() => {
                                                        setSelectedAlignment(value);
                                                        handleStyleChange('textAlign', value);
                                                    }}
                                                    title={label}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-border/50" />
                    </>
                )}

                {/* Spacing */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                            <Move className="w-3.5 h-3.5 text-white" />
                        </div>
                        <h3 className="font-semibold text-sm">Spacing</h3>
                    </div>

                    <div className="pl-8">
                        {/* Visual Box Model */}
                        <div className="relative p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                            {/* Margin Label */}
                            <div className="absolute -top-2.5 left-3 px-2 bg-background text-[10px] font-medium text-orange-600">MARGIN</div>

                            {/* Margin Inputs - Top */}
                            <div className="flex justify-center mb-2">
                                <DragInput
                                    value={marginTop}
                                    onChange={(val) => {
                                        setMarginTop(val);
                                        handleStyleChange('marginTop', `${val}px`);
                                    }}
                                />
                            </div>

                            {/* Middle row: Left Margin + Padding Box + Right Margin */}
                            <div className="flex items-center gap-2">
                                <DragInput
                                    value={marginLeft}
                                    onChange={(val) => {
                                        setMarginLeft(val);
                                        handleStyleChange('marginLeft', `${val}px`);
                                    }}
                                />

                                {/* Padding Box */}
                                <div className="flex-1 relative p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                                    {/* Padding Label */}
                                    <div className="absolute -top-2 left-2 px-1.5 bg-background text-[10px] font-medium text-green-600">PADDING</div>

                                    {/* Padding Top */}
                                    <div className="flex justify-center mb-2">
                                        <DragInput
                                            value={paddingTop}
                                            onChange={(val) => {
                                                setPaddingTop(val);
                                                handleStyleChange('paddingTop', `${val}px`);
                                            }}
                                        />
                                    </div>

                                    {/* Padding Left + Content + Padding Right */}
                                    <div className="flex items-center gap-2">
                                        <DragInput
                                            value={paddingLeft}
                                            onChange={(val) => {
                                                setPaddingLeft(val);
                                                handleStyleChange('paddingLeft', `${val}px`);
                                            }}
                                        />

                                        {/* Content placeholder */}
                                        <div className="flex-1 h-8 rounded bg-muted/50 border border-dashed border-muted-foreground/30 flex items-center justify-center">
                                            <span className="text-[10px] text-muted-foreground">content</span>
                                        </div>

                                        <DragInput
                                            value={paddingRight}
                                            onChange={(val) => {
                                                setPaddingRight(val);
                                                handleStyleChange('paddingRight', `${val}px`);
                                            }}
                                        />
                                    </div>

                                    {/* Padding Bottom */}
                                    <div className="flex justify-center mt-2">
                                        <DragInput
                                            value={paddingBottom}
                                            onChange={(val) => {
                                                setPaddingBottom(val);
                                                handleStyleChange('paddingBottom', `${val}px`);
                                            }}
                                        />
                                    </div>
                                </div>

                                <DragInput
                                    value={marginRight}
                                    onChange={(val) => {
                                        setMarginRight(val);
                                        handleStyleChange('marginRight', `${val}px`);
                                    }}
                                />
                            </div>

                            {/* Margin Bottom */}
                            <div className="flex justify-center mt-2">
                                <DragInput
                                    value={marginBottom}
                                    onChange={(val) => {
                                        setMarginBottom(val);
                                        handleStyleChange('marginBottom', `${val}px`);
                                    }}
                                />
                            </div>
                        </div>

                        <p className="text-[10px] text-muted-foreground mt-2 text-center">
                            Double-click to type, or drag to adjust
                        </p>
                    </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Border */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
                            <Square className="w-3.5 h-3.5 text-white" />
                        </div>
                        <h3 className="font-semibold text-sm">Border</h3>
                    </div>

                    <div className="space-y-3 pl-8">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground">Width</Label>
                                <Select onValueChange={(val) => handleStyleChange('borderWidth', val)}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0px">None</SelectItem>
                                        <SelectItem value="1px">1px</SelectItem>
                                        <SelectItem value="2px">2px</SelectItem>
                                        <SelectItem value="4px">4px</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground">Style</Label>
                                <Select onValueChange={(val) => handleStyleChange('borderStyle', val)}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value="solid">Solid</SelectItem>
                                        <SelectItem value="dashed">Dashed</SelectItem>
                                        <SelectItem value="dotted">Dotted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-muted-foreground">Border Color</Label>
                            <ColorPicker
                                value={modifiedStyles.borderColor || initialStyles.borderColor || ''}
                                onChange={(val) => handleStyleChange('borderColor', val)}
                            />
                        </div>
                    </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Effects */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <h3 className="font-semibold text-sm">Effects</h3>
                    </div>

                    <div className="space-y-3 pl-8">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground">Radius</Label>
                                <Select onValueChange={(val) => handleStyleChange('borderRadius', val)}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0px">None</SelectItem>
                                        <SelectItem value="4px">Small (4px)</SelectItem>
                                        <SelectItem value="8px">Medium (8px)</SelectItem>
                                        <SelectItem value="12px">Large (12px)</SelectItem>
                                        <SelectItem value="16px">XL (16px)</SelectItem>
                                        <SelectItem value="9999px">Full</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground">Opacity</Label>
                                <Select onValueChange={(val) => handleStyleChange('opacity', val)}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="100%" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">100%</SelectItem>
                                        <SelectItem value="0.9">90%</SelectItem>
                                        <SelectItem value="0.75">75%</SelectItem>
                                        <SelectItem value="0.5">50%</SelectItem>
                                        <SelectItem value="0.25">25%</SelectItem>
                                        <SelectItem value="0">0%</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-muted-foreground">Shadow</Label>
                            <Select onValueChange={(val) => handleStyleChange('boxShadow', val)}>
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Select shadow" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="0 1px 2px 0 rgb(0 0 0 / 0.05)">XS - Subtle</SelectItem>
                                    <SelectItem value="0 1px 3px 0 rgb(0 0 0 / 0.1)">SM - Small</SelectItem>
                                    <SelectItem value="0 4px 6px -1px rgb(0 0 0 / 0.1)">MD - Medium</SelectItem>
                                    <SelectItem value="0 10px 15px -3px rgb(0 0 0 / 0.1)">LG - Large</SelectItem>
                                    <SelectItem value="0 20px 25px -5px rgb(0 0 0 / 0.1)">XL - Extra Large</SelectItem>
                                    <SelectItem value="0 25px 50px -12px rgb(0 0 0 / 0.25)">2XL - Huge</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Advanced - className editor */}
                <details className="group">
                    <summary className="cursor-pointer list-none">
                        <div className="flex items-center gap-2 py-1">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-gray-500 to-zinc-600 flex items-center justify-center">
                                <Settings2 className="w-3.5 h-3.5 text-white" />
                            </div>
                            <h3 className="font-semibold text-sm">Advanced</h3>
                            <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto transition-transform group-open:rotate-180" />
                        </div>
                    </summary>

                    <div className="space-y-2 pt-3 pl-8">
                        <Label className="text-xs font-medium text-muted-foreground">Tailwind Classes</Label>
                        <Textarea
                            value={editedClassName}
                            onChange={(e) => setEditedClassName(e.target.value)}
                            className="min-h-[100px] text-xs font-mono bg-muted/30 border-border/50 focus:border-primary/50"
                            placeholder="e.g., text-sm lg:text-base text-foreground/80 mb-6"
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Edit CSS classes directly. Changes apply on save.
                        </p>
                    </div>
                </details>
            </div>

            {/* Footer / Custom Agent Request */}
            <div className="flex-none p-4 border-t bg-gradient-to-r from-primary/5 via-background to-primary/5">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
                        <Wand2 className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                    <Label className="text-xs font-semibold">AI Assistant</Label>
                </div>
                <Textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="min-h-[70px] text-xs mb-3 resize-none bg-background/80 border-border/50 focus:border-primary/50 placeholder:text-muted-foreground/60"
                    placeholder="Describe what you want to change...&#10;e.g., Make this a gradient button with rounded corners"
                />
                <Button
                    className="w-full h-9 text-xs bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 gap-2"
                    size="sm"
                    onClick={handleAgentSubmit}
                    disabled={!customPrompt.trim()}
                >
                    <Wand2 className="w-3.5 h-3.5" />
                    Apply with AI
                </Button>
            </div>
        </div>
    );
};
