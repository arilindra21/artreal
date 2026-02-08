import { useState } from 'react';
import {
  X, Rocket, Megaphone, LayoutDashboard, LogIn, Mail,
  ShoppingBag, FileText, CreditCard, Layers
} from 'lucide-react';
import { SketchTemplate, SKETCH_TEMPLATES } from './sketch-types';

interface SketchTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: SketchTemplate) => void;
}

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  Rocket: <Rocket className="w-5 h-5" />,
  Megaphone: <Megaphone className="w-5 h-5" />,
  LayoutDashboard: <LayoutDashboard className="w-5 h-5" />,
  LogIn: <LogIn className="w-5 h-5" />,
  Mail: <Mail className="w-5 h-5" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  CreditCard: <CreditCard className="w-5 h-5" />,
};

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  landing: { label: 'Landing', color: 'bg-blue-100 text-blue-700' },
  dashboard: { label: 'Dashboard', color: 'bg-purple-100 text-purple-700' },
  form: { label: 'Form', color: 'bg-green-100 text-green-700' },
  ecommerce: { label: 'E-commerce', color: 'bg-orange-100 text-orange-700' },
  blog: { label: 'Blog', color: 'bg-pink-100 text-pink-700' },
};

const CATEGORY_FILTERS = ['all', 'landing', 'dashboard', 'form', 'ecommerce', 'blog'] as const;

export const SketchTemplates: React.FC<SketchTemplatesProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredTemplates = selectedCategory === 'all'
    ? SKETCH_TEMPLATES
    : SKETCH_TEMPLATES.filter(t => t.category === selectedCategory);

  const handleSelect = (template: SketchTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-[90%] max-w-4xl max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Choose a Template</h2>
              <p className="text-sm text-muted-foreground">Start with a pre-built layout and customize it</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-secondary/80 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-6 py-3 border-b border-border/30 bg-slate-50/50">
          <div className="flex items-center gap-2 overflow-x-auto">
            {CATEGORY_FILTERS.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-muted-foreground hover:text-foreground hover:bg-slate-100 border border-border/50'
                }`}
              >
                {category === 'all' ? 'All Templates' : CATEGORY_LABELS[category]?.label || category}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
                className={`group relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                  hoveredTemplate === template.id
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]'
                    : 'border-border/50 bg-white hover:border-primary/50'
                }`}
              >
                {/* Template Preview (Mini wireframe) */}
                <div className="aspect-[4/3] mb-3 rounded-xl bg-slate-100 overflow-hidden relative">
                  <TemplatePreview template={template} />
                  {/* Hover overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end justify-center pb-3 transition-opacity duration-200 ${
                    hoveredTemplate === template.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <span className="text-white text-xs font-semibold px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                      Use Template
                    </span>
                  </div>
                </div>

                {/* Template Info */}
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    {TEMPLATE_ICONS[template.icon] || <Layers className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm text-foreground truncate">
                      {template.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="mt-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    CATEGORY_LABELS[template.category]?.color || 'bg-slate-100 text-slate-600'
                  }`}>
                    {CATEGORY_LABELS[template.category]?.label || template.category}
                  </span>
                  <span className="ml-2 text-[10px] text-muted-foreground">
                    {template.elements.length} elements
                  </span>
                </div>
              </button>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Layers className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-700 mb-1">No templates found</h3>
              <p className="text-sm text-muted-foreground">Try selecting a different category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Mini wireframe preview component
const TemplatePreview: React.FC<{ template: SketchTemplate }> = ({ template }) => {
  // Scale elements to fit in preview
  const scale = 0.12;
  const offsetX = 0;
  const offsetY = 0;

  return (
    <div className="w-full h-full relative">
      {template.elements.map((el, index) => (
        <div
          key={index}
          className="absolute rounded border border-slate-300 bg-white/80"
          style={{
            left: (el.position.x - offsetX) * scale,
            top: (el.position.y - offsetY) * scale,
            width: el.size.width * scale,
            height: el.size.height * scale,
          }}
        >
          {/* Small indicator dot */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full ${
            el.type === 'navbar' || el.type === 'footer' ? 'bg-blue-400' :
            el.type === 'hero' || el.type === 'section' ? 'bg-purple-400' :
            el.type === 'card' ? 'bg-emerald-400' :
            el.type === 'form' || el.type === 'input' ? 'bg-cyan-400' :
            el.type === 'button' ? 'bg-orange-400' :
            'bg-slate-400'
          }`} />
        </div>
      ))}
    </div>
  );
};

export default SketchTemplates;
