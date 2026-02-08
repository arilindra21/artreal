import { Code2, Zap, Palette, Layers, Eye, GitBranch } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Build complete applications in minutes. Our AI understands context and generates production-ready code instantly.",
    color: "bg-amber-500",
  },
  {
    icon: Code2,
    title: "Clean Code Output",
    description: "Get maintainable React and TypeScript code. No black boxes - full access to every line of your application.",
    color: "bg-blue-500",
  },
  {
    icon: Eye,
    title: "Live Preview",
    description: "See your changes in real-time with WebContainers. True Node.js runtime running directly in your browser.",
    color: "bg-green-500",
  },
  {
    icon: Palette,
    title: "Beautiful by Default",
    description: "Every component is designed to look stunning with Tailwind CSS. Fully customizable design system.",
    color: "bg-pink-500",
  },
  {
    icon: GitBranch,
    title: "Version Control",
    description: "Built-in Git integration with automatic commits. Time travel through your project history anytime.",
    color: "bg-purple-500",
  },
  {
    icon: Layers,
    title: "Multi-Agent AI",
    description: "Powered by advanced AI agents that plan, code, and review. Intelligent orchestration for complex tasks.",
    color: "bg-indigo-500",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4 px-4 py-1.5 bg-primary/10 rounded-full">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Everything you need to{" "}
            <span className="text-highlight">ship faster</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From idea to production in record time. No compromises on quality or control.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-white rounded-3xl p-8 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-ios-lg"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 shadow-ios group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
