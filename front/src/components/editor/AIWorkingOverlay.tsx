import { useState, useEffect } from 'react';
import { Bot, Loader2, CheckCircle } from 'lucide-react';

interface AIWorkingOverlayProps {
  isWorking: boolean;
  currentFile?: string;
  currentAction?: string;
  progress?: number;
  agentName?: string;
  filesModified?: string[];
}

const workingMessages = [
  "Analyzing your request...",
  "Understanding the codebase...",
  "Planning the implementation...",
  "Writing React components...",
  "Applying Tailwind styles...",
  "Optimizing the code...",
  "Adding TypeScript types...",
  "Finalizing changes..."
];

// Dynamic moving block
const MovingBlock = ({
  id,
  phase
}: {
  id: number;
  phase: number;
}) => {
  // Different positions and sizes for each phase (scaled 1.6x for bigger animation)
  const positions = [
    // Phase 0: scattered
    [
      { x: 16, y: 32, w: 128, h: 64, r: 0 },
      { x: 112, y: 96, w: 160, h: 48, r: 0 },
      { x: 48, y: 112, w: 96, h: 96, r: 0 },
      { x: 96, y: 48, w: 192, h: 40, r: 0 },
      { x: 32, y: 80, w: 144, h: 56, r: 0 },
      { x: 80, y: 16, w: 112, h: 72, r: 0 },
    ],
    // Phase 1: moving together
    [
      { x: 32, y: 16, w: 320, h: 64, r: 12 },
      { x: 32, y: 96, w: 128, h: 192, r: 12 },
      { x: 176, y: 96, w: 240, h: 80, r: 12 },
      { x: 176, y: 192, w: 112, h: 96, r: 12 },
      { x: 304, y: 192, w: 112, h: 96, r: 12 },
      { x: 32, y: 304, w: 384, h: 64, r: 12 },
    ],
    // Phase 2: form layout
    [
      { x: 16, y: 8, w: 448, h: 56, r: 16 },
      { x: 16, y: 80, w: 96, h: 288, r: 16 },
      { x: 128, y: 80, w: 336, h: 128, r: 16 },
      { x: 128, y: 224, w: 160, h: 144, r: 16 },
      { x: 304, y: 224, w: 160, h: 144, r: 16 },
      { x: 16, y: 384, w: 448, h: 48, r: 16 },
    ],
    // Phase 3: final UI
    [
      { x: 8, y: 8, w: 464, h: 48, r: 12 },
      { x: 8, y: 72, w: 112, h: 320, r: 12 },
      { x: 136, y: 72, w: 336, h: 96, r: 16 },
      { x: 136, y: 184, w: 160, h: 104, r: 16 },
      { x: 312, y: 184, w: 160, h: 104, r: 16 },
      { x: 136, y: 304, w: 336, h: 88, r: 16 },
    ],
  ];

  const pos = positions[phase][id];
  const colors = [
    'from-violet-400/40 to-violet-500/40 dark:from-violet-600/30 dark:to-violet-700/30',
    'from-purple-400/40 to-purple-500/40 dark:from-purple-600/30 dark:to-purple-700/30',
    'from-pink-400/40 to-pink-500/40 dark:from-pink-600/30 dark:to-pink-700/30',
    'from-blue-400/40 to-blue-500/40 dark:from-blue-600/30 dark:to-blue-700/30',
    'from-indigo-400/40 to-indigo-500/40 dark:from-indigo-600/30 dark:to-indigo-700/30',
    'from-cyan-400/40 to-cyan-500/40 dark:from-cyan-600/30 dark:to-cyan-700/30',
  ];

  return (
    <div
      className={`absolute bg-gradient-to-br ${colors[id]} backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-lg transition-all duration-1000 ease-in-out`}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${pos.w}px`,
        height: `${pos.h}px`,
        borderRadius: `${pos.r}px`,
      }}
    >
      {/* Inner shimmer */}
      <div className="absolute inset-0 overflow-hidden rounded-inherit">
        <div
          className="absolute inset-0 -translate-x-full animate-[shimmer-move_2s_infinite]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          }}
        />
      </div>
    </div>
  );
};

// Floating assembling pieces
const FloatingPiece = ({
  delay,
  duration,
  startX,
  startY,
  endX,
  endY,
  size,
  color
}: {
  delay: number;
  duration: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  color: string;
}) => {
  const [pos, setPos] = useState({ x: startX, y: startY, opacity: 0, scale: 0.5 });

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPos({ x: startX, y: startY, opacity: 1, scale: 1 });
    }, delay);

    const timer2 = setTimeout(() => {
      setPos({ x: endX, y: endY, opacity: 0.8, scale: 0.9 });
    }, delay + 500);

    const timer3 = setTimeout(() => {
      setPos({ x: endX, y: endY, opacity: 0, scale: 0.5 });
    }, delay + duration);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [delay, duration, startX, startY, endX, endY]);

  return (
    <div
      className={`absolute rounded-lg ${color} transition-all duration-700 ease-out`}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        width: `${size}px`,
        height: `${size}px`,
        opacity: pos.opacity,
        transform: `scale(${pos.scale})`,
      }}
    />
  );
};

export function AIWorkingOverlay({
  isWorking,
  currentFile,
  currentAction,
  filesModified = []
}: AIWorkingOverlayProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [phase, setPhase] = useState(0);
  const [pieces, setPieces] = useState<Array<{
    id: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    size: number;
    color: string;
    delay: number;
  }>>([]);

  useEffect(() => {
    if (!isWorking) {
      setPhase(0);
      return;
    }

    // Rotate messages
    const messageInterval = setInterval(() => {
      setMessageIndex(i => (i + 1) % workingMessages.length);
    }, 2500);

    // Cycle through phases
    const phaseInterval = setInterval(() => {
      setPhase(p => (p + 1) % 4);
    }, 2000);

    // Generate floating pieces
    const generatePieces = () => {
      const colors = [
        'bg-violet-400/50 dark:bg-violet-500/40',
        'bg-purple-400/50 dark:bg-purple-500/40',
        'bg-pink-400/50 dark:bg-pink-500/40',
        'bg-blue-400/50 dark:bg-blue-500/40',
        'bg-indigo-400/50 dark:bg-indigo-500/40',
      ];

      const newPieces = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        startX: Math.random() * 80 + 10,
        startY: Math.random() * 30 + 60,
        endX: 35 + Math.random() * 30,
        endY: 25 + Math.random() * 30,
        size: 35 + Math.random() * 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: i * 150,
      }));
      setPieces(newPieces);
    };

    generatePieces();
    const piecesInterval = setInterval(generatePieces, 3000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(phaseInterval);
      clearInterval(piecesInterval);
    };
  }, [isWorking]);

  if (!isWorking) return null;

  return (
    <div className="absolute inset-0 z-40 overflow-hidden bg-gradient-to-br from-gray-50/90 via-white/90 to-gray-100/90 dark:from-gray-900/90 dark:via-gray-950/90 dark:to-gray-900/90 backdrop-blur-md">
      {/* Animated dot grid background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, rgb(139 92 246 / 0.3) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            animation: 'pulse 3s ease-in-out infinite',
          }}
        />
      </div>

      {/* Main building area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[480px] h-[450px]">
          {/* Moving blocks that form UI */}
          {[0, 1, 2, 3, 4, 5].map(id => (
            <MovingBlock key={id} id={id} phase={phase} />
          ))}

          {/* Floating assembling pieces */}
          {pieces.map(piece => (
            <FloatingPiece
              key={piece.id}
              delay={piece.delay}
              duration={2500}
              startX={piece.startX}
              startY={piece.startY}
              endX={piece.endX}
              endY={piece.endY}
              size={piece.size}
              color={piece.color}
            />
          ))}
        </div>
      </div>

      {/* Connection lines animation */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
            <stop offset="50%" stopColor="rgb(139, 92, 246)" stopOpacity="1" />
            <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[...Array(5)].map((_, i) => (
          <line
            key={i}
            x1="0%"
            y1={`${20 + i * 15}%`}
            x2="100%"
            y2={`${30 + i * 12}%`}
            stroke="url(#lineGrad)"
            strokeWidth="1"
            style={{
              animation: `drawLine 3s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </svg>

      {/* Floating status card */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl px-6 py-4 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 flex items-center gap-4">
        {/* AI Avatar with pulse ring */}
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 animate-ping opacity-20" />
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
        </div>

        {/* Status text */}
        <div className="min-w-[200px]">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
            <span className="font-semibold text-gray-900 dark:text-white">AI is building...</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {currentAction || workingMessages[messageIndex]}
          </p>
        </div>

        {/* Files modified badge */}
        {filesModified.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              {filesModified.length}
            </span>
          </div>
        )}
      </div>

      {/* Phase indicator dots */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              phase === i
                ? 'bg-purple-500 scale-125'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>

      <style>{`
        @keyframes shimmer-move {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes drawLine {
          0%, 100% { stroke-dasharray: 0 1000; stroke-dashoffset: 0; }
          50% { stroke-dasharray: 500 1000; stroke-dashoffset: -250; }
        }
        .rounded-inherit {
          border-radius: inherit;
        }
      `}</style>
    </div>
  );
}

// Smaller inline version for the editor header
export function AIWorkingBadge({ isWorking }: { isWorking: boolean }) {
  if (!isWorking) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border border-purple-300 dark:border-purple-700 rounded-full animate-pulse">
      <div className="relative">
        <Bot className="w-4 h-4 text-purple-500" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-ping" />
      </div>
      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">AI Working</span>
    </div>
  );
}
