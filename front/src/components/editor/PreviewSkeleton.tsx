import { Loader2 } from 'lucide-react';

interface PreviewSkeletonProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export function PreviewSkeleton({
  message = 'Loading preview...',
  showProgress = false,
  progress = 0
}: PreviewSkeletonProps) {
  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Skeleton Header */}
      <div className="h-16 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="w-48 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>

      {/* Skeleton Hero */}
      <div className="flex-1 p-8 space-y-8">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-6 pt-12">
          <div className="w-3/4 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto animate-pulse" />
          <div className="w-1/2 h-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
          <div className="flex justify-center gap-4 pt-4">
            <div className="w-32 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="w-32 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto pt-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="w-3/4 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="w-2/3 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-gray-700" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{message}</p>
            {showProgress && (
              <div className="mt-3 w-48">
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">{progress}%</p>
              </div>
            )}
          </div>
        </div>

        {/* Animated Dots */}
        <div className="mt-8 flex gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple loading bar for quick transitions
export function PreviewLoadingBar({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;

  return (
    <div className="absolute top-0 left-0 right-0 h-1 z-50 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 animate-loading-bar" />
    </div>
  );
}

// Hot reload indicator
export function HotReloadIndicator({ isReloading }: { isReloading: boolean }) {
  if (!isReloading) return null;

  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-amber-500 text-white rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2 z-50">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm font-medium">Hot Reloading...</span>
    </div>
  );
}
