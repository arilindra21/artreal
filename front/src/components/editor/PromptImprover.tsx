import { useState } from 'react';
import { Sparkles, Loader2, Check, X, Wand2, ArrowRight, RefreshCw } from 'lucide-react';
import { API_URL } from '@/services/api';

interface PromptImproverProps {
  originalPrompt: string;
  onAccept: (improvedPrompt: string) => void;
  onCancel: () => void;
}

const IMPROVEMENT_TEMPLATES = [
  {
    id: 'detailed',
    label: 'More Detailed',
    icon: '📝',
    instruction: 'Make this prompt more detailed with specific requirements'
  },
  {
    id: 'technical',
    label: 'More Technical',
    icon: '⚙️',
    instruction: 'Add technical specifications and best practices'
  },
  {
    id: 'ui-focused',
    label: 'UI/UX Focus',
    icon: '🎨',
    instruction: 'Focus on UI/UX design, colors, layout, and user experience'
  },
  {
    id: 'structured',
    label: 'Well Structured',
    icon: '📋',
    instruction: 'Break down into clear sections and components'
  }
];

export function PromptImprover({ originalPrompt, onAccept, onCancel }: PromptImproverProps) {
  const [isImproving, setIsImproving] = useState(false);
  const [improvedPrompt, setImprovedPrompt] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('detailed');
  const [error, setError] = useState<string | null>(null);

  const improvePrompt = async () => {
    if (!originalPrompt.trim()) return;

    setIsImproving(true);
    setError(null);

    const template = IMPROVEMENT_TEMPLATES.find(t => t.id === selectedTemplate);

    try {
      // Use AI to improve the prompt via the backend
      const requestBody = {
        prompt: originalPrompt,
        style: selectedTemplate,
        instruction: template?.instruction || 'Improve this prompt'
      };

      console.log('[PromptImprover] Sending request:', requestBody);
      console.log('[PromptImprover] API URL:', `${API_URL}/chat/prompt/improve`);

      const response = await fetch(`${API_URL}/chat/prompt/improve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      console.log('[PromptImprover] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Prompt improve API error:', response.status, errorText);
        // Fallback to local improvement if API not available
        const improved = generateLocalImprovement(originalPrompt, selectedTemplate);
        setImprovedPrompt(improved);
        setError(`API error (${response.status}), menggunakan template lokal`);
      } else {
        const data = await response.json();
        setImprovedPrompt(data.improved_prompt);
        setError(null);
      }
    } catch (err) {
      console.error('Prompt improve error:', err);
      // Fallback to local improvement
      const improved = generateLocalImprovement(originalPrompt, selectedTemplate);
      setImprovedPrompt(improved);
      setError('Gagal terhubung ke AI, menggunakan template lokal');
    } finally {
      setIsImproving(false);
    }
  };

  // Local fallback improvement (without API)
  const generateLocalImprovement = (prompt: string, style: string): string => {
    const additions: Record<string, string[]> = {
      detailed: [
        '\n\nPlease include:',
        '- Responsive design (mobile, tablet, desktop)',
        '- Modern UI with smooth animations',
        '- Clean component structure',
        '- Proper TypeScript types',
        '- Tailwind CSS for styling'
      ],
      technical: [
        '\n\nTechnical Requirements:',
        '- Use React functional components with hooks',
        '- Implement proper state management',
        '- Add error handling and loading states',
        '- Follow React best practices',
        '- Use TypeScript for type safety'
      ],
      'ui-focused': [
        '\n\nUI/UX Requirements:',
        '- Modern, clean design aesthetic',
        '- Consistent color scheme and typography',
        '- Smooth hover/click animations',
        '- Intuitive navigation and layout',
        '- Accessible design (WCAG compliant)'
      ],
      structured: [
        '\n\nComponent Structure:',
        '- Header/Navigation component',
        '- Main content area with sections',
        '- Reusable UI components',
        '- Footer if applicable',
        '- Organized file structure'
      ]
    };

    const additionsForStyle = additions[style] || additions.detailed;
    return prompt + additionsForStyle.join('\n');
  };

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-purple-500" />
          <span className="font-semibold text-gray-900 dark:text-white">Improve Your Prompt</span>
        </div>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Original Prompt */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Original Prompt:</label>
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{originalPrompt}</p>
      </div>

      {/* Improvement Style Selection */}
      {!improvedPrompt && (
        <div className="px-4 py-3">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
            Choose improvement style:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {IMPROVEMENT_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTemplate === template.id
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span>{template.icon}</span>
                <span>{template.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={improvePrompt}
            disabled={isImproving}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all disabled:opacity-50"
          >
            {isImproving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Improving...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Improve Prompt
              </>
            )}
          </button>
        </div>
      )}

      {/* Improved Prompt Result */}
      {improvedPrompt && (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-green-600 dark:text-green-400">
              ✨ Improved Prompt:
            </label>
            <button
              onClick={() => {
                setImprovedPrompt(null);
              }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <RefreshCw className="w-3 h-3" />
              Try Again
            </button>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 max-h-40 overflow-y-auto">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{improvedPrompt}</p>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onAccept(improvedPrompt)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg transition-all"
            >
              <Check className="w-4 h-4" />
              Use Improved
            </button>
            <button
              onClick={() => onAccept(originalPrompt)}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              Use Original
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

// Quick improve button for chat input
export function PromptImproveButton({
  disabled,
  onClick
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-2 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 hover:from-violet-500/20 hover:to-purple-500/20 border border-purple-200 dark:border-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
      title="Improve prompt with AI"
    >
      <Wand2 className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
    </button>
  );
}
