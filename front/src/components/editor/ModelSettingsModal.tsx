import { useState, useEffect } from 'react';
import { X, Sparkles, Zap, Brain, Check, Info } from 'lucide-react';
import { API_URL } from '@/services/api';

interface ModelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModelChange?: (model: string) => void;
}

interface GeminiModel {
  id: string;
  name: string;
  description: string;
  contextWindow: string;
  category: 'latest' | 'stable' | 'legacy';
  icon: 'sparkles' | 'zap' | 'brain';
}

const GEMINI_MODELS: GeminiModel[] = [
  // Gemini 3 Series (Latest)
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro',
    description: 'Most intelligent model for complex agentic workflows and coding',
    contextWindow: '1M tokens',
    category: 'latest',
    icon: 'sparkles',
  },
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash',
    description: 'Fast multimodal understanding with strong coding capabilities',
    contextWindow: '1M tokens',
    category: 'latest',
    icon: 'zap',
  },
  // Gemini 2.5 Series (Stable)
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'High-capability model for complex reasoning and coding',
    contextWindow: '1M tokens',
    category: 'stable',
    icon: 'brain',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Balance of intelligence and speed with controllable thinking',
    contextWindow: '1M tokens',
    category: 'stable',
    icon: 'zap',
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    description: 'Cost-effective for high-throughput tasks',
    contextWindow: '1M tokens',
    category: 'stable',
    icon: 'zap',
  },
  // Gemini 2.0 Series (Legacy - will be deprecated March 2026)
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'General-purpose multimodal model (deprecated March 2026)',
    contextWindow: '1M tokens',
    category: 'legacy',
    icon: 'zap',
  },
];

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'sparkles':
      return <Sparkles className="w-5 h-5" />;
    case 'zap':
      return <Zap className="w-5 h-5" />;
    case 'brain':
      return <Brain className="w-5 h-5" />;
    default:
      return <Sparkles className="w-5 h-5" />;
  }
};

const getCategoryStyle = (category: string) => {
  switch (category) {
    case 'latest':
      return 'bg-gradient-to-r from-violet-500 to-purple-600 text-white';
    case 'stable':
      return 'bg-blue-500 text-white';
    case 'legacy':
      return 'bg-gray-400 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'latest':
      return 'Latest';
    case 'stable':
      return 'Stable';
    case 'legacy':
      return 'Legacy';
    default:
      return category;
  }
};

export function ModelSettingsModal({ isOpen, onClose, onModelChange }: ModelSettingsModalProps) {
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3-flash-preview');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load current model from backend/localStorage on mount
  useEffect(() => {
    if (isOpen) {
      const loadCurrentModel = async () => {
        setIsLoading(true);
        try {
          // Try to get from backend first
          const response = await fetch(`${API_URL}/settings/model`);
          if (response.ok) {
            const data = await response.json();
            setSelectedModel(data.model);
          } else {
            // Fallback to localStorage
            const savedModel = localStorage.getItem('artreal_model');
            if (savedModel) {
              setSelectedModel(savedModel);
            }
          }
        } catch (error) {
          // Fallback to localStorage
          const savedModel = localStorage.getItem('artreal_model');
          if (savedModel) {
            setSelectedModel(savedModel);
          }
        } finally {
          setIsLoading(false);
        }
      };
      loadCurrentModel();
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to backend
      const response = await fetch(`${API_URL}/settings/model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: selectedModel }),
      });

      if (response.ok) {
        // Also save to localStorage as backup
        localStorage.setItem('artreal_model', selectedModel);
        onModelChange?.(selectedModel);
        onClose();
      } else {
        // Fallback: just save to localStorage
        localStorage.setItem('artreal_model', selectedModel);
        onModelChange?.(selectedModel);
        onClose();
      }
    } catch (error) {
      // Fallback: save to localStorage
      localStorage.setItem('artreal_model', selectedModel);
      onModelChange?.(selectedModel);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const groupedModels = {
    latest: GEMINI_MODELS.filter(m => m.category === 'latest'),
    stable: GEMINI_MODELS.filter(m => m.category === 'stable'),
    legacy: GEMINI_MODELS.filter(m => m.category === 'legacy'),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">AI Model Settings</h2>
              <p className="text-sm text-muted-foreground">Choose the Gemini model for code generation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Latest Models */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryStyle('latest')}`}>
                    {getCategoryLabel('latest')}
                  </span>
                  <span className="text-xs text-muted-foreground">Recommended</span>
                </div>
                <div className="space-y-2">
                  {groupedModels.latest.map((model) => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      isSelected={selectedModel === model.id}
                      onSelect={() => setSelectedModel(model.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Stable Models */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryStyle('stable')}`}>
                    {getCategoryLabel('stable')}
                  </span>
                  <span className="text-xs text-muted-foreground">Production ready</span>
                </div>
                <div className="space-y-2">
                  {groupedModels.stable.map((model) => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      isSelected={selectedModel === model.id}
                      onSelect={() => setSelectedModel(model.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Legacy Models */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryStyle('legacy')}`}>
                    {getCategoryLabel('legacy')}
                  </span>
                  <span className="text-xs text-amber-600 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Deprecated March 2026
                  </span>
                </div>
                <div className="space-y-2">
                  {groupedModels.legacy.map((model) => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      isSelected={selectedModel === model.id}
                      onSelect={() => setSelectedModel(model.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-secondary/30">
          <div className="text-sm text-muted-foreground">
            Selected: <span className="font-medium text-foreground">{selectedModel}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ModelCardProps {
  model: GeminiModel;
  isSelected: boolean;
  onSelect: () => void;
}

function ModelCard({ model, isSelected, onSelect }: ModelCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
        isSelected
          ? 'border-violet-500 bg-violet-50'
          : 'border-border/50 hover:border-violet-300 hover:bg-secondary/30'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
        isSelected
          ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
          : 'bg-secondary text-muted-foreground'
      }`}>
        {getIcon(model.icon)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold ${isSelected ? 'text-violet-700' : 'text-foreground'}`}>
            {model.name}
          </h3>
          {isSelected && (
            <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{model.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {model.contextWindow}
          </span>
          <span className="text-xs text-muted-foreground font-mono">{model.id}</span>
        </div>
      </div>
    </button>
  );
}
