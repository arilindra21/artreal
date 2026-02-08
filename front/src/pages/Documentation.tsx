import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Book, FileCode, MessageCircle, ArrowRight, Menu, ChevronRight, ChevronDown,
  Search, Command, Sparkles, Layers, Zap, Code2, Palette, GitBranch,
  Play, Copy, Check, ExternalLink, Cpu, Globe, Database, Rocket,
  Terminal, Box, RefreshCw, Eye, PenTool, Wand2, X, Hash
} from "lucide-react";
import { cn } from "@/lib/utils";

// Interactive code block component
const CodeBlock = ({ code, language = "bash", title }: { code: string; language?: string; title?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-gray-950 border border-gray-800 shadow-xl">
      {title && (
        <div className="px-4 py-2 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400">{title}</span>
          <span className="text-xs text-gray-500">{language}</span>
        </div>
      )}
      <div className="relative">
        <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto">
          <code>{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
};

// Feature card component
const FeatureCard = ({ icon: Icon, title, description, color }: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}) => (
  <div className="group p-6 rounded-2xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", color)}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

// Step card component
const StepCard = ({ step, title, description, icon: Icon }: {
  step: number;
  title: string;
  description: string;
  icon: React.ElementType;
}) => (
  <div className="relative flex gap-4 group">
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
        {step}
      </div>
      <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/50 to-transparent mt-2" />
    </div>
    <div className="flex-1 pb-8">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary" />
        <h4 className="font-semibold text-foreground">{title}</h4>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);

const Documentation = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<string[]>(["getting-started", "features", "architecture"]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Scroll spy for active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" }
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const sections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Rocket,
      items: [
        { id: "overview", title: "Overview", icon: Book },
        { id: "quick-start", title: "Quick Start", icon: Zap },
        { id: "installation", title: "Installation", icon: Terminal },
      ]
    },
    {
      id: "features",
      title: "Core Features",
      icon: Sparkles,
      items: [
        { id: "ai-chat", title: "AI Chat Interface", icon: MessageCircle },
        { id: "sketch-to-app", title: "Sketch to App", icon: PenTool },
        { id: "visual-editor", title: "Visual Editor", icon: Eye },
        { id: "live-preview", title: "Live Preview", icon: Play },
      ]
    },
    {
      id: "architecture",
      title: "Architecture",
      icon: Layers,
      items: [
        { id: "multi-agent", title: "Multi-Agent System", icon: Cpu },
        { id: "tech-stack", title: "Tech Stack", icon: Code2 },
        { id: "webcontainers", title: "WebContainers", icon: Box },
      ]
    },
    {
      id: "guides",
      title: "Developer Guides",
      icon: FileCode,
      items: [
        { id: "api-reference", title: "API Reference", icon: Database },
        { id: "customization", title: "Customization", icon: Palette },
        { id: "deployment", title: "Deployment", icon: Globe },
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
      setMobileMenuOpen(false);
      setSearchOpen(false);
    }
  };

  // Filter sections based on search
  const filteredSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0 || section.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-xl mx-4 bg-background rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 p-4 border-b">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documentation..."
                className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-muted text-xs text-muted-foreground">
                <span>ESC</span>
              </kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredSections.length > 0 ? (
                filteredSections.map((section) => (
                  <div key={section.id}>
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {section.title}
                    </div>
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <item.icon className="w-4 h-4 text-primary" />
                        <span className="text-sm">{item.title}</span>
                        <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No results found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 container mx-auto px-4 sm:px-6 pt-24 pb-12 flex relative">
        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-br from-primary to-purple-600 text-white rounded-2xl shadow-lg shadow-primary/30"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>

        {/* Sidebar Navigation - Fixed on desktop */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-background/95 backdrop-blur-xl border-r transform transition-transform duration-300 ease-out",
          "lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:w-64 lg:shrink-0 lg:translate-x-0 lg:bg-transparent lg:border-0 lg:backdrop-blur-none",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="h-full overflow-y-auto pt-24 lg:pt-0 px-4 lg:px-0 pb-24 lg:pb-8 scrollbar-thin">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 mb-6 rounded-xl border bg-muted/50 hover:bg-muted transition-colors text-sm text-muted-foreground"
            >
              <Search className="w-4 h-4" />
              <span>Search docs...</span>
              <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 ml-auto rounded bg-background border text-xs">
                <Command className="w-3 h-3" />K
              </kbd>
            </button>

            {/* Navigation */}
            <nav className="space-y-2">
              {sections.map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <section.icon className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">{section.title}</span>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform",
                      expandedSections.includes(section.id) && "rotate-180"
                    )} />
                  </button>

                  {expandedSections.includes(section.id) && (
                    <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-muted pl-3">
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all",
                            activeSection === item.id
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          <item.icon className="w-3.5 h-3.5" />
                          {item.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Quick Links */}
            <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Quick Links
              </h4>
              <div className="space-y-2">
                <a href="https://github.com/anthropics/claude-code" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <GitBranch className="w-3.5 h-3.5" />
                  GitHub Repository
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" />
                  Community Discord
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content - Scrollable */}
        <main ref={contentRef} className="flex-1 lg:pl-8 w-full max-w-4xl min-w-0">
          <div className="space-y-20 py-8">

            {/* Hero Section */}
            <section id="overview" className="relative">
              <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-50" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  Documentation v1.0
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                  Build apps with AI
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                  Welcome to <span className="font-semibold text-foreground">Art<span className="text-primary">Real</span></span> -
                  the AI-powered platform that transforms your ideas into production-ready React applications through
                  natural conversation and visual sketching.
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
                  {[
                    { label: "AI Agents", value: "4", icon: Cpu },
                    { label: "Preview Speed", value: "<1s", icon: Zap },
                    { label: "File Types", value: "20+", icon: FileCode },
                    { label: "Sketch Support", value: "Yes", icon: PenTool },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 rounded-xl bg-muted/50 border">
                      <stat.icon className="w-5 h-5 text-primary mb-2" />
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Quick Start */}
            <section id="quick-start" className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Quick Start</h2>
              </div>
              <p className="text-muted-foreground">
                Get up and running with ArtReal in under 5 minutes. Follow these simple steps:
              </p>

              <div className="space-y-0 mt-8">
                <StepCard
                  step={1}
                  title="Create a New Project"
                  description="Click 'New Project' on the dashboard or import an existing GitHub repository."
                  icon={Box}
                />
                <StepCard
                  step={2}
                  title="Describe Your App"
                  description="Use the AI chat to describe what you want to build. Be as detailed as you like - our AI understands context."
                  icon={MessageCircle}
                />
                <StepCard
                  step={3}
                  title="Watch It Build"
                  description="See your app come to life in real-time. The AI generates code, and the preview updates instantly."
                  icon={Eye}
                />
                <StepCard
                  step={4}
                  title="Iterate & Deploy"
                  description="Refine your app through conversation, use visual editing, and deploy when ready."
                  icon={Rocket}
                />
              </div>
            </section>

            {/* Installation */}
            <section id="installation" className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Installation</h2>
              </div>
              <p className="text-muted-foreground">
                For local development, clone and run both frontend and backend:
              </p>

              <div className="space-y-4">
                <CodeBlock
                  title="Clone Repository"
                  language="bash"
                  code={`git clone https://github.com/your-username/artreal.git
cd artreal`}
                />

                <CodeBlock
                  title="Frontend Setup"
                  language="bash"
                  code={`cd front
npm install
npm run dev  # Runs on http://localhost:8080`}
                />

                <CodeBlock
                  title="Backend Setup"
                  language="bash"
                  code={`cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
cp .env.example .env  # Add your GEMINI_API_KEY
python run.py  # Runs on http://localhost:8000`}
                />
              </div>
            </section>

            <div className="border-t border-border/50" />

            {/* AI Chat Interface */}
            <section id="ai-chat" className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold">AI Chat Interface</h2>
              </div>
              <p className="text-muted-foreground">
                Communicate naturally with the AI to build and modify your application.
              </p>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-blue-500" />
                  Example Prompts
                </h4>
                <div className="space-y-3">
                  {[
                    "Create a todo app with dark mode support",
                    "Add a sidebar navigation with icons",
                    "Make the header sticky with a blur effect",
                    "Add form validation to the signup page"
                  ].map((prompt, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-500 font-medium">
                        {i + 1}
                      </div>
                      <code className="text-muted-foreground">"{prompt}"</code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <FeatureCard
                  icon={RefreshCw}
                  title="Real-time Updates"
                  description="See changes instantly as the AI generates code. No refresh needed."
                  color="bg-blue-500"
                />
                <FeatureCard
                  icon={FileCode}
                  title="Multi-file Support"
                  description="Create components, pages, and utilities across multiple files."
                  color="bg-cyan-500"
                />
              </div>
            </section>

            {/* Sketch to App */}
            <section id="sketch-to-app" className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <PenTool className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Sketch to App</h2>
              </div>
              <p className="text-muted-foreground">
                Draw wireframes and let AI transform them into functional React components.
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                <FeatureCard
                  icon={PenTool}
                  title="Drawing Tools"
                  description="Rectangle, circle, and text tools for quick wireframing."
                  color="bg-purple-500"
                />
                <FeatureCard
                  icon={Sparkles}
                  title="AI Analysis"
                  description="AI understands your sketch layout and element relationships."
                  color="bg-pink-500"
                />
                <FeatureCard
                  icon={Code2}
                  title="Code Generation"
                  description="Generates clean, responsive React + Tailwind code."
                  color="bg-rose-500"
                />
              </div>
            </section>

            {/* Visual Editor */}
            <section id="visual-editor" className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Visual Editor</h2>
              </div>
              <p className="text-muted-foreground">
                Click on any element in the preview to visually edit styles, colors, and spacing.
              </p>

              <div className="p-6 rounded-2xl border bg-muted/30">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  {[
                    { label: "Colors", icon: Palette },
                    { label: "Spacing", icon: Box },
                    { label: "Typography", icon: Hash },
                    { label: "Layout", icon: Layers },
                  ].map((item) => (
                    <div key={item.label} className="p-4 rounded-xl bg-background border">
                      <item.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Live Preview */}
            <section id="live-preview" className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Live Preview</h2>
              </div>
              <p className="text-muted-foreground">
                Powered by WebContainers - a full Node.js environment running in your browser.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <FeatureCard
                  icon={Zap}
                  title="Instant HMR"
                  description="Hot Module Replacement for sub-second updates."
                  color="bg-green-500"
                />
                <FeatureCard
                  icon={Globe}
                  title="No Server Needed"
                  description="Everything runs in the browser - infinite scalability."
                  color="bg-teal-500"
                />
              </div>
            </section>

            <div className="border-t border-border/50" />

            {/* Multi-Agent System */}
            <section id="multi-agent" className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Multi-Agent System</h2>
              </div>
              <p className="text-muted-foreground">
                Four specialized AI agents collaborate to build your application:
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    title: "Architect",
                    description: "Plans system structure and component hierarchy",
                    color: "bg-blue-500"
                  },
                  {
                    title: "UI Designer",
                    description: "Designs beautiful interfaces with Tailwind CSS",
                    color: "bg-purple-500"
                  },
                  {
                    title: "Coder",
                    description: "Generates TypeScript/React code with best practices",
                    color: "bg-green-500"
                  },
                  {
                    title: "Reviewer",
                    description: "Reviews code quality, accessibility, and performance",
                    color: "bg-orange-500"
                  },
                ].map((agent) => (
                  <div key={agent.title} className="p-5 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
                    <div className={cn("w-3 h-3 rounded-full mb-3", agent.color)} />
                    <h4 className="font-semibold mb-1">{agent.title}</h4>
                    <p className="text-sm text-muted-foreground">{agent.description}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-foreground text-background font-mono text-sm">
                User Prompt → Orchestrator → Architect → UI Designer → Coder → Reviewer → Output
              </div>
            </section>

            {/* Tech Stack */}
            <section id="tech-stack" className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Tech Stack</h2>
              </div>

              <div className="overflow-hidden rounded-2xl border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-4 font-semibold">Layer</th>
                      <th className="p-4 font-semibold">Technology</th>
                      <th className="p-4 font-semibold hidden sm:table-cell">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { layer: "Frontend", tech: "React + Vite + TypeScript", purpose: "User Interface" },
                      { layer: "Styling", tech: "Tailwind CSS + shadcn/ui", purpose: "Component Library" },
                      { layer: "Backend", tech: "FastAPI (Python)", purpose: "API & Agent Runtime" },
                      { layer: "AI Framework", tech: "Microsoft AutoGen 0.4", purpose: "Multi-agent Orchestration" },
                      { layer: "LLM", tech: "Google Gemini", purpose: "Intelligence Engine" },
                      { layer: "Preview", tech: "WebContainers", purpose: "Browser-based Node.js" },
                      { layer: "Database", tech: "SQLite + Filesystem", purpose: "Data & File Storage" },
                    ].map((row) => (
                      <tr key={row.layer} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">{row.layer}</td>
                        <td className="p-4 text-muted-foreground">{row.tech}</td>
                        <td className="p-4 text-muted-foreground hidden sm:table-cell">{row.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* WebContainers */}
            <section id="webcontainers" className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Box className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold">WebContainers</h2>
              </div>
              <p className="text-muted-foreground">
                Full Node.js environment running directly in the browser using WebAssembly.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "No Backend Compute", description: "Each user gets their own containerized environment" },
                  { title: "Real npm/Node.js", description: "Install packages, run scripts, full filesystem" },
                  { title: "Offline Capable", description: "Works after initial load without internet" },
                  { title: "Infinite Scale", description: "No server costs for preview functionality" },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3 p-4 rounded-xl border bg-card">
                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="border-t border-border/50" />

            {/* API Reference */}
            <section id="api-reference" className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold">API Reference</h2>
              </div>
              <p className="text-muted-foreground">
                RESTful API endpoints for projects, files, and chat.
              </p>

              <div className="space-y-3">
                {[
                  { method: "POST", path: "/api/v1/projects", desc: "Create a new project" },
                  { method: "GET", path: "/api/v1/projects/{id}", desc: "Get project with files" },
                  { method: "POST", path: "/api/v1/chat/{project_id}/stream", desc: "Send message (SSE)" },
                  { method: "GET", path: "/api/v1/projects/{id}/bundle", desc: "Get files for WebContainers" },
                  { method: "POST", path: "/api/v1/projects/import/github", desc: "Import from GitHub" },
                ].map((endpoint) => (
                  <div key={endpoint.path} className="flex items-center gap-3 p-3 rounded-xl border bg-card font-mono text-sm">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs font-bold",
                      endpoint.method === "GET" ? "bg-green-500/20 text-green-600" : "bg-blue-500/20 text-blue-600"
                    )}>
                      {endpoint.method}
                    </span>
                    <span className="flex-1 text-muted-foreground">{endpoint.path}</span>
                    <span className="text-xs text-muted-foreground hidden sm:block">{endpoint.desc}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="w-4 h-4" />
                Full API docs at <a href="http://localhost:8000/docs" className="text-primary hover:underline">localhost:8000/docs</a>
              </div>
            </section>

            {/* Customization */}
            <section id="customization" className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Customization</h2>
              </div>
              <p className="text-muted-foreground">
                Modify the default project template and AI behavior.
              </p>

              <CodeBlock
                title="Custom AI System Prompt"
                language="python"
                code={`# backend/app/agents/config.py
AGENT_SYSTEM_PROMPTS = {
    "architect": "You are a senior software architect...",
    "ui_designer": "You are a UI/UX designer expert...",
    "coder": "You are a senior React developer...",
    "reviewer": "You are a code review specialist..."
}`}
              />
            </section>

            {/* Deployment */}
            <section id="deployment" className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Deployment</h2>
              </div>
              <p className="text-muted-foreground">
                Deploy your generated apps to any static hosting platform.
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                {["Vercel", "Netlify", "GitHub Pages"].map((platform) => (
                  <div key={platform} className="p-4 rounded-xl border bg-card text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Globe className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <span className="font-medium text-sm">{platform}</span>
                  </div>
                ))}
              </div>

              <CodeBlock
                title="Build for Production"
                language="bash"
                code={`cd backend/projects/project_1
npm run build
# Output in dist/ folder`}
              />
            </section>

            {/* Footer CTA */}
            <section className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border border-primary/20 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Build?</h3>
              <p className="text-muted-foreground mb-6">
                Start creating AI-powered applications today.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
                  <Rocket className="w-4 h-4" />
                  Get Started
                </Link>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border font-medium hover:bg-muted transition-colors">
                  <GitBranch className="w-4 h-4" />
                  View on GitHub
                </a>
              </div>
            </section>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Documentation;
