import {
  Menu, Sparkles, Square, MousePointer, Type, AlignLeft,
  Image, List, FileText, Minus, PanelLeft, LayoutGrid
} from 'lucide-react';
import { ELEMENT_CONFIGS, SketchElementType } from './sketch-types';

interface SketchToolbarProps {
  onAddElement: (type: SketchElementType) => void;
}

const ELEMENT_ICONS: Record<SketchElementType, React.ReactNode> = {
  navbar: <Menu className="w-4 h-4" />,
  hero: <Sparkles className="w-4 h-4" />,
  card: <Square className="w-4 h-4" />,
  button: <MousePointer className="w-4 h-4" />,
  input: <Type className="w-4 h-4" />,
  text: <AlignLeft className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  list: <List className="w-4 h-4" />,
  form: <FileText className="w-4 h-4" />,
  footer: <Minus className="w-4 h-4" />,
  sidebar: <PanelLeft className="w-4 h-4" />,
  modal: <Square className="w-4 h-4" />,
  section: <LayoutGrid className="w-4 h-4" />,
};

const ELEMENT_COLORS: Record<SketchElementType, string> = {
  navbar: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
  hero: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
  card: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
  button: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
  input: 'from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
  text: 'from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700',
  image: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
  list: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
  form: 'from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700',
  footer: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
  sidebar: 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700',
  modal: 'from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700',
  section: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
};

// Group elements by category
const ELEMENT_GROUPS = {
  'Layout': ['navbar', 'hero', 'section', 'sidebar', 'footer'],
  'Content': ['card', 'text', 'image', 'list'],
  'Interactive': ['button', 'input', 'form'],
} as const;

export const SketchToolbar: React.FC<SketchToolbarProps> = ({ onAddElement }) => {
  return (
    <div className="w-56 bg-white/80 backdrop-blur-sm border-r border-border/30 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border/30">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Components
        </h3>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Click to add to canvas
        </p>
      </div>

      {/* Element Groups */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {Object.entries(ELEMENT_GROUPS).map(([groupName, types]) => (
          <div key={groupName}>
            <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              {groupName}
            </h4>
            <div className="space-y-1">
              {types.map(type => {
                const config = ELEMENT_CONFIGS.find(c => c.type === type);
                if (!config) return null;

                return (
                  <button
                    key={type}
                    onClick={() => onAddElement(type as SketchElementType)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-50 transition-all group text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ELEMENT_COLORS[type as SketchElementType]} flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-shadow`}>
                      {ELEMENT_ICONS[type as SketchElementType]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                        {config.label}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {config.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="p-3 border-t border-border/30 bg-slate-50/50">
        <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Tips
        </h4>
        <ul className="text-[10px] text-slate-500 space-y-1">
          <li className="flex items-start gap-1.5">
            <span className="text-primary">•</span>
            <span>Double-click element to edit label</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-primary">•</span>
            <span>Click handle icon to draw connections</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-primary">•</span>
            <span>Drag corners to resize elements</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-primary">•</span>
            <span>Press Delete to remove selected</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-primary">•</span>
            <span>Ctrl+Z to undo changes</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SketchToolbar;
