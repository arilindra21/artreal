import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, MessageSquare, FolderTree, Code2, Eye, Pencil, Keyboard, CheckCircle2, Bot, GitBranch, Play, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector or panel ID
  position: 'left' | 'right' | 'top' | 'bottom' | 'center';
  icon: React.ReactNode;
  highlight?: boolean;
  // Actions to trigger when this step is active
  actions?: {
    showChat?: boolean;
    showExplorer?: boolean;
    setView?: 'code' | 'preview' | 'split' | 'sketch';
  };
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ArtReal Editor!',
    description: 'Let me give you a quick tour of the editor. You can skip this anytime or navigate using the arrows.',
    target: 'center',
    position: 'center',
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    id: 'chat-panel',
    title: 'AI Chat Panel',
    description: 'This is your AI assistant. Describe what you want to build, and AI will generate the code for you. Try "Create a landing page with hero section".',
    target: 'chat-panel',
    position: 'right',
    icon: <MessageSquare className="w-5 h-5" />,
    highlight: true,
    actions: { showChat: true },
  },
  {
    id: 'file-explorer',
    title: 'File Explorer',
    description: 'All your project files are here. Click any file to open it in the editor. You can also create new files and folders.',
    target: 'explorer-panel',
    position: 'right',
    icon: <FolderTree className="w-5 h-5" />,
    highlight: true,
    actions: { showExplorer: true, setView: 'split' },
  },
  {
    id: 'view-toggle',
    title: 'View Mode Toggle',
    description: 'Switch between different view modes. Code shows the editor, Split shows code and preview side by side, Preview shows only the app.',
    target: 'view-toggle',
    position: 'bottom',
    icon: <Layers className="w-5 h-5" />,
    highlight: true,
    actions: { setView: 'split' },
  },
  {
    id: 'code-editor',
    title: 'Code Editor',
    description: 'View and edit your code here. Changes are auto-saved. You can also select code and ask AI questions about it.',
    target: 'code-editor-panel',
    position: 'left',
    icon: <Code2 className="w-5 h-5" />,
    highlight: true,
    actions: { setView: 'code' },
  },
  {
    id: 'preview-panel',
    title: 'Live Preview',
    description: 'See your app running in real-time! The preview updates automatically as AI generates code. Use device buttons to test responsive design.',
    target: 'preview-panel',
    position: 'left',
    icon: <Eye className="w-5 h-5" />,
    highlight: true,
    actions: { setView: 'preview' },
  },
  {
    id: 'sketch-mode',
    title: 'Sketch to App',
    description: 'Draw wireframes and UI sketches, then let AI convert them into real React components! Perfect for rapid prototyping.',
    target: 'view-sketch-btn',
    position: 'bottom',
    icon: <Sparkles className="w-5 h-5" />,
    highlight: true,
    actions: { setView: 'sketch' },
  },
  {
    id: 'ai-model',
    title: 'AI Model Settings',
    description: 'Choose different AI models for code generation. Some models are faster, others are more capable. Click to see available options.',
    target: 'ai-model-btn',
    position: 'bottom',
    icon: <Bot className="w-5 h-5" />,
    highlight: true,
    actions: { setView: 'preview' },
  },
  {
    id: 'git-controls',
    title: 'Git Version Control',
    description: 'Your project uses Git for version control. View history, sync with remote repositories, and configure Git settings here.',
    target: 'git-controls',
    position: 'bottom',
    icon: <GitBranch className="w-5 h-5" />,
    highlight: true,
  },
  {
    id: 'run-button',
    title: 'Run Project',
    description: 'Click Run to start your project. The preview will show your app running with hot reload - changes appear instantly!',
    target: 'run-btn',
    position: 'bottom',
    icon: <Play className="w-5 h-5" />,
    highlight: true,
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Press Ctrl+K to open Command Palette for quick actions. Ctrl+S saves the current file. You\'re all set!',
    target: 'command-palette-btn',
    position: 'bottom',
    icon: <Keyboard className="w-5 h-5" />,
    highlight: true,
  },
  {
    id: 'complete',
    title: 'You\'re Ready!',
    description: 'Start by typing in the chat what you want to build. AI will handle the rest. Happy coding!',
    target: 'center',
    position: 'center',
    icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
    actions: { showChat: true, setView: 'preview' },
  },
];

const TUTORIAL_STORAGE_KEY = 'artreal_tutorial_completed';

interface TutorialActions {
  showChat?: boolean;
  showExplorer?: boolean;
  setView?: 'code' | 'preview' | 'split' | 'sketch';
}

interface EditorTutorialProps {
  isOpen?: boolean;
  onComplete?: () => void;
  onStepChange?: (stepId: string, actions?: TutorialActions) => void;
}

export function EditorTutorial({ isOpen: controlledIsOpen, onComplete, onStepChange }: EditorTutorialProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  // Handle controlled isOpen prop
  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      if (controlledIsOpen) {
        setCurrentStep(0);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }
  }, [controlledIsOpen]);

  // Check if tutorial should be shown on first visit (only if not controlled)
  useEffect(() => {
    if (controlledIsOpen !== undefined) return; // Skip if controlled

    const hasCompleted = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!hasCompleted) {
      // Delay showing tutorial to let the editor load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [controlledIsOpen]);

  // Trigger onStepChange when step changes
  useEffect(() => {
    if (!isVisible) return;

    const step = TUTORIAL_STEPS[currentStep];
    if (onStepChange && step) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        onStepChange(step.id, step.actions);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isVisible, onStepChange]);

  // Update highlight position when step changes
  useEffect(() => {
    if (!isVisible) return;

    const step = TUTORIAL_STEPS[currentStep];
    if (step.target === 'center') {
      setHighlightRect(null);
      return;
    }

    // Find the target element
    const findTarget = () => {
      let element: Element | null = null;

      // Try by ID first
      element = document.getElementById(step.target);

      // Try by data attribute
      if (!element) {
        element = document.querySelector(`[data-tutorial="${step.target}"]`);
      }

      // Try by common patterns
      if (!element && step.target === 'chat-panel') {
        element = document.querySelector('[id*="chat"]') ||
                  document.querySelector('.chat-panel') ||
                  document.querySelector('[class*="ChatPanel"]');
      }

      if (!element && step.target === 'explorer-panel') {
        element = document.querySelector('[class*="FileExplorer"]') ||
                  document.querySelector('[class*="file-explorer"]');
      }

      if (!element && step.target === 'view-mode-tabs') {
        element = document.querySelector('[class*="EditorTabs"]') ||
                  document.querySelector('[data-view-tabs]');
      }

      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);
      } else {
        setHighlightRect(null);
      }
    };

    // Try immediately and with a small delay
    findTarget();
    const timer = setTimeout(findTarget, 100);

    // Update on resize
    window.addEventListener('resize', findTarget);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', findTarget);
    };
  }, [currentStep, isVisible]);

  const handleNext = useCallback(() => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  // Keyboard navigation
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleNext, handlePrev, handleSkip]);

  if (!isVisible) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const isCentered = step.position === 'center';

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (isCentered || !highlightRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = 20;
    const tooltipWidth = 360;
    const tooltipHeight = 200;

    switch (step.position) {
      case 'right':
        return {
          top: Math.max(padding, Math.min(highlightRect.top + highlightRect.height / 2 - tooltipHeight / 2, window.innerHeight - tooltipHeight - padding)),
          left: Math.min(highlightRect.right + padding, window.innerWidth - tooltipWidth - padding),
        };
      case 'left':
        return {
          top: Math.max(padding, Math.min(highlightRect.top + highlightRect.height / 2 - tooltipHeight / 2, window.innerHeight - tooltipHeight - padding)),
          left: Math.max(padding, highlightRect.left - tooltipWidth - padding),
        };
      case 'bottom':
        return {
          top: Math.min(highlightRect.bottom + padding, window.innerHeight - tooltipHeight - padding),
          left: Math.max(padding, Math.min(highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding)),
        };
      case 'top':
        return {
          top: Math.max(padding, highlightRect.top - tooltipHeight - padding),
          left: Math.max(padding, Math.min(highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding)),
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Overlay with cutout */}
      <div className="absolute inset-0 pointer-events-auto">
        {/* Dark overlay */}
        <div
          className="absolute inset-0 bg-black/60 transition-opacity duration-300"
          onClick={handleSkip}
        />

        {/* Highlight cutout */}
        {highlightRect && step.highlight && (
          <div
            className="absolute border-2 border-primary rounded-lg shadow-[0_0_0_4px_rgba(59,130,246,0.3)] transition-all duration-300 pointer-events-none"
            style={{
              top: highlightRect.top - 4,
              left: highlightRect.left - 4,
              width: highlightRect.width + 8,
              height: highlightRect.height + 8,
              boxShadow: `
                0 0 0 9999px rgba(0,0,0,0.6),
                0 0 20px 4px rgba(59,130,246,0.4),
                inset 0 0 0 2px rgba(59,130,246,0.3)
              `,
            }}
          />
        )}
      </div>

      {/* Tooltip Card */}
      <div
        className={cn(
          "absolute pointer-events-auto",
          "w-[360px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl",
          "border border-gray-200 dark:border-gray-700",
          "transition-all duration-300 ease-out",
          "animate-in fade-in-0 zoom-in-95"
        )}
        style={getTooltipStyle()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              isLastStep
                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                : "bg-primary/10 text-primary"
            )}>
              {step.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {step.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Step {currentStep + 1} of {TUTORIAL_STEPS.length}
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Skip tutorial"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pb-3">
          {TUTORIAL_STEPS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentStep
                  ? "w-6 bg-primary"
                  : index < currentStep
                  ? "bg-primary/50"
                  : "bg-gray-300 dark:bg-gray-600"
              )}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Skip tutorial
          </button>
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={isLastStep ? handleComplete : handleNext}
              className={cn(
                "flex items-center gap-1 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
                isLastStep
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-primary hover:bg-primary/90 text-white"
              )}
            >
              {isLastStep ? "Get Started" : "Next"}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to control tutorial visibility
export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);

  const startTutorial = useCallback(() => {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
    setShowTutorial(true);
  }, []);

  const completeTutorial = useCallback(() => {
    setShowTutorial(false);
  }, []);

  return {
    showTutorial,
    startTutorial,
    completeTutorial,
  };
}

export { TUTORIAL_STORAGE_KEY };
export type { TutorialActions };
