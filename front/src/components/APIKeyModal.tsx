import { useState, useEffect } from 'react';
import {
  X,
  Key,
  Shield,
  ExternalLink,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';

const API_KEY_STORAGE_KEY = 'artreal_gemini_api_key';
const API_KEY_TYPE_KEY = 'artreal_api_key_type';

interface APIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySet: (key: string, type: 'demo' | 'own') => void;
}

export function APIKeyModal({ isOpen, onClose, onKeySet }: APIKeyModalProps) {
  const [selectedOption, setSelectedOption] = useState<'demo' | 'own'>('demo');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (selectedOption === 'demo') {
      localStorage.setItem(API_KEY_TYPE_KEY, 'demo');
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      onKeySet('', 'demo');
      onClose();
      return;
    }

    if (!apiKey.trim()) {
      setError('Please enter your API key');
      return;
    }

    setIsValidating(true);
    setError('');

    setTimeout(() => {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
      localStorage.setItem(API_KEY_TYPE_KEY, 'own');
      onKeySet(apiKey, 'own');
      setIsValidating(false);
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-50 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">API Key Setup</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Required to use AI features</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Options */}
          <div className="space-y-3">
            {/* Demo Key Option */}
            <button
              onClick={() => setSelectedOption('demo')}
              className={`w-full p-4 rounded-xl border text-left transition-all ${
                selectedOption === 'demo'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedOption === 'demo'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedOption === 'demo' && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Demo Mode</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Limited requests for testing</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                  Limited
                </span>
              </div>
            </button>

            {/* Own Key Option */}
            <button
              onClick={() => setSelectedOption('own')}
              className={`w-full p-4 rounded-xl border text-left transition-all ${
                selectedOption === 'own'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedOption === 'own'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedOption === 'own' && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Own API Key</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Unlimited usage with your key</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-green-600 dark:text-green-400 px-2 py-1 bg-green-50 dark:bg-green-900/30 rounded-md">
                  Unlimited
                </span>
              </div>
            </button>
          </div>

          {/* API Key Input */}
          {selectedOption === 'own' && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => { setApiKey(e.target.value); setError(''); }}
                    placeholder="AIzaSy..."
                    className={`w-full px-4 py-3 pr-12 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {showKey ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                )}
              </div>

              {/* How to Get API Key */}
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  How to get your API key
                </h4>
                <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span>
                      Visit{' '}
                      <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:no-underline inline-flex items-center gap-1"
                      >
                        Google AI Studio
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span>Sign in with Google account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span>Click "Create API Key"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">4</span>
                    <span>Copy and paste above</span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Shield className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
            <span>Your key is stored locally in your browser only. Never sent to our servers.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={handleContinue}
            disabled={isValidating || (selectedOption === 'own' && !apiKey.trim())}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isValidating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Validating...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook to manage API key (for use in other components)
export function useAPIKey() {
  const [apiKey, setApiKey] = useState<string>('');
  const [keyType, setKeyType] = useState<'demo' | 'own' | null>(null);

  useEffect(() => {
    const storedType = localStorage.getItem(API_KEY_TYPE_KEY) as 'demo' | 'own' | null;
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY) || '';

    if (storedType) {
      setKeyType(storedType);
      setApiKey(storedKey);
    }
  }, []);

  const handleKeySet = (key: string, type: 'demo' | 'own') => {
    setApiKey(key);
    setKeyType(type);
  };

  const resetKey = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    localStorage.removeItem(API_KEY_TYPE_KEY);
    setApiKey('');
    setKeyType(null);
  };

  return {
    apiKey,
    keyType,
    handleKeySet,
    resetKey,
    isConfigured: keyType !== null,
  };
}

// Helper to check if API key is configured
export function isAPIKeyConfigured(): boolean {
  return localStorage.getItem(API_KEY_TYPE_KEY) !== null;
}

// Helper to get API key for requests
export function getStoredAPIKey(): { key: string; type: 'demo' | 'own' } {
  const type = localStorage.getItem(API_KEY_TYPE_KEY) as 'demo' | 'own' || 'demo';
  const key = localStorage.getItem(API_KEY_STORAGE_KEY) || '';
  return { key, type };
}

export { API_KEY_STORAGE_KEY, API_KEY_TYPE_KEY };
