import { useState, useEffect, useRef } from 'react';

interface CodeStreamingAnimationProps {
  code: string;
  language?: string;
  onComplete?: () => void;
  speed?: number; // characters per second
  isStreaming: boolean;
}

export function CodeStreamingAnimation({
  code,
  language = 'typescript',
  onComplete,
  speed = 100,
  isStreaming
}: CodeStreamingAnimationProps) {
  const [displayedCode, setDisplayedCode] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const containerRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedCode(code);
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < code.length) {
        // Add multiple characters at once for faster display
        const charsToAdd = Math.min(3, code.length - currentIndex);
        setDisplayedCode(code.slice(0, currentIndex + charsToAdd));
        currentIndex += charsToAdd;

        // Auto-scroll to bottom
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [code, speed, isStreaming, onComplete]);

  // Cursor blink effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // Simple syntax highlighting
  const highlightCode = (text: string): React.ReactNode => {
    if (!text) return null;

    // Basic syntax highlighting patterns
    const patterns = [
      { regex: /(\/\/.*$)/gm, className: 'text-gray-400' }, // Comments
      { regex: /(".*?"|'.*?'|`.*?`)/g, className: 'text-amber-400' }, // Strings
      { regex: /\b(const|let|var|function|return|if|else|for|while|import|export|from|default|class|extends|new|this|async|await|try|catch)\b/g, className: 'text-purple-400' }, // Keywords
      { regex: /\b(true|false|null|undefined)\b/g, className: 'text-orange-400' }, // Booleans/null
      { regex: /\b(\d+)\b/g, className: 'text-cyan-400' }, // Numbers
      { regex: /(&lt;\/?\w+|\/&gt;|&gt;)/g, className: 'text-green-400' }, // JSX tags
      { regex: /(\{|\}|\(|\)|\[|\])/g, className: 'text-gray-300' }, // Brackets
    ];

    let result = text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    patterns.forEach(({ regex, className }) => {
      result = result.replace(regex, `<span class="${className}">$1</span>`);
    });

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  return (
    <div className="relative font-mono text-sm bg-gray-900 rounded-lg overflow-hidden">
      {/* Language badge */}
      <div className="absolute top-2 right-2 px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">
        {language}
      </div>

      {/* Code display */}
      <pre
        ref={containerRef}
        className="p-4 pt-10 overflow-auto max-h-96 text-gray-100"
      >
        <code>
          {highlightCode(displayedCode)}
          {isStreaming && (
            <span
              className={`inline-block w-2 h-5 bg-purple-500 ml-0.5 transition-opacity ${
                cursorVisible ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
        </code>
      </pre>

      {/* Streaming indicator */}
      {isStreaming && (
        <div className="absolute bottom-2 left-2 flex items-center gap-2 px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-400">
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          Writing code...
        </div>
      )}
    </div>
  );
}

// Mini version for chat messages
export function CodeBlockStreaming({
  code,
  language = 'typescript',
  isComplete = true
}: {
  code: string;
  language?: string;
  isComplete?: boolean;
}) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const lines = code.split('\n');

  useEffect(() => {
    if (isComplete) {
      setDisplayedLines(lines);
      return;
    }

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < lines.length) {
        setDisplayedLines(prev => [...prev, lines[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [code, isComplete]);

  return (
    <div className="relative my-2 rounded-lg overflow-hidden bg-gray-900 border border-gray-700">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-400">{language}</span>
        {!isComplete && (
          <span className="flex items-center gap-1.5 text-xs text-purple-400">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
            Generating...
          </span>
        )}
      </div>
      <pre className="p-3 overflow-x-auto text-sm text-gray-100">
        <code>
          {displayedLines.map((line, i) => (
            <div
              key={i}
              className="animate-in fade-in slide-in-from-left-2 duration-150"
              style={{ animationDelay: `${i * 20}ms` }}
            >
              {line || ' '}
            </div>
          ))}
          {!isComplete && (
            <span className="inline-block w-2 h-4 bg-purple-500 animate-pulse" />
          )}
        </code>
      </pre>
    </div>
  );
}
