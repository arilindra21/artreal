import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Code2,
  Eye,
  Layers,
  GitBranch,
  Play,
  ChevronRight,
  Star,
  ArrowUpRight,
  Cpu,
  Palette,
  Shield,
  Check,
  Plus,
  Image as ImageIcon,
  FileText,
  X,
  Loader2,
  Github,
  Wand2,
  Rocket,
  Terminal,
  MousePointer,
  Box,
  Braces,
  Layout,
  Monitor,
  Smartphone,
  Tablet,
  CircuitBoard,
  ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GitHubImportModal } from "@/components/GitHubImportModal";
import { APIKeyModal, API_KEY_TYPE_KEY } from "@/components/APIKeyModal";

interface FileAttachment {
  id: string;
  name: string;
  type: 'image' | 'pdf';
  mime_type: string;
  size: number;
  url?: string;
  data?: string;
}

// Floating particles with code symbols
const FloatingParticles = () => {
  const particles = useMemo(() =>
    [...Array(30)].map((_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 10,
      size: 4 + Math.random() * 8,
      symbol: ['<', '>', '/', '{', '}', '(', ')', ';', '=', '+'][Math.floor(Math.random() * 10)]
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute text-primary/20 font-mono font-bold animate-float-slow"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            fontSize: `${p.size}px`,
          }}
        >
          {p.symbol}
        </div>
      ))}
    </div>
  );
};

// Animated gradient orbs with more dynamic effects
const GradientOrbs = () => {
  return (
    <>
      <div className="absolute top-10 left-[5%] w-[600px] h-[600px] bg-gradient-to-br from-blue-500/40 to-cyan-400/30 rounded-full blur-[120px] animate-float-slow" />
      <div className="absolute bottom-10 right-[5%] w-[500px] h-[500px] bg-gradient-to-br from-purple-500/35 to-pink-400/25 rounded-full blur-[100px] animate-float-medium" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-primary/15 to-violet-500/15 rounded-full blur-[150px] animate-morph" />
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-gradient-to-br from-emerald-400/20 to-teal-400/15 rounded-full blur-[80px] animate-float-fast" style={{ animationDelay: '1s' }} />
    </>
  );
};

// 3D Floating Code Window Component
const FloatingCodeWindow = ({ className, delay = 0 }: { className?: string; delay?: number }) => {
  const codeLines = [
    { text: 'const App = () => {', color: 'text-purple-400' },
    { text: '  const [data, setData] = useState([])', color: 'text-blue-400' },
    { text: '  return <Dashboard data={data} />', color: 'text-green-400' },
    { text: '}', color: 'text-purple-400' },
  ];

  return (
    <div
      className={`absolute bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden transform-gpu ${className}`}
      style={{
        animationDelay: `${delay}s`,
        transform: 'perspective(1000px) rotateY(-10deg) rotateX(5deg)'
      }}
    >
      <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-800/80 border-b border-white/5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <span className="ml-2 text-[10px] text-gray-400 font-mono">App.tsx</span>
      </div>
      <div className="p-3 font-mono text-[11px] space-y-1">
        {codeLines.map((line, i) => (
          <div key={i} className={`${line.color} animate-code-line`} style={{ animationDelay: `${delay + i * 0.15}s` }}>
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
};

// Interactive 3D Device Preview
const DevicePreview = ({ className }: { className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-3xl blur-2xl animate-pulse-soft" />
      <div className="relative bg-gray-900 rounded-[2rem] p-2 shadow-2xl border border-white/10">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-[1.5rem] overflow-hidden">
          <div className="h-6 bg-gray-800 flex items-center justify-center">
            <div className="w-16 h-1 bg-gray-700 rounded-full" />
          </div>
          <div className="aspect-[9/16] max-h-[280px] bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 p-3">
            <div className="w-full h-4 bg-white/10 rounded-lg mb-2" />
            <div className="w-2/3 h-3 bg-white/5 rounded-lg mb-4" />
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-square bg-white/10 rounded-xl" />
              <div className="aspect-square bg-white/10 rounded-xl" />
              <div className="aspect-square bg-white/10 rounded-xl" />
              <div className="aspect-square bg-white/10 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Floating UI Components
const FloatingUIElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating Button */}
      <div className="absolute top-[15%] right-[10%] animate-float-slow">
        <div className="bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg shadow-primary/30 transform rotate-6">
          Submit
        </div>
      </div>

      {/* Floating Card */}
      <div className="absolute bottom-[20%] left-[8%] animate-float-medium" style={{ animationDelay: '1s' }}>
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-3 shadow-xl border border-white/20 transform -rotate-6 w-32">
          <div className="w-full h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg mb-2" />
          <div className="h-2 w-3/4 bg-gray-200 rounded-full mb-1" />
          <div className="h-2 w-1/2 bg-gray-100 rounded-full" />
        </div>
      </div>

      {/* Floating Input */}
      <div className="absolute top-[60%] right-[5%] animate-float-fast hidden lg:block" style={{ animationDelay: '0.5s' }}>
        <div className="bg-white/90 backdrop-blur-xl rounded-xl px-4 py-2 shadow-lg border border-white/20 transform rotate-3 flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-300" />
          <span className="text-gray-400 text-sm">Search...</span>
        </div>
      </div>

      {/* Floating Toggle */}
      <div className="absolute bottom-[35%] right-[15%] animate-float-slow hidden md:block" style={{ animationDelay: '2s' }}>
        <div className="bg-primary rounded-full w-12 h-6 p-1 shadow-lg transform -rotate-12">
          <div className="bg-white w-4 h-4 rounded-full ml-auto" />
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showGitHubImport, setShowGitHubImport] = useState(false);
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [pendingGitHubImport, setPendingGitHubImport] = useState(false);
  const [typedText, setTypedText] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Typewriter effect
  const fullText = "from Imagination";
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Scroll reveal effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.scroll-reveal').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: FileAttachment[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) continue;
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      newAttachments.push({
        id: `${Date.now()}-${file.name}`,
        name: file.name,
        type: 'image',
        mime_type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        data: base64Data
      });
    }
    setAttachedFiles(prev => [...prev, ...newAttachments]);
    setShowAttachMenu(false);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handlePdfSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: FileAttachment[] = [];
    for (const file of Array.from(files)) {
      if (file.type !== 'application/pdf' || file.size > 20 * 1024 * 1024) continue;
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      newAttachments.push({
        id: `${Date.now()}-${file.name}`,
        name: file.name,
        type: 'pdf',
        mime_type: 'application/pdf',
        size: file.size,
        data: base64Data
      });
    }
    setAttachedFiles(prev => [...prev, ...newAttachments]);
    setShowAttachMenu(false);
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachedFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.url) URL.revokeObjectURL(file.url);
      return prev.filter(f => f.id !== id);
    });
  };

  const handleSubmit = async () => {
    if ((!message.trim() && attachedFiles.length === 0) || isSubmitting) return;

    // Check if API key is configured
    const keyType = localStorage.getItem(API_KEY_TYPE_KEY);
    if (!keyType) {
      // Show API key modal first
      setPendingSubmit(true);
      setShowAPIKeyModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/projects/from-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.substring(0, 1000),
          attachments: attachedFiles.length > 0 ? attachedFiles.map(file => ({
            type: file.type,
            mime_type: file.mime_type,
            data: file.data,
            name: file.name
          })) : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to create project');

      const data = await response.json();
      toast({ title: "Project created!", description: "Redirecting to editor..." });

      attachedFiles.forEach(file => { if (file.url) URL.revokeObjectURL(file.url); });

      setTimeout(() => {
        navigate(`/editor/${data.project.id}`, {
          state: { initialMessage: data.initial_message, attachments: data.attachments }
        });
        setAttachedFiles([]);
        setMessage('');
      }, 500);
    } catch (error) {
      toast({ title: "Error", description: "Failed to create project", variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  // Handle opening GitHub import with API key check
  const handleOpenGitHubImport = () => {
    const keyType = localStorage.getItem(API_KEY_TYPE_KEY);
    if (!keyType) {
      setPendingGitHubImport(true);
      setShowAPIKeyModal(true);
      return;
    }
    setShowGitHubImport(true);
  };

  // Handle API key set - continue with pending action
  const handleAPIKeySet = (key: string, type: 'demo' | 'own') => {
    setShowAPIKeyModal(false);
    if (pendingSubmit) {
      setPendingSubmit(false);
      setTimeout(() => handleSubmit(), 100);
    }
    if (pendingGitHubImport) {
      setPendingGitHubImport(false);
      setTimeout(() => setShowGitHubImport(true), 100);
    }
  };

  const steps = [
    { number: "01", title: "Describe", description: "Tell us what you want to build in plain English", icon: Terminal },
    { number: "02", title: "Generate", description: "Watch AI agents create your app in real-time", icon: Wand2 },
    { number: "03", title: "Customize", description: "Refine and iterate through conversation", icon: MousePointer },
    { number: "04", title: "Deploy", description: "Ship your production-ready application", icon: Rocket }
  ];

  const stats = [
    { value: "10x", label: "Faster Development" },
    { value: "50K+", label: "Lines Generated Daily" },
    { value: "99%", label: "Code Quality Score" },
    { value: "24/7", label: "AI Availability" }
  ];

  return (
    <main className="min-h-screen bg-white overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <GradientOrbs />
          <FloatingParticles />
          <FloatingUIElements />
        </div>

        {/* Grid Pattern with fade */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,122,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,122,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)]" />

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,white_70%)]" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="flex justify-center mb-8 animate-slide-up-fade">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 backdrop-blur-sm hover-lift cursor-pointer">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-medium bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Powered by Advanced AI Agents
                </span>
                <ChevronRight className="w-4 h-4 text-primary" />
              </div>
            </div>

            {/* Main Headline with animations */}
            <div className="text-center mb-8">
              <h1 className="text-8xl md:text-80xl font-bold tracking-tight mb-6">
                <span className="animate-text-reveal inline-block">Create  </span>
                <span className="relative inline-block animate-text-reveal stagger-1">
                  <span className="gradient-text-animated">
                     Reality
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full animate-scale-bounce stagger-3" viewBox="0 0 200 12" fill="none">
                    <path d="M2 10C50 4 150 4 198 10" stroke="url(#underline-gradient)" strokeWidth="3" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="underline-gradient" x1="0" y1="0" x2="200" y2="0">
                        <stop stopColor="#007AFF"/>
                        <stop offset="1" stopColor="#00D4FF"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                <br />
                <span className="animate-text-reveal stagger-2 inline-block text-foreground">
                  {typedText}
                  <span className="animate-cursor ml-1">|</span>
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-slide-up-fade stagger-3">
                Transform your ideas into production-ready web applications.
                <span className="text-foreground font-medium"> Just describe what you want.</span>
              </p>
            </div>

            {/* File Attachments Preview */}
            {attachedFiles.length > 0 && (
              <div className="max-w-3xl mx-auto mb-4 flex flex-wrap gap-2 justify-center animate-scale-bounce">
                {attachedFiles.map(file => (
                  <div key={file.id} className="relative group bg-white border border-border rounded-2xl p-3 flex items-center gap-3 shadow-ios hover-lift">
                    {file.type === 'image' && file.url ? (
                      <img src={file.url} alt={file.name} className="w-12 h-12 object-cover rounded-xl" />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-secondary rounded-xl">
                        <FileText className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium truncate text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      onClick={() => removeAttachment(file.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-ios"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Arrow pointing to input */}
            <div className="flex justify-center mb-4 animate-slide-up-fade stagger-3">
              <div className="flex flex-col items-center animate-bounce">
                <div className="bg-gradient-to-r from-primary to-purple-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg">
                  Start here - just type your idea!
                </div>
                <ArrowDown className="w-6 h-6 text-primary mt-2" />
              </div>
            </div>

            {/* Input Box with glow effect */}
            <div className="max-w-3xl mx-auto mb-8 animate-slide-up-fade stagger-4">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-primary via-purple-500 to-cyan-500 rounded-[32px] blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse" />
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-cyan-500 rounded-[28px] opacity-75 animate-pulse" style={{ animationDuration: '2s' }} />
                <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-primary/30 p-2">
                  <div className="flex items-start gap-3 p-3">
                    {/* Attach Button */}
                    <div className="relative">
                      <button
                        onClick={() => setShowAttachMenu(!showAttachMenu)}
                        disabled={isSubmitting}
                        className="w-10 h-10 rounded-2xl bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-all shrink-0 mt-1 hover:scale-110"
                      >
                        <Plus className="w-5 h-5 text-muted-foreground" />
                      </button>
                      {showAttachMenu && (
                        <div className="absolute top-full left-0 mt-2 bg-white border border-border rounded-2xl shadow-ios-lg p-2 z-50 min-w-[180px] animate-scale-bounce">
                          <button onClick={() => imageInputRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary rounded-xl text-sm font-medium transition-colors">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-primary" /></div>
                            <span>Add Images</span>
                          </button>
                          <button onClick={() => pdfInputRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary rounded-xl text-sm font-medium transition-colors">
                            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center"><FileText className="w-4 h-4 text-red-500" /></div>
                            <span>Add PDF</span>
                          </button>
                        </div>
                      )}
                      <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                      <input ref={pdfInputRef} type="file" accept="application/pdf" multiple onChange={handlePdfSelect} className="hidden" />
                    </div>

                    <textarea
                      ref={inputRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit())}
                      placeholder="Describe your dream app... e.g., 'A task management app with drag & drop and dark mode'"
                      rows={3}
                      disabled={isSubmitting}
                      className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-muted-foreground/60 resize-none disabled:opacity-50"
                    />
                  </div>
                  <div className="flex items-center justify-between px-4 pb-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        AI Ready
                      </span>
                      <span className="hidden sm:inline">Press Enter to create</span>
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={(!message.trim() && attachedFiles.length === 0) || isSubmitting}
                      size="lg"
                      className="rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 text-white border-0 shadow-lg shadow-primary/25 px-8 shine-effect"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Create App
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-3 mb-6 animate-slide-up-fade stagger-5">
              {["Todo App", "E-commerce", "Dashboard", "Portfolio", "Blog"].map((item, i) => (
                <button
                  key={item}
                  onClick={() => setMessage(`Create a modern ${item.toLowerCase()} with beautiful UI`)}
                  className="px-4 py-2 rounded-full bg-secondary/80 hover:bg-secondary text-sm font-medium text-foreground transition-all hover:scale-105 hover:shadow-md magnetic-hover"
                  style={{ animationDelay: `${0.5 + i * 0.1}s` }}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Import from GitHub */}
            <div className="flex justify-center mb-16 animate-slide-up-fade stagger-6">
              <button
                onClick={handleOpenGitHubImport}
                className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-medium transition-all shadow-lg hover:shadow-xl hover:scale-105 shine-effect"
              >
                <Github className="w-5 h-5" />
                <span>Import from GitHub</span>
                <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, i) => (
                <div key={i} className="text-center animate-bounce-in" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                  <div className="text-3xl md:text-4xl font-bold gradient-text-animated">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* Features Section - Clean Like Paper.id */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">

          {/* Feature 1 - Lightning Fast */}
          <div className="py-20 border-b border-gray-100">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium mb-6">
                  <Zap className="w-4 h-4" />
                  Lightning Fast
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Build Apps 10x Faster
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Stop waiting for developers. Describe your idea and watch it come to life in minutes. Our AI generates production-ready code instantly.
                </p>
                <Button className="rounded-full bg-amber-500 hover:bg-amber-600 text-white px-6" asChild>
                  <Link to="/projects">
                    Start Building
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
              <div className="relative">
                <img
                  src="/feature1.webp"
                  alt="Lightning Fast - Build Apps 10x Faster"
                  className="w-full h-auto rounded-3xl shadow-2xl shadow-amber-500/20"
                />
              </div>
            </div>
          </div>

          {/* Feature 2 - Multi-Agent AI */}
          <div className="py-20 border-b border-gray-100">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
              <div className="order-2 lg:order-1">
                <img
                  src="/feature2.webp"
                  alt="Multi-Agent AI - 4 AI Agents Working Together"
                  className="w-full h-auto rounded-3xl shadow-2xl shadow-purple-500/20"
                />
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 text-sm font-medium mb-6">
                  <Layers className="w-4 h-4" />
                  Multi-Agent AI
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  4 AI Agents Working Together
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Not just one AI - four specialized agents collaborate to architect, design, code, and review your application for the best results.
                </p>
                <Button className="rounded-full bg-purple-500 hover:bg-purple-600 text-white px-6" asChild>
                  <Link to="/projects">
                    See It In Action
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Feature 3 - Live Preview */}
          <div className="py-20 border-b border-gray-100">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium mb-6">
                  <Eye className="w-4 h-4" />
                  Live Preview
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  See Changes in Real-Time
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Powered by WebContainers, your app runs directly in the browser. See every change instantly with hot reload - no server needed.
                </p>
                <Button className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-6" asChild>
                  <Link to="/projects">
                    Try Live Preview
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
              <div className="relative">
                <img
                  src="/feature3.webp"
                  alt="Live Preview - See Changes in Real-Time"
                  className="w-full h-auto rounded-3xl shadow-2xl shadow-emerald-500/20"
                />
              </div>
            </div>
          </div>

          {/* Feature 4 - Production Ready Code */}
          <div className="py-20 border-b border-gray-100">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
              <div className="order-2 lg:order-1">
                <img
                  src="/feature4.webp"
                  alt="Production Ready - Clean, Type-Safe Code"
                  className="w-full h-auto rounded-3xl shadow-2xl shadow-blue-500/20"
                />
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium mb-6">
                  <Code2 className="w-4 h-4" />
                  Production Ready
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Clean, Type-Safe Code
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Generated code follows best practices with React, TypeScript, and Tailwind CSS. Ready for production, no cleanup needed.
                </p>
                <Button className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-6" asChild>
                  <Link to="/projects">
                    Generate Code
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Feature 5 - Version Control */}
          <div className="py-20">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 text-pink-600 text-sm font-medium mb-6">
                  <GitBranch className="w-4 h-4" />
                  Version Control
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Built-in Git Integration
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Every change is automatically committed. Revert to any previous version, compare changes, and never lose your progress.
                </p>
                <Button className="rounded-full bg-pink-500 hover:bg-pink-600 text-white px-6" asChild>
                  <Link to="/projects">
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
              <div className="relative">
                <img
                  src="/feature5.webp"
                  alt="Version Control - Built-in Git Integration"
                  className="w-full h-auto rounded-3xl shadow-2xl shadow-pink-500/20"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 scroll-reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-6">
              <Play className="w-4 h-4" />
              How It Works
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              From idea to app in
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent"> 4 simple steps</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Our AI agents handle the complexity so you can focus on what matters.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <div key={i} className="relative scroll-reveal" style={{ transitionDelay: `${i * 0.15}s` }}>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-primary/10 z-0" />
                  )}
                  <div className="relative z-10 text-center group">
                    <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 group-hover:border-primary/40 transition-all duration-300 hover-lift">
                      <step.icon className="w-10 h-10 text-primary" />
                    </div>
                    <div className="text-xs font-bold text-primary mb-2">{step.number}</div>
                    <h3 className="text-xl font-bold mb-2 text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Builder Demo Section - More Immersive */}
      <section className="py-32 bg-gradient-to-b from-secondary/30 to-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 scroll-reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary text-sm font-medium mb-6 border border-primary/20">
              <CircuitBoard className="w-4 h-4" />
              Live App Builder
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Build apps in
              <span className="gradient-text-animated"> real-time</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Watch the magic happen. Type a description, and see your app come to life instantly.
            </p>
          </div>

          {/* Interactive Builder Demo */}
          <div className="max-w-6xl mx-auto">
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-[2rem] p-1 shadow-2xl scroll-reveal">
              {/* Animated border glow */}
              <div className="absolute -inset-[2px] bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-[2rem] opacity-50 blur-sm animate-gradient-flow" style={{ backgroundSize: '200% auto' }} />

              <div className="relative bg-gray-900 rounded-[1.8rem] overflow-hidden">
                {/* Top bar */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-800/50 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-700/50 text-gray-400 text-xs font-mono">
                      <img src="/artreal_icon.png" alt="" className="w-4 h-4 object-contain" />
                      ArtReal Editor
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Live
                    </div>
                    <div className="flex gap-1">
                      <button className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 transition-colors">
                        <Smartphone className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 transition-colors">
                        <Tablet className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-gray-700/50 text-white transition-colors">
                        <Monitor className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Main content */}
                <div className="grid lg:grid-cols-2 min-h-[500px]">
                  {/* Code Panel */}
                  <div className="border-r border-white/5 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-medium">
                        <Code2 className="w-3.5 h-3.5" />
                        App.tsx
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-700/50 text-gray-400 text-xs">
                        <Braces className="w-3.5 h-3.5" />
                        index.css
                      </div>
                    </div>
                    <div className="font-mono text-sm space-y-1.5 text-gray-300">
                      <div className="animate-code-line"><span className="text-purple-400">import</span> <span className="text-emerald-400">{'{ useState }'}</span> <span className="text-purple-400">from</span> <span className="text-amber-400">'react'</span>;</div>
                      <div className="animate-code-line" style={{ animationDelay: '0.1s' }}><span className="text-purple-400">import</span> <span className="text-emerald-400">{'{ Button }'}</span> <span className="text-purple-400">from</span> <span className="text-amber-400">'./ui/button'</span>;</div>
                      <div className="h-3" />
                      <div className="animate-code-line" style={{ animationDelay: '0.2s' }}><span className="text-purple-400">export const</span> <span className="text-blue-400">App</span> = () {'=> {'}</div>
                      <div className="pl-4 animate-code-line" style={{ animationDelay: '0.3s' }}><span className="text-purple-400">const</span> [tasks, setTasks] = <span className="text-blue-400">useState</span>([]);</div>
                      <div className="pl-4 animate-code-line" style={{ animationDelay: '0.4s' }}><span className="text-purple-400">const</span> [input, setInput] = <span className="text-blue-400">useState</span>('');</div>
                      <div className="h-3" />
                      <div className="pl-4 animate-code-line" style={{ animationDelay: '0.5s' }}><span className="text-purple-400">return</span> (</div>
                      <div className="pl-6 animate-code-line" style={{ animationDelay: '0.6s' }}><span className="text-gray-500">{'<div className="p-8 max-w-md mx-auto">'}</span></div>
                      <div className="pl-8 animate-code-line" style={{ animationDelay: '0.7s' }}><span className="text-gray-500">{'<h1 className="text-2xl font-bold">'}</span></div>
                      <div className="pl-10 animate-code-line" style={{ animationDelay: '0.8s' }}><span className="text-gray-300">My Tasks</span></div>
                      <div className="pl-8 animate-code-line" style={{ animationDelay: '0.9s' }}><span className="text-gray-500">{'</h1>'}</span></div>
                      <div className="pl-6 animate-code-line" style={{ animationDelay: '1s' }}><span className="text-gray-500">{'</div>'}</span></div>
                      <div className="pl-4 animate-code-line" style={{ animationDelay: '1.1s' }}>);</div>
                      <div className="animate-code-line" style={{ animationDelay: '1.2s' }}>{'}'};</div>
                    </div>
                    <div className="mt-6 flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <Wand2 className="w-3.5 h-3.5 animate-pulse" />
                        AI generating...
                      </div>
                      <span className="text-gray-500">Line 12 of 45</span>
                    </div>
                  </div>

                  {/* Preview Panel */}
                  <div className="bg-white p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium">
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs">
                        localhost:5173
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6 min-h-[360px] border border-gray-100">
                      <div className="max-w-sm mx-auto">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">My Tasks</h3>
                        <div className="flex gap-2 mb-4">
                          <input
                            type="text"
                            placeholder="Add a new task..."
                            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            disabled
                          />
                          <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium">
                            Add
                          </button>
                        </div>
                        <div className="space-y-2">
                          {['Design landing page', 'Build API endpoints', 'Write documentation'].map((task, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 animate-slide-up-fade" style={{ animationDelay: `${1.3 + i * 0.1}s` }}>
                              <div className="w-5 h-5 rounded-full border-2 border-primary/30" />
                              <span className="text-sm text-gray-700">{task}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Chat Bar */}
                <div className="border-t border-white/5 px-6 py-4 bg-gray-800/30">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-800 border border-white/10">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span className="text-gray-400 text-sm">Create a beautiful todo app with animations...</span>
                    </div>
                    <button className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-blue-600 text-white font-medium text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
                      Generate
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="scroll-reveal">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 text-sm font-medium mb-6">
                  <Palette className="w-4 h-4" />
                  See It In Action
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Watch your ideas
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"> come alive</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Real-time code generation with live preview. See every line as it's written by our AI agents.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Multi-agent collaboration in real-time",
                    "Instant preview with hot reload",
                    "Full code access and customization",
                    "Export to your favorite IDE"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 animate-slide-up-fade" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button size="lg" className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white border-0 shadow-lg shine-effect" asChild>
                  <Link to="/projects">
                    Try It Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
              <div className="relative scroll-reveal" style={{ transitionDelay: '0.2s' }}>
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-[40px] blur-2xl animate-morph" />
                <div className="relative bg-white rounded-3xl shadow-2xl border border-border/50 overflow-hidden hover-lift">
                  <div className="bg-secondary/50 px-4 py-3 flex items-center gap-2 border-b border-border/50">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors cursor-pointer" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors cursor-pointer" />
                      <div className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors cursor-pointer" />
                    </div>
                    <div className="flex-1 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <img src="/artreal_icon.png" alt="" className="w-4 h-4 object-contain" />
                      ArtReal Editor
                    </div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 min-h-[400px]">
                    <div className="font-mono text-sm space-y-2">
                      <div className="animate-code-line"><span className="text-purple-400">import</span> <span className="text-green-400">{'{'} useState {'}'}</span> <span className="text-purple-400">from</span> <span className="text-amber-400">'react'</span>;</div>
                      <div className="h-4" />
                      <div className="animate-code-line" style={{ animationDelay: '0.1s' }}><span className="text-purple-400">export const</span> <span className="text-blue-400">App</span> = () {'=> {'}</div>
                      <div className="pl-4 animate-code-line" style={{ animationDelay: '0.2s' }}><span className="text-purple-400">const</span> <span className="text-slate-300">[count, setCount]</span> = <span className="text-blue-400">useState</span>(0);</div>
                      <div className="h-4" />
                      <div className="pl-4 animate-code-line" style={{ animationDelay: '0.3s' }}><span className="text-purple-400">return</span> (</div>
                      <div className="pl-8 text-slate-400 animate-code-line" style={{ animationDelay: '0.4s' }}>{'<div className="app">'}</div>
                      <div className="pl-12 text-slate-400 animate-code-line" style={{ animationDelay: '0.5s' }}>{'<h1>Count: {count}</h1>'}</div>
                      <div className="pl-12 text-slate-400 animate-code-line" style={{ animationDelay: '0.6s' }}>{'<button onClick={() => setCount(c => c + 1)}>'}</div>
                      <div className="pl-16 text-slate-300 animate-code-line" style={{ animationDelay: '0.7s' }}>Increment</div>
                      <div className="pl-12 text-slate-400 animate-code-line" style={{ animationDelay: '0.8s' }}>{'</button>'}</div>
                      <div className="pl-8 text-slate-400 animate-code-line" style={{ animationDelay: '0.9s' }}>{'</div>'}</div>
                      <div className="pl-4 text-slate-300 animate-code-line" style={{ animationDelay: '1s' }}>);</div>
                      <div className="text-slate-300 animate-code-line" style={{ animationDelay: '1.1s' }}>{'}'};</div>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-green-400 text-xs">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      AI is writing code...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 scroll-reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              Loved by Developers
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Join thousands of
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"> happy creators</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Alex Chen", role: "Startup Founder", quote: "ArtReal turned my 2-week project into a 2-hour build. Absolutely incredible." },
              { name: "Sarah Miller", role: "Product Designer", quote: "Finally, a tool that understands design intent. The code quality is outstanding." },
              { name: "James Wilson", role: "Full-stack Developer", quote: "I was skeptical at first, but the multi-agent approach really delivers." }
            ].map((testimonial, i) => (
              <div key={i} className="scroll-reveal bg-secondary/30 rounded-3xl p-8 border border-border/50 hover-lift shine-effect" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-cyan-500" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Animated shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-2xl animate-float-slow" />
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full animate-float-medium" />
        <div className="absolute top-1/2 right-20 w-12 h-12 bg-white/10 rounded-lg animate-float-fast" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center scroll-reveal">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to build something amazing?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Start creating your next project with ArtReal. No credit card required. No coding experience needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="rounded-2xl bg-white text-primary hover:bg-white/90 shadow-xl px-8 text-lg h-14 shine-effect"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Start Building Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                className="rounded-2xl border-2 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:border-white/60 px-8 text-lg h-14 backdrop-blur-sm transition-all"
                asChild
              >
                <Link to="/docs">
                  Read Documentation
                </Link>
              </Button>
            </div>
            <p className="mt-8 text-white/60 text-sm">
              Join 2,500+ developers already building with ArtReal
            </p>
          </div>
        </div>
      </section>

      <Footer />

      {/* GitHub Import Modal */}
      <GitHubImportModal
        isOpen={showGitHubImport}
        onClose={() => setShowGitHubImport(false)}
      />

      {/* API Key Setup Modal */}
      <APIKeyModal
        isOpen={showAPIKeyModal}
        onClose={() => {
          setShowAPIKeyModal(false);
          setPendingSubmit(false);
          setPendingGitHubImport(false);
        }}
        onKeySet={handleAPIKeySet}
      />
    </main>
  );
};

export default Index;
