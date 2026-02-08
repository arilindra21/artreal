import { WebContainer, FileSystemTree, WebContainerProcess } from '@webcontainer/api';
import { API_URL } from './api';

// ============================================================================
// PRODUCTION-READY WEBCONTAINER SERVICE
// Optimized for fast preview startup with pre-warming
// ============================================================================

// Singleton instances
let webcontainerInstance: WebContainer | null = null;
let webcontainerBootPromise: Promise<WebContainer> | null = null; // Lock for boot
let devServerProcess: WebContainerProcess | null = null;
let currentServerUrl: string | null = null;

// State tracking
let isPreWarming = false;
let isPreWarmed = false;
let preWarmPromise: Promise<void> | null = null;
let currentProjectId: number | null = null;
let installedDependencies: Set<string> = new Set();
let dependenciesInstalledOnce = false; // Track if ANY install has been done this session
let lastWebContainerInstance: WebContainer | null = null; // Track instance for cache invalidation

// Caches
let fileContentCache = new Map<string, string>();
let cachedPackageJson: string | null = null;

/**
 * Verify and reset dependency cache if WebContainer instance changed
 */
function validateDependencyCache(currentInstance: WebContainer): void {
  console.log('[WebContainer] Validating cache:', {
    sameInstance: lastWebContainerInstance === currentInstance,
    cachedDepsCount: installedDependencies.size,
    dependenciesInstalledOnce
  });

  if (lastWebContainerInstance !== currentInstance) {
    // Instance changed - reset tracking
    console.log('[WebContainer] Instance changed, resetting dependency cache');
    installedDependencies.clear();
    dependenciesInstalledOnce = false;
    lastWebContainerInstance = currentInstance;
  } else {
    console.log('[WebContainer] Same instance, keeping cache with', installedDependencies.size, 'packages');
  }
}

// Event callbacks for UI updates
type PreWarmCallback = (status: PreWarmStatus) => void;
let preWarmCallbacks: PreWarmCallback[] = [];

export interface PreWarmStatus {
  stage: 'idle' | 'booting' | 'installing' | 'ready' | 'error';
  message: string;
  progress?: number; // 0-100
}

// Legacy compatibility
let templateInstalled = false;
let cachedNodeModules: FileSystemTree | null = null;

/**
 * Strip ANSI escape codes from terminal output
 */
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, '').replace(/\[[\d]+[GK]/g, '').trim();
}

/**
 * Get or create WebContainer instance (singleton with proper locking)
 * Prevents "Only a single WebContainer instance can be booted" error
 */
export async function getWebContainer(): Promise<WebContainer> {
  // Already have instance - return immediately
  if (webcontainerInstance) {
    return webcontainerInstance;
  }

  // Boot in progress - wait for it
  if (webcontainerBootPromise) {
    console.log('[WebContainer] Boot already in progress, waiting...');
    return webcontainerBootPromise;
  }

  // Start new boot with lock
  console.log('[WebContainer] Booting...');
  webcontainerBootPromise = WebContainer.boot().then((instance) => {
    webcontainerInstance = instance;
    console.log('[WebContainer] Ready');
    return instance;
  }).catch((err) => {
    // Reset promise on error so retry is possible
    webcontainerBootPromise = null;
    throw err;
  });

  return webcontainerBootPromise;
}

// ============================================================================
// PRE-WARM SYSTEM - Boot & install dependencies in background
// ============================================================================

/**
 * Subscribe to pre-warm status updates
 */
export function onPreWarmStatus(callback: PreWarmCallback): () => void {
  preWarmCallbacks.push(callback);
  // Return unsubscribe function
  return () => {
    preWarmCallbacks = preWarmCallbacks.filter(cb => cb !== callback);
  };
}

/**
 * Emit pre-warm status to all subscribers
 */
function emitPreWarmStatus(status: PreWarmStatus) {
  preWarmCallbacks.forEach(cb => cb(status));
}

/**
 * Get current pre-warm status
 */
export function getPreWarmStatus(): PreWarmStatus {
  if (isPreWarmed) return { stage: 'ready', message: 'Ready', progress: 100 };
  if (isPreWarming) return { stage: 'booting', message: 'Preparing...', progress: 50 };
  return { stage: 'idle', message: 'Idle', progress: 0 };
}

/**
 * Base template for Vite + React + TypeScript + Tailwind
 * Minimal dependencies for fast install
 */
const BASE_TEMPLATE_FILES: Record<string, string> = {
  'package.json': JSON.stringify({
    name: 'artreal-project',
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: {
      dev: 'vite --host',
      build: 'tsc && vite build',
      preview: 'vite preview'
    },
    dependencies: {
      'react': '^18.2.0',
      'react-dom': '^18.2.0'
    },
    devDependencies: {
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      '@vitejs/plugin-react': '^4.2.0',
      'autoprefixer': '^10.4.16',
      'postcss': '^8.4.32',
      'tailwindcss': '^3.4.0',
      'typescript': '^5.3.0',
      'vite': '^5.0.0'
    }
  }, null, 2),
  'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  }
})`,
  'tsconfig.json': JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
      noFallthroughCasesInSwitch: true
    },
    include: ['src']
  }, null, 2),
  'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}`,
  'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
  'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ArtReal App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
  'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
  'src/App.tsx': `export default function App() {
  return <div className="p-4">Loading...</div>
}`,
  'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;`
};

/**
 * PRE-WARM: Boot WebContainer and install base dependencies in background
 * Call this when user enters the Editor (not when they click preview)
 *
 * @returns Promise that resolves when pre-warm is complete
 */
export async function preWarmWebContainer(
  onLog?: (message: string) => void
): Promise<void> {
  // Return existing promise if already pre-warming
  if (preWarmPromise) {
    return preWarmPromise;
  }

  // Already pre-warmed
  if (isPreWarmed && webcontainerInstance) {
    onLog?.('[WebContainer] Already pre-warmed ⚡');
    return;
  }

  isPreWarming = true;
  emitPreWarmStatus({ stage: 'booting', message: 'Booting WebContainer...', progress: 10 });

  preWarmPromise = (async () => {
    try {
      const startTime = Date.now();
      onLog?.('[PreWarm] Starting WebContainer pre-warm...');

      // Step 1: Boot WebContainer
      emitPreWarmStatus({ stage: 'booting', message: 'Booting WebContainer...', progress: 20 });
      const container = await getWebContainer();
      onLog?.(`[PreWarm] WebContainer booted in ${Date.now() - startTime}ms`);

      // Step 2: Mount base template
      emitPreWarmStatus({ stage: 'installing', message: 'Preparing base template...', progress: 30 });
      const fileTree = convertToWebContainerFiles(BASE_TEMPLATE_FILES);
      await container.mount(fileTree);
      onLog?.('[PreWarm] Base template mounted');

      // Step 3: Aggressively clean npm cache (prevents EEXIST errors)
      emitPreWarmStatus({ stage: 'installing', message: 'Cleaning cache...', progress: 35 });
      onLog?.('[PreWarm] Cleaning npm cache...');
      try {
        await container.fs.rm('/home/.npm', { recursive: true, force: true });
        onLog?.('[PreWarm] Cache directory removed');
      } catch (e) {
        // Directory might not exist
      }
      const cleanProcess = await container.spawn('npm', ['cache', 'clean', '--force']);
      await cleanProcess.exit;

      // Step 4: Install dependencies with retry logic
      emitPreWarmStatus({ stage: 'installing', message: 'Installing dependencies...', progress: 40 });
      onLog?.('[PreWarm] Installing base dependencies (this runs once)...');

      const maxRetries = 2;
      let exitCode = 1;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        onLog?.(`[PreWarm] npm install attempt ${attempt}/${maxRetries}...`);

        const installProcess = await container.spawn('npm', [
          'install',
          '--prefer-offline',
          '--no-audit',
          '--no-fund',
          '--progress=false',
          '--loglevel=error',
          '--force'  // Force to handle cache issues
        ]);

        // Track progress during install
        let installProgress = 40;
        let hasEEXISTError = false;

        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              const cleaned = stripAnsi(data);
              if (cleaned && cleaned.length > 2) {
                onLog?.(`[npm] ${cleaned}`);
                if (cleaned.includes('EEXIST')) {
                  hasEEXISTError = true;
                }
                // Increment progress gradually
                installProgress = Math.min(installProgress + 2, 85);
                emitPreWarmStatus({
                  stage: 'installing',
                  message: 'Installing dependencies...',
                  progress: installProgress
                });
              }
            },
          })
        );

        exitCode = await installProcess.exit;

        if (exitCode === 0) {
          break; // Success!
        }

        // If EEXIST error and not last attempt, clean and retry
        if (hasEEXISTError && attempt < maxRetries) {
          onLog?.('[PreWarm] ⚠️ Cache error, cleaning and retrying...');
          try {
            await container.fs.rm('/home/.npm', { recursive: true, force: true });
          } catch (e) {}
          const retryClean = await container.spawn('npm', ['cache', 'clean', '--force']);
          await retryClean.exit;
        }
      }

      if (exitCode !== 0) {
        throw new Error(`npm install failed with exit code ${exitCode}`);
      }

      // Track installed dependencies
      const basePkg = JSON.parse(BASE_TEMPLATE_FILES['package.json']);
      Object.keys(basePkg.dependencies || {}).forEach(dep => installedDependencies.add(dep));
      Object.keys(basePkg.devDependencies || {}).forEach(dep => installedDependencies.add(dep));
      cachedPackageJson = BASE_TEMPLATE_FILES['package.json'];

      emitPreWarmStatus({ stage: 'ready', message: 'Ready!', progress: 100 });

      isPreWarmed = true;
      templateInstalled = true;

      const totalTime = Date.now() - startTime;
      onLog?.(`[PreWarm] ✅ Pre-warm complete in ${(totalTime / 1000).toFixed(1)}s`);
      onLog?.('[PreWarm] Future previews will be instant! ⚡');

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      onLog?.(`[PreWarm] ❌ Pre-warm failed: ${message}`);
      emitPreWarmStatus({ stage: 'error', message: `Error: ${message}`, progress: 0 });
      isPreWarming = false;
      preWarmPromise = null;
      throw err;
    } finally {
      isPreWarming = false;
    }
  })();

  return preWarmPromise;
}

/**
 * Check if WebContainer is pre-warmed and ready
 */
export function isWebContainerReady(): boolean {
  return isPreWarmed && webcontainerInstance !== null;
}

/**
 * Detect if project uses Next.js 15+ (needs Turbopack fix)
 */
function detectNextJsVersion(packageJsonContent: string): number {
  try {
    const pkg = JSON.parse(packageJsonContent);
    const nextVersion = pkg.dependencies?.next || pkg.devDependencies?.next;
    if (nextVersion) {
      const versionMatch = nextVersion.match(/(\d+)/);
      return versionMatch ? parseInt(versionMatch[1]) : 0;
    }
  } catch (e) {
    // Ignore
  }
  return 0;
}

/**
 * Auto-fix known compatibility issues in files for WebContainer
 * This modifies files ONLY in WebContainer, not the user's actual files
 */
function autoFixForWebContainer(files: Record<string, string>): string[] {
  const fixes: string[] = [];

  // Check for Next.js 15+
  if (files['package.json']) {
    const nextMajorVersion = detectNextJsVersion(files['package.json']);

    if (nextMajorVersion >= 15) {
      // SOLUTION: Downgrade Next.js to 14.x in WebContainer only
      // This is the most reliable fix for Turbopack WASM compatibility issues
      try {
        const pkg = JSON.parse(files['package.json']);

        // Downgrade next to 14.2.x (last stable before Turbopack default)
        if (pkg.dependencies?.next) {
          pkg.dependencies.next = '14.2.18';
          fixes.push(`Downgraded Next.js ${nextMajorVersion} → 14.2.18 (WebContainer compatibility)`);
        } else if (pkg.devDependencies?.next) {
          pkg.devDependencies.next = '14.2.18';
          fixes.push(`Downgraded Next.js ${nextMajorVersion} → 14.2.18 (WebContainer compatibility)`);
        }

        // Also downgrade eslint-config-next if present
        if (pkg.devDependencies?.['eslint-config-next']) {
          pkg.devDependencies['eslint-config-next'] = '14.2.18';
        }

        // Remove any turbopack-related scripts flags
        if (pkg.scripts?.dev) {
          pkg.scripts.dev = pkg.scripts.dev
            .replace(/\s*--turbo\s*/g, ' ')
            .replace(/\s*--turbopack\s*/g, ' ')
            .replace(/TURBOPACK=\d\s*/g, '')
            .trim();

          // Ensure it's just "next dev"
          if (!pkg.scripts.dev.includes('next dev')) {
            pkg.scripts.dev = 'next dev';
          }
        }

        files['package.json'] = JSON.stringify(pkg, null, 2);

        // IMPORTANT: Next.js 14 doesn't support next.config.ts (Next.js 15+ feature)
        // Replace with a simple working config for preview
        if (files['next.config.ts']) {
          // Delete the TypeScript config
          delete files['next.config.ts'];

          // Create a minimal working config for Next.js 14
          files['next.config.mjs'] = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable type checking during build for preview (faster)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
`;
          fixes.push('Replaced next.config.ts with minimal next.config.mjs (Next.js 14 compatibility)');
        }

        // Also handle next.config.js if it has TypeScript-like syntax
        if (files['next.config.js'] && !files['next.config.mjs']) {
          // Check if it might have issues
          const content = files['next.config.js'];
          if (content.includes('satisfies') || content.includes(': NextConfig') || content.includes('import type')) {
            files['next.config.mjs'] = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
`;
            delete files['next.config.js'];
            fixes.push('Replaced next.config.js with compatible next.config.mjs');
          }
        }
      } catch (e) {
        console.warn('[WebContainer] Failed to downgrade Next.js:', e);
      }
    }
  }

  return fixes;
}

/**
 * Parse dependencies from package.json
 */
function parseDependencies(packageJsonContent: string): Set<string> {
  try {
    const pkg = JSON.parse(packageJsonContent);
    const deps = new Set<string>();
    Object.keys(pkg.dependencies || {}).forEach(d => deps.add(d));
    Object.keys(pkg.devDependencies || {}).forEach(d => deps.add(d));
    return deps;
  } catch {
    return new Set();
  }
}

/**
 * Install only NEW dependencies (not already installed)
 */
async function installNewDependencies(
  newPackageJson: string,
  onLog?: (message: string) => void
): Promise<void> {
  if (!webcontainerInstance) return;

  const newDeps = parseDependencies(newPackageJson);
  const toInstall: string[] = [];

  newDeps.forEach(dep => {
    if (!installedDependencies.has(dep)) {
      toInstall.push(dep);
    }
  });

  if (toInstall.length === 0) {
    onLog?.('[WebContainer] No new dependencies to install');
    return;
  }

  onLog?.(`[WebContainer] Installing ${toInstall.length} new package(s): ${toInstall.join(', ')}`);

  const installProcess = await webcontainerInstance.spawn('npm', [
    'install',
    ...toInstall,
    '--prefer-offline',
    '--no-audit',
    '--no-fund',
    '--progress=false',
    '--force'  // Force to handle cache issues
  ]);

  installProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        const cleaned = stripAnsi(data);
        if (cleaned) onLog?.(`[npm] ${cleaned}`);
      },
    })
  );

  const exitCode = await installProcess.exit;
  if (exitCode === 0) {
    toInstall.forEach(dep => installedDependencies.add(dep));
    cachedPackageJson = newPackageJson;
    onLog?.('[WebContainer] New dependencies installed ✓');
  } else {
    onLog?.(`[WebContainer] ⚠️ Some dependencies may have failed to install`);
  }
}

/**
 * Convert flat files object to WebContainer tree structure
 */
function convertToWebContainerFiles(files: Record<string, string>): FileSystemTree {
  const tree: FileSystemTree = {};

  Object.entries(files).forEach(([path, content]) => {
    const parts = path.split('/');
    let current = tree;

    // Navigate/create directory structure
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = { directory: {} };
      }
      // @ts-ignore
      current = current[part].directory!;
    }

    // Add file
    const fileName = parts[parts.length - 1];
    current[fileName] = {
      file: {
        contents: content,
      },
    };
  });

  return tree;
}

export interface LoadProjectResult {
  url: string;
  logs: string[];
}

// ============================================================================
// FAST PROJECT LOADING - Uses pre-warmed container
// ============================================================================

/**
 * FAST LOAD: Load project using pre-warmed WebContainer
 * This is the production-optimized version that:
 * 1. Uses already-booted WebContainer
 * 2. Only updates changed files (diff-based)
 * 3. Only installs NEW dependencies
 * 4. Reuses running dev server when possible
 *
 * Call preWarmWebContainer() first for best performance!
 */
export async function loadProjectFast(
  projectId: number,
  onLog?: (message: string) => void,
  onError?: (message: string) => void
): Promise<LoadProjectResult> {
  const logs: string[] = [];
  const startTime = Date.now();

  const log = (msg: string) => {
    logs.push(msg);
    onLog?.(msg);
  };

  const error = (msg: string) => {
    logs.push(`ERROR: ${msg}`);
    onError?.(msg);
  };

  try {
    // Check if same project and server already running
    if (currentProjectId === projectId && currentServerUrl && devServerProcess) {
      log('[WebContainer] Same project - reusing running server ⚡');
      // Just sync files
      await reloadProjectFilesFast(projectId, onLog);
      return { url: currentServerUrl, logs };
    }

    // Ensure pre-warmed (will be instant if already done)
    if (!isPreWarmed) {
      log('[WebContainer] Waiting for pre-warm to complete...');
      await preWarmWebContainer(onLog);
    }

    const container = webcontainerInstance!;
    validateDependencyCache(container);
    log('[WebContainer] Using pre-warmed container ⚡');

    // Fetch project files
    log('[WebContainer] Fetching project files...');
    const response = await fetch(`${API_URL}/projects/${projectId}/bundle?t=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.status}`);
    }

    const { files } = await response.json();
    log(`[WebContainer] Received ${Object.keys(files).length} files`);

    // Auto-fix compatibility issues (WebContainer only, doesn't modify user's files)
    const fixes = autoFixForWebContainer(files);
    fixes.forEach(fix => log(`[WebContainer] 🔧 ${fix}`));

    // Inject helpers
    files['screenshot-helper.js'] = SCREENSHOT_HELPER_SCRIPT;
    files['visual-editor-helper.js'] = VISUAL_EDITOR_SCRIPT;

    if (files['index.html']) {
      let html = files['index.html'];
      if (!html.includes('screenshot-helper.js')) {
        html = html.replace('</body>', '<script src="./screenshot-helper.js"></script></body>');
      }
      if (!html.includes('visual-editor-helper.js')) {
        html = html.replace('</body>', '<script src="./visual-editor-helper.js"></script></body>');
      }
      files['index.html'] = html;
    }

    // Check for new dependencies
    if (files['package.json'] && files['package.json'] !== cachedPackageJson) {
      log('[WebContainer] Checking for new dependencies...');
      await installNewDependencies(files['package.json'], onLog);
    }

    // Smart file sync - only write changed files
    const toUpdate: Record<string, string> = {};
    const toDelete: string[] = [];
    const incomingPaths = new Set(Object.keys(files));

    Object.entries(files).forEach(([filepath, content]) => {
      if (fileContentCache.get(filepath) !== content) {
        toUpdate[filepath] = content as string;
      }
    });

    for (const cachedPath of fileContentCache.keys()) {
      // Don't delete node_modules or config files from base template
      if (!incomingPaths.has(cachedPath) && !cachedPath.startsWith('node_modules/')) {
        toDelete.push(cachedPath);
      }
    }

    const updateCount = Object.keys(toUpdate).length;
    const deleteCount = toDelete.length;

    if (updateCount > 0 || deleteCount > 0) {
      log(`[WebContainer] Syncing files: ${updateCount} updates, ${deleteCount} deletions`);

      // Delete removed files
      await Promise.all(
        toDelete.map(async (filepath) => {
          try {
            await container.fs.rm(filepath, { force: true });
            fileContentCache.delete(filepath);
          } catch (e) {
            // Ignore deletion errors
          }
        })
      );

      // Write updated files
      await Promise.all(
        Object.entries(toUpdate).map(async ([filepath, content]) => {
          // Ensure directory exists
          const dir = filepath.split('/').slice(0, -1).join('/');
          if (dir) {
            try {
              await container.fs.mkdir(dir, { recursive: true });
            } catch (e) {
              // Directory may already exist
            }
          }
          await container.fs.writeFile(filepath, content);
          fileContentCache.set(filepath, content);
        })
      );

      log('[WebContainer] Files synced ⚡');
    } else {
      log('[WebContainer] No file changes detected');
    }

    // Start or reuse dev server
    if (!devServerProcess || !currentServerUrl) {
      log('[WebContainer] Starting dev server...');

      devServerProcess = await container.spawn('npm', ['run', 'dev']);

      devServerProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            const cleaned = stripAnsi(data);
            if (cleaned) log(`[dev] ${cleaned}`);
          },
        })
      );

      // Wait for server ready
      return new Promise((resolve, reject) => {
        let resolved = false;

        container.on('server-ready', (port, url) => {
          if (!resolved) {
            resolved = true;
            currentServerUrl = url;
            currentProjectId = projectId;
            const totalTime = Date.now() - startTime;
            log(`[WebContainer] ✅ Server ready in ${(totalTime / 1000).toFixed(1)}s at ${url}`);
            resolve({ url, logs });
          }
        });

        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            error('Dev server timeout (15s)');
            reject(new Error('Dev server timeout'));
          }
        }, 15000);
      });
    } else {
      // Server already running - Vite HMR will handle updates
      currentProjectId = projectId;
      const totalTime = Date.now() - startTime;
      log(`[WebContainer] ✅ Reusing server - loaded in ${(totalTime / 1000).toFixed(1)}s ⚡`);
      return { url: currentServerUrl, logs };
    }

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    error(`Failed to load project: ${message}`);
    throw err;
  }
}

/**
 * Fast file reload for same project (uses diff)
 */
async function reloadProjectFilesFast(
  projectId: number,
  onLog?: (message: string) => void
): Promise<void> {
  if (!webcontainerInstance) return;

  const response = await fetch(`${API_URL}/projects/${projectId}/bundle?t=${Date.now()}`);
  if (!response.ok) throw new Error('Failed to fetch files');

  const { files } = await response.json();

  // Inject helpers
  files['screenshot-helper.js'] = SCREENSHOT_HELPER_SCRIPT;
  files['visual-editor-helper.js'] = VISUAL_EDITOR_SCRIPT;

  if (files['index.html']) {
    let html = files['index.html'];
    if (!html.includes('screenshot-helper.js')) {
      html = html.replace('</body>', '<script src="./screenshot-helper.js"></script></body>');
    }
    if (!html.includes('visual-editor-helper.js')) {
      html = html.replace('</body>', '<script src="./visual-editor-helper.js"></script></body>');
    }
    files['index.html'] = html;
  }

  // Only write changed files
  const updates = Object.entries(files).filter(
    ([path, content]) => fileContentCache.get(path) !== content
  );

  if (updates.length === 0) {
    onLog?.('[WebContainer] No changes to sync');
    return;
  }

  onLog?.(`[WebContainer] Syncing ${updates.length} changed files...`);

  await Promise.all(
    updates.map(async ([filepath, content]) => {
      const dir = filepath.split('/').slice(0, -1).join('/');
      if (dir) {
        try {
          await webcontainerInstance!.fs.mkdir(dir, { recursive: true });
        } catch (e) {}
      }
      await webcontainerInstance!.fs.writeFile(filepath, content as string);
      fileContentCache.set(filepath, content as string);
    })
  );

  onLog?.('[WebContainer] Files synced ⚡');
}

/**
 * Screenshot Capture Helper Script
 * Injects html2canvas into the WebContainer to capture its own DOM
 */
const SCREENSHOT_HELPER_SCRIPT = `
(function() {
  // Silent logging - don't pollute user's console
  const DEBUG = false; // Set to true only for debugging
  const log = DEBUG ? console.log.bind(console) : () => {};

  log('[Screenshot Helper] Initializing...');

  // Wait for app to be fully rendered before allowing screenshots
  let isAppReady = false;

  // Check if app is ready (React root has content)
  const checkAppReady = () => {
    const root = document.querySelector('#root');
    if (root && root.children.length > 0) {
      // Check if there's actual content (not just loading spinner)
      const hasContent = root.textContent && root.textContent.trim().length > 100;
      if (hasContent) {
        isAppReady = true;
        log('[Screenshot Helper] App is ready for capture');
        return true;
      }
    }
    return false;
  };

  // Monitor for app ready state
  const observer = new MutationObserver(() => {
    if (!isAppReady) {
      checkAppReady();
    }
  });

  // Observe the root element for changes
  const root = document.querySelector('#root');
  if (root) {
    observer.observe(root, { childList: true, subtree: true });
  }

  // Check immediately
  setTimeout(() => checkAppReady(), 1000);

  // Listen for screenshot requests from parent
  window.addEventListener('message', async (event) => {
    if (event.data.type === 'capture-screenshot') {
      log('[Screenshot Helper] Received capture request');

      try {
        // Wait for app to be ready
        if (!isAppReady) {
          log('[Screenshot Helper] Waiting for app to be ready...');
          let attempts = 0;
          while (!isAppReady && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 500));
            checkAppReady();
            attempts++;
          }
          if (!isAppReady) {
            throw new Error('App did not become ready in time');
          }
        }

        // Dynamically import html2canvas
        if (!window.html2canvas) {
          log('[Screenshot Helper] Loading html2canvas...');
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
          document.head.appendChild(script);

          // Wait for script to load
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            setTimeout(reject, 5000); // 5s timeout
          });
        }

        log('[Screenshot Helper] Capturing DOM with html2canvas...');

        // Wait a bit more for any animations/renders to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Pre-process images: convert external images to data URLs to avoid CORS issues
        log('[Screenshot Helper] Pre-processing external images...');
        const externalImages = Array.from(document.querySelectorAll('img')).filter(img => {
          const src = img.getAttribute('src') || '';
          return src.startsWith('http') && !src.includes(window.location.hostname);
        });

        // Store original sources and convert to data URLs
        const imageCache = new Map();
        for (const img of externalImages) {
          const src = img.src;
          if (imageCache.has(src)) continue;

          try {
            // Try to load image through a canvas to convert to data URL
            const response = await fetch(src, { mode: 'cors' });
            const blob = await response.blob();
            const dataUrl = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
            imageCache.set(src, dataUrl);
            log('[Screenshot Helper] Converted external image to data URL:', src);
          } catch (err) {
            log('[Screenshot Helper] Failed to convert image, will use placeholder:', src);
            imageCache.set(src, null); // Mark as failed
          }
        }

        // Capture the #root element (where React app lives)
        const targetElement = document.querySelector('#root') || document.body;

        const canvas = await window.html2canvas(targetElement, {
          allowTaint: false,  // CRITICAL: Must be false to export canvas
          useCORS: false,     // Don't rely on CORS, we've pre-processed images
          logging: false,     // Reduce console noise
          scale: 1,
          backgroundColor: '#ffffff',
          width: Math.max(window.innerWidth, 1280),
          height: Math.max(window.innerHeight, 720),
          windowWidth: 1280,
          windowHeight: 720,
          onclone: (clonedDoc) => {
            log('[Screenshot Helper] Document cloned, replacing external images...');

            // Replace external images with data URLs or placeholders
            const images = clonedDoc.querySelectorAll('img');
            let replacedCount = 0;
            let placeholderCount = 0;

            images.forEach(img => {
              const src = img.getAttribute('src') || '';
              if (src.startsWith('http') && !src.includes(window.location.hostname)) {
                const dataUrl = imageCache.get(src);
                if (dataUrl) {
                  // Replace with data URL
                  img.src = dataUrl;
                  replacedCount++;
                } else {
                  // Create a nice placeholder with the image dimensions
                  const width = img.width || 200;
                  const height = img.height || 150;
                  img.style.width = width + 'px';
                  img.style.height = height + 'px';
                  img.style.backgroundColor = '#f3f4f6';
                  img.style.border = '2px dashed #d1d5db';
                  img.style.display = 'flex';
                  img.style.alignItems = 'center';
                  img.style.justifyContent = 'center';
                  img.removeAttribute('src');
                  img.alt = '🖼️';
                  placeholderCount++;
                }
              }
            });

            log('[Screenshot Helper] Images replaced:', replacedCount, 'Placeholders:', placeholderCount);
          }
        });

        const dataUrl = canvas.toDataURL('image/png');

        // Validate canvas has content (not blank)
        if (canvas.width === 0 || canvas.height === 0) {
          throw new Error('Canvas has no dimensions');
        }

        log('[Screenshot Helper] Capture successful:', {
          width: canvas.width,
          height: canvas.height,
          dataLength: dataUrl.length
        });

        // Send screenshot back to parent
        window.parent.postMessage({
          type: 'screenshot-captured',
          data: dataUrl
        }, '*');
      } catch (error) {
        // Only log errors - these are important
        if (DEBUG) {
          console.error('[Screenshot Helper] Capture failed:', error);
        }
        window.parent.postMessage({
          type: 'screenshot-error',
          error: error instanceof Error ? error.message : String(error)
        }, '*');
      }
    }
  });

  log('[Screenshot Helper] Ready');
})();
`;

/**
 * Visual Editor Script - Injects into WebContainer for element selection
 */
const VISUAL_EDITOR_SCRIPT = `
(function() {
  console.log('[VisualEditor] Helper script initialized');
  let isVisualMode = false;
  let isQuickInspectMode = false;
  let selectedElement = null;
  let hoveredElement = null;

  // Add styles for visual editor and quick inspect
  const style = document.createElement('style');
  style.textContent = \`
    .visual-editor-mode { cursor: crosshair !important; }
    .visual-editor-hover { outline: 2px dashed #3b82f6 !important; z-index: 9999 !important; }
    .visual-editor-selected { outline: 2px solid #3b82f6 !important; z-index: 9999 !important; }
    .quick-inspect-mode { cursor: help !important; }
    .quick-inspect-hover { outline: 2px dashed #8b5cf6 !important; z-index: 9999 !important; }
    .quick-inspect-tooltip {
      position: fixed;
      z-index: 99999;
      background: linear-gradient(135deg, #1e1e2e 0%, #2d2d3d 100%);
      color: #fff;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 12px;
      font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
      max-width: 400px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1);
      pointer-events: none;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.15s, transform 0.15s;
      backdrop-filter: blur(10px);
    }
    .quick-inspect-tooltip.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .quick-inspect-tooltip-tag {
      color: #f472b6;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .quick-inspect-tooltip-classes {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 8px;
    }
    .quick-inspect-tooltip-class {
      background: rgba(139, 92, 246, 0.3);
      color: #c4b5fd;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      border: 1px solid rgba(139, 92, 246, 0.4);
    }
    .quick-inspect-tooltip-hint {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid rgba(255,255,255,0.1);
      color: #888;
      font-size: 10px;
    }
    .quick-inspect-tooltip-no-classes {
      color: #888;
      font-style: italic;
    }
  \`;
  document.head.appendChild(style);

  // Create tooltip element for quick inspect
  const tooltip = document.createElement('div');
  tooltip.className = 'quick-inspect-tooltip';
  document.body.appendChild(tooltip);

  let tooltipTimeout = null;

  // Handle messages from parent
  window.addEventListener('message', (event) => {
    const { type, enabled, property, value } = event.data;

    if (type === 'visual-editor:toggle-mode') {
      isVisualMode = enabled;
      console.log('[VisualEditor] Mode toggled:', isVisualMode);
      if (isVisualMode) {
        document.body.classList.add('visual-editor-mode');
        // Disable quick inspect when visual editor is on
        if (isQuickInspectMode) {
          isQuickInspectMode = false;
          document.body.classList.remove('quick-inspect-mode');
          hideTooltip();
        }
      } else {
        document.body.classList.remove('visual-editor-mode');
        clearSelection();
      }
    } else if (type === 'quick-inspect:toggle-mode') {
      isQuickInspectMode = enabled;
      console.log('[QuickInspect] Mode toggled:', isQuickInspectMode);
      if (isQuickInspectMode) {
        document.body.classList.add('quick-inspect-mode');
        // Disable visual editor when quick inspect is on
        if (isVisualMode) {
          isVisualMode = false;
          document.body.classList.remove('visual-editor-mode');
          clearSelection();
        }
      } else {
        document.body.classList.remove('quick-inspect-mode');
        hideTooltip();
        clearQuickInspectHover();
      }
    } else if (type === 'visual-editor:update-style') {
      if (selectedElement) {
        console.log('[VisualEditor] Updating style:', property, value);
        selectedElement.style[property] = value;
      }
    }
  });

  function hideTooltip() {
    tooltip.classList.remove('visible');
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      tooltipTimeout = null;
    }
  }

  function clearQuickInspectHover() {
    const hovered = document.querySelector('.quick-inspect-hover');
    if (hovered) {
      hovered.classList.remove('quick-inspect-hover');
    }
  }

  function showQuickInspectTooltip(element, event) {
    // Get classes (clean)
    const classes = element.className
      .split(' ')
      .filter(c => c && !c.startsWith('quick-inspect-') && !c.startsWith('visual-editor-'))
      .map(c => c.trim());

    const tagName = element.tagName.toLowerCase();
    const id = element.id ? '#' + element.id : '';

    let html = '<div class="quick-inspect-tooltip-tag">&lt;' + tagName + id + '&gt;</div>';

    if (classes.length > 0) {
      html += '<div class="quick-inspect-tooltip-classes">';
      classes.forEach(cls => {
        html += '<span class="quick-inspect-tooltip-class">' + cls + '</span>';
      });
      html += '</div>';
    } else {
      html += '<div class="quick-inspect-tooltip-no-classes">No classes</div>';
    }

    html += '<div class="quick-inspect-tooltip-hint">Click to copy classes</div>';

    tooltip.innerHTML = html;

    // Position tooltip near cursor
    const x = event.clientX + 15;
    const y = event.clientY + 15;

    // Keep tooltip in viewport
    const rect = tooltip.getBoundingClientRect();
    const maxX = window.innerWidth - 420;
    const maxY = window.innerHeight - 150;

    tooltip.style.left = Math.min(x, maxX) + 'px';
    tooltip.style.top = Math.min(y, maxY) + 'px';

    // Show with small delay for smoother experience
    if (tooltipTimeout) clearTimeout(tooltipTimeout);
    tooltipTimeout = setTimeout(() => {
      tooltip.classList.add('visible');
    }, 50);
  }

  function clearSelection() {
    if (selectedElement) {
      selectedElement.classList.remove('visual-editor-selected');
      selectedElement = null;
    }
    if (hoveredElement) {
      hoveredElement.classList.remove('visual-editor-hover');
      hoveredElement = null;
    }
  }

  // Mouse interaction
  document.addEventListener('mouseover', (e) => {
    // Handle Quick Inspect mode
    if (isQuickInspectMode) {
      e.stopPropagation();
      clearQuickInspectHover();
      e.target.classList.add('quick-inspect-hover');
      showQuickInspectTooltip(e.target, e);
      return;
    }

    if (!isVisualMode) return;
    e.stopPropagation();

    if (hoveredElement && hoveredElement !== selectedElement) {
      hoveredElement.classList.remove('visual-editor-hover');
    }

    hoveredElement = e.target;
    if (hoveredElement !== selectedElement) {
      hoveredElement.classList.add('visual-editor-hover');
    }
  }, true);

  document.addEventListener('mousemove', (e) => {
    // Update tooltip position during Quick Inspect
    if (isQuickInspectMode && tooltip.classList.contains('visible')) {
      const x = e.clientX + 15;
      const y = e.clientY + 15;
      const maxX = window.innerWidth - 420;
      const maxY = window.innerHeight - 150;
      tooltip.style.left = Math.min(x, maxX) + 'px';
      tooltip.style.top = Math.min(y, maxY) + 'px';
    }
  }, true);

  document.addEventListener('mouseout', (e) => {
    // Handle Quick Inspect mode
    if (isQuickInspectMode) {
      if (e.target.classList.contains('quick-inspect-hover')) {
        e.target.classList.remove('quick-inspect-hover');
      }
      hideTooltip();
      return;
    }

    if (!isVisualMode) return;
    if (e.target.classList.contains('visual-editor-hover')) {
      e.target.classList.remove('visual-editor-hover');
    }
  }, true);

  document.addEventListener('click', (e) => {
    // Handle Quick Inspect click - copy classes to clipboard
    if (isQuickInspectMode) {
      e.preventDefault();
      e.stopPropagation();

      const classes = e.target.className
        .split(' ')
        .filter(c => c && !c.startsWith('quick-inspect-') && !c.startsWith('visual-editor-'))
        .join(' ');

      if (classes) {
        navigator.clipboard.writeText(classes).then(() => {
          // Show copied feedback
          const origHtml = tooltip.innerHTML;
          tooltip.innerHTML = '<div style="color: #22c55e; font-weight: 600;">✓ Copied to clipboard!</div>';
          setTimeout(() => {
            tooltip.innerHTML = origHtml;
          }, 1000);

          // Notify parent
          window.parent.postMessage({
            type: 'quick-inspect:copied',
            classes: classes
          }, '*');
        });
      }
      return;
    }

    if (!isVisualMode) return;
    e.preventDefault();
    e.stopPropagation();

    if (selectedElement) {
      selectedElement.classList.remove('visual-editor-selected');
    }

    selectedElement = e.target;

    // CRITICAL: Remove ALL dynamic classes BEFORE capturing className
    // Otherwise we send className with visual-editor-hover or visual-editor-selected
    selectedElement.classList.remove('visual-editor-hover');
    selectedElement.classList.remove('visual-editor-selected');

    // NOW get the original className (without any dynamic classes)
    const elementId = selectedElement.id || '';
    const tagName = selectedElement.tagName.toLowerCase();
    const className = selectedElement.className; // Get CLEAN original className

    // NOW add the selection styling
    selectedElement.classList.add('visual-editor-selected');

    // Generate a unique selector
    const getSelector = (el) => {
      if (el.id) return '#' + el.id;

      let path = [];
      let current = el;

      while (current && current !== document.body) {
        let selector = current.tagName.toLowerCase();

        if (current.id) {
          selector += '#' + current.id;
          path.unshift(selector);
          break;
        } else {
          let nth = 1;
          let sibling = current;
          while (sibling = sibling.previousElementSibling) {
            if (sibling.tagName.toLowerCase() === selector) nth++;
          }
          if (nth !== 1) selector += ':nth-of-type(' + nth + ')';
        }

        path.unshift(selector);
        current = current.parentElement;
      }

      return path.join(' > ');
    };

    const selector = getSelector(selectedElement);
    const innerText = selectedElement.innerText ? selectedElement.innerText.substring(0, 100) : '';

    // Get useful attributes
    const attributes = {};
    ['src', 'href', 'placeholder', 'type', 'name', 'value', 'alt'].forEach(attr => {
      if (selectedElement.hasAttribute(attr)) {
        attributes[attr] = selectedElement.getAttribute(attr);
      }
    });

    console.log('[VisualEditor] Selected:', tagName, elementId, selector);

    // Helper to find React Fiber
    const getReactFiber = (el) => {
      for (const key in el) {
        if (key.startsWith('__reactFiber$')) {
          return el[key];
        }
      }
      return null;
    };

    // Helper to get source from fiber
    const getSource = (el) => {
      let fiber = getReactFiber(el);
      while (fiber) {
        if (fiber._debugSource) {
          return fiber._debugSource;
        }
        fiber = fiber.return;
      }
      return null;
    };

    const source = getSource(selectedElement);
    console.log('[VisualEditor] Source:', source);

    // Send selection to parent
    window.parent.postMessage({
      type: 'visual-editor:selected',
      elementId,
      tagName,
      className,
      selector,
      innerText,
      attributes,
      source
    }, '*');
  }, true);
})();
`;


/**
 * Load project into WebContainer and start dev server
 * OPTIMIZED: Skip npm install if already done, faster mounting
 */
export async function loadProject(
  projectId: number,
  onLog?: (message: string) => void,
  onError?: (message: string) => void,
  forceReinstall = false
): Promise<LoadProjectResult> {
  const logs: string[] = [];

  const log = (msg: string) => {
    logs.push(msg);
    if (onLog) onLog(msg);
  };

  const error = (msg: string) => {
    logs.push(`ERROR: ${msg}`);
    if (onError) onError(msg);
  };

  try {
    // OPTIMIZATION 1: Parallel container boot + file fetch
    log('[WebContainer] Initializing...');
    const [container, response] = await Promise.all([
      getWebContainer(),
      fetch(`${API_URL}/projects/${projectId}/bundle?t=${Date.now()}`)
    ]);

    // Validate dependency cache matches current instance
    validateDependencyCache(container);

    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.status} ${response.statusText}`);
    }

    const { files } = await response.json();
    log(`[WebContainer] Received ${Object.keys(files).length} files`);

    // Auto-fix compatibility issues (WebContainer only, doesn't modify user's files)
    const fixes = autoFixForWebContainer(files);
    fixes.forEach(fix => log(`[WebContainer] 🔧 ${fix}`));

    // INJECT SCREENSHOT HELPER: Always inject to enable screenshot capture
    files['screenshot-helper.js'] = SCREENSHOT_HELPER_SCRIPT;

    // INJECT VISUAL EDITOR HELPER: Always inject to enable visual editing mode
    files['visual-editor-helper.js'] = VISUAL_EDITOR_SCRIPT;

    if (files['index.html']) {
      let htmlContent = files['index.html'];

      // Inject screenshot helper if not already present
      if (!htmlContent.includes('screenshot-helper.js')) {
        htmlContent = htmlContent.replace(
          '</body>',
          '<script src="./screenshot-helper.js"></script></body>'
        );
      }

      // Inject visual editor helper if not already present
      if (!htmlContent.includes('visual-editor-helper.js')) {
        htmlContent = htmlContent.replace(
          '</body>',
          '<script src="./visual-editor-helper.js"></script></body>'
        );
      }

      files['index.html'] = htmlContent;
      log('[WebContainer] Screenshot helper and Visual Editor injected');
    }

    // OPTIMIZATION 4: Fast file tree conversion (already optimized)
    log('[WebContainer] Preparing files...');
    const fileTree = convertToWebContainerFiles(files);

    // Initialize cache
    fileContentCache.clear();
    Object.entries(files).forEach(([path, content]) => {
      fileContentCache.set(path, content as string);
    });

    log('[WebContainer] Mounting files...');
    await container.mount(fileTree);
    log('[WebContainer] Mounted ⚡');

    // OPTIMIZATION 5: Smart dependency installation
    // Check if package.json exists to determine install method
    const hasPackageJson = 'package.json' in files;

    if (!hasPackageJson) {
      log('[WebContainer] No package.json found, skipping install');
      templateInstalled = true;
    } else {
      // Parse current project's dependencies
      let projectDeps: Set<string> = new Set();
      let newDepsToInstall: string[] = [];

      try {
        const pkgJson = JSON.parse(files['package.json'] as string);
        const allDeps = {
          ...pkgJson.dependencies,
          ...pkgJson.devDependencies
        };

        Object.keys(allDeps).forEach(dep => projectDeps.add(dep));

        // Find dependencies not yet installed
        projectDeps.forEach(dep => {
          if (!installedDependencies.has(dep)) {
            newDepsToInstall.push(dep);
          }
        });

        const totalDeps = projectDeps.size;
        const alreadyInstalled = totalDeps - newDepsToInstall.length;

        log(`[WebContainer] Dependencies: ${totalDeps} total, ${alreadyInstalled} cached, ${newDepsToInstall.length} new`);
      } catch (e) {
        // If parsing fails, do full install
        newDepsToInstall = ['--all'];
      }

      // SMART INSTALL: Only install if needed
      const needsFullInstall = !dependenciesInstalledOnce || forceReinstall || newDepsToInstall.includes('--all');
      const needsPartialInstall = newDepsToInstall.length > 0 && !needsFullInstall;

      if (!needsFullInstall && !needsPartialInstall) {
        log('[WebContainer] All dependencies already installed ⚡');
      } else if (needsPartialInstall && newDepsToInstall.length <= 20) {
        // Install only new dependencies (faster for small changes)
        log(`[WebContainer] Installing ${newDepsToInstall.length} new dependencies...`);

        const installProcess = await container.spawn('npm', [
          'install',
          ...newDepsToInstall,
          '--prefer-offline',
          '--no-audit',
          '--no-fund',
          '--progress=false',
          '--loglevel=error',
          '--force'
        ]);

        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              const cleaned = stripAnsi(data);
              if (cleaned && cleaned.length > 2) {
                log(`[npm] ${cleaned}`);
              }
            },
          })
        );

        const exitCode = await installProcess.exit;
        if (exitCode === 0) {
          newDepsToInstall.forEach(dep => installedDependencies.add(dep));
          log('[WebContainer] New dependencies installed ✓');
        } else {
          log('[WebContainer] ⚠️ Partial install failed, doing full install...');
          // Fall through to full install
        }
      }

      // Full install if needed
      if (needsFullInstall || (needsPartialInstall && newDepsToInstall.length > 20)) {
        log('[WebContainer] Installing all dependencies (this may take 1-2 minutes)...');

        // OPTIMIZATION 6: Use npm ci if package-lock exists (faster), otherwise npm install
        const hasLockFile = 'package-lock.json' in files;
        const installCmd = hasLockFile ? 'ci' : 'install';

        // Aggressively clean npm cache to prevent EEXIST errors
        log('[WebContainer] Cleaning npm cache...');
        try {
          // Remove the entire cache directory
          await container.fs.rm('/home/.npm', { recursive: true, force: true });
          log('[WebContainer] Cache directory removed');
        } catch (e) {
          // Directory might not exist, that's fine
        }

        // Also run npm cache clean for good measure
        const cleanProcess = await container.spawn('npm', ['cache', 'clean', '--force']);
        await cleanProcess.exit;

        // Retry logic for npm install
        const maxRetries = 2;
        let installExitCode = 1;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          log(`[WebContainer] Running npm ${installCmd}... (attempt ${attempt}/${maxRetries})`);

          const installProcess = await container.spawn('npm', [
            installCmd,
            '--prefer-offline',      // Use offline cache first
            '--no-audit',            // Skip security audit
            '--no-fund',             // Skip funding messages
            '--progress=false',      // Disable progress bar
            '--loglevel=error',      // Only show errors
            '--force',               // Force to handle cache issues
            ...(installCmd === 'install' ? ['--ignore-scripts'] : [])  // Skip postinstall for install only
          ]);

          // Simplified output streaming with progress indicator
          let lastLogTime = Date.now();
          let hasEEXISTError = false;

          installProcess.output.pipeTo(
            new WritableStream({
              write(data) {
                const cleaned = stripAnsi(data);
                if (cleaned && cleaned.length > 2) {
                  log(`[npm] ${cleaned}`);
                  if (cleaned.includes('EEXIST')) {
                    hasEEXISTError = true;
                  }
                }
                // Show periodic progress for long installs
                const now = Date.now();
                if (now - lastLogTime > 10000) { // Every 10 seconds
                  log('[WebContainer] Still installing... please wait');
                  lastLogTime = now;
                }
              },
            })
          );

          installExitCode = await installProcess.exit;

          if (installExitCode === 0) {
            break; // Success!
          }

          // If EEXIST error and not last attempt, clean cache and retry
          if (hasEEXISTError && attempt < maxRetries) {
            log('[WebContainer] ⚠️ Cache error detected, cleaning and retrying...');
            try {
              await container.fs.rm('/home/.npm', { recursive: true, force: true });
            } catch (e) {}
            const retryClean = await container.spawn('npm', ['cache', 'clean', '--force']);
            await retryClean.exit;
          }
        }

        if (installExitCode !== 0) {
          throw new Error(`npm ${installCmd} failed with exit code ${installExitCode}`);
        }

        // Track all installed dependencies for future smart installs
        try {
          const pkgJson = JSON.parse(files['package.json'] as string);
          Object.keys(pkgJson.dependencies || {}).forEach(dep => installedDependencies.add(dep));
          Object.keys(pkgJson.devDependencies || {}).forEach(dep => installedDependencies.add(dep));
        } catch (e) {}

        dependenciesInstalledOnce = true;
        templateInstalled = true;
        log('[WebContainer] Dependencies installed ✓');
        log(`[WebContainer] Cached ${installedDependencies.size} packages for future use`);
      }
    }

    log('[WebContainer] Starting dev server...');

    const devProcess = await container.spawn('npm', ['run', 'dev']);

    // Stream dev server output
    devProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          const cleaned = stripAnsi(data);
          if (cleaned) {
            log(`[dev] ${cleaned}`);
          }
        },
      })
    );

    // Wait for server to be ready with optimized timeout
    log('[WebContainer] Waiting for dev server...');

    return new Promise((resolve, reject) => {
      let serverUrl = '';
      let resolved = false;

      // Listen for server ready event
      container.on('server-ready', (port, url) => {
        if (!resolved) {
          resolved = true;
          log(`[WebContainer] Server ready at ${url}`);
          serverUrl = url;
          resolve({ url, logs });
        }
      });

      // Reduced timeout to 15 seconds (was 30)
      setTimeout(() => {
        if (!serverUrl && !resolved) {
          resolved = true;
          const msg = 'Dev server startup timeout (15s)';
          error(msg);
          reject(new Error(msg));
        }
      }, 15000);
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    error(`Failed to load project: ${message}`);
    throw err;
  }
}

/**
 * Update a file in the WebContainer
 */
export async function updateFile(filepath: string, content: string): Promise<void> {
  if (!webcontainerInstance) {
    throw new Error('WebContainer not initialized');
  }

  await webcontainerInstance.fs.writeFile(filepath, content);
}

/**
 * Restart the dev server
 */
export async function restartDevServer(): Promise<void> {
  if (!webcontainerInstance) {
    throw new Error('WebContainer not initialized');
  }

  // Kill existing dev server process
  // Note: This is a simplified version - you might want to track the process
  const devProcess = await webcontainerInstance.spawn('npm', ['run', 'dev']);

  devProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        const cleaned = stripAnsi(data);
        if (cleaned) {
          console.log(`[dev] ${cleaned}`);
        }
      },
    })
  );
}

/**
 * Get file content from WebContainer
 */
export async function readFile(filepath: string): Promise<string> {
  if (!webcontainerInstance) {
    throw new Error('WebContainer not initialized');
  }

  const content = await webcontainerInstance.fs.readFile(filepath, 'utf-8');
  return content;
}

/**
 * Reload project files WITHOUT reinstalling dependencies or restarting server
 * This is much lighter than loadProject() - use this for incremental updates
 * OPTIMIZED: Batch file writes for better performance
 */
export async function reloadProjectFiles(
  projectId: number,
  onLog?: (message: string) => void
): Promise<void> {
  const log = (msg: string) => {
    console.log(msg); // Force log to console for debugging!
    if (onLog) onLog(msg);
  };

  try {
    if (!webcontainerInstance) {
      throw new Error('WebContainer not initialized. Call loadProject first.');
    }

    log('[WebContainer] Fetching updated files...');
    log('[WebContainer] Fetching updated files...');
    const response = await fetch(`${API_URL}/projects/${projectId}/bundle?t=${Date.now()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.status} ${response.statusText}`);
    }

    const { files } = await response.json();
    log(`[WebContainer] Syncing ${Object.keys(files).length} files...`);

    // Calculate Diff
    const toUpdate: Record<string, string> = {};
    const toDelete: string[] = [];
    const incomingPaths = new Set(Object.keys(files));

    // 1. Find updates/adds
    Object.entries(files).forEach(([filepath, content]) => {
      const currentContent = fileContentCache.get(filepath);
      if (currentContent !== content) {
        toUpdate[filepath] = content as string;
      }
    });

    // 2. Find deletions (in cache but not in new files)
    for (const cachedPath of fileContentCache.keys()) {
      if (!incomingPaths.has(cachedPath)) {
        toDelete.push(cachedPath);
      }
    }

    const updatesCount = Object.keys(toUpdate).length;
    const deletesCount = toDelete.length;

    if (updatesCount === 0 && deletesCount === 0) {
      log('[WebContainer] No changes detected, skipping writes.');
      return;
    }

    log(`[WebContainer] Applying changes: ${updatesCount} updates, ${deletesCount} deletions...`);

    // Apply Deletions
    if (toDelete.length > 0) {
      await Promise.all(
        toDelete.map(async (filepath) => {
          try {
            await webcontainerInstance!.fs.rm(filepath, { force: true });
            fileContentCache.delete(filepath);
          } catch (e) {
            console.warn(`[WebContainer] Failed to delete ${filepath}:`, e);
          }
        })
      );
    }

    // Apply Updates
    if (updatesCount > 0) {
      const writePromises = Object.entries(toUpdate).map(async ([filepath, content]) => {
        await webcontainerInstance!.fs.writeFile(filepath, content);
        fileContentCache.set(filepath, content);
      });
      await Promise.all(writePromises);
    }

    log('[WebContainer] Files synced ⚡');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (onLog) onLog(`ERROR: Failed to reload files: ${message}`);
    throw err;
  }
}

/**
 * Update project files directly (Push model)
 */
export async function updateProjectFiles(
  files: Array<{ path: string, content: string }>,
  onLog?: (message: string) => void
): Promise<void> {
  if (!webcontainerInstance) {
    if (onLog) onLog('⚠️ WebContainer not initialized, skipping update');
    return;
  }

  const log = (msg: string) => {
    console.log(msg);
    if (onLog) onLog(msg);
  };

  try {
    // Execute writes sequentially to minimize HMR race conditions
    for (const file of files) {
      await webcontainerInstance!.fs.writeFile(file.path, file.content);
      fileContentCache.set(file.path, file.content);
    }

    log(`[WebContainer] Pushed ${files.length} file updates ⚡`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (onLog) onLog(`ERROR: Failed to push updates: ${message}`);
    throw err;
  }
}

/**
 * Clean up WebContainer instance
 */
export async function teardown(): Promise<void> {
  if (webcontainerInstance) {
    await webcontainerInstance.teardown();
    webcontainerInstance = null;
    templateInstalled = false;
    cachedNodeModules = null;
    fileContentCache.clear();
  }
}

/**
 * Force reinstall dependencies on next load
 */
export function clearTemplateCache(): void {
  templateInstalled = false;
  cachedNodeModules = null;
  fileContentCache.clear();
}

/**
 * Enable Visual Editor by injecting helper script
 * Call this only when visual editor mode is activated
 */
export async function enableVisualEditor(): Promise<void> {
  if (!webcontainerInstance) {
    throw new Error('WebContainer not initialized');
  }

  // Write visual editor helper script
  await webcontainerInstance.fs.writeFile('visual-editor-helper.js', VISUAL_EDITOR_SCRIPT);

  // Read and update index.html
  const indexHtml = await webcontainerInstance.fs.readFile('index.html', 'utf-8');

  if (!indexHtml.includes('visual-editor-helper.js')) {
    const updatedHtml = indexHtml.replace(
      '</body>',
      '<script src="./visual-editor-helper.js"></script></body>'
    );
    await webcontainerInstance.fs.writeFile('index.html', updatedHtml);
    console.log('[WebContainer] Visual Editor enabled');
  }
}
