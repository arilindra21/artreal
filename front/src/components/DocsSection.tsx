import { Book, FileCode, Cpu, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const DocsSection = () => {
  const resources = [
    {
      icon: Cpu,
      title: "AI Agents System",
      description: "Learn how our Planner and Coder agents collaborate to transform your prompts into production-ready code.",
      link: "/docs",
      color: "bg-blue-500",
    },
    {
      icon: FileCode,
      title: "Modern Architecture",
      description: "Built on React + Vite frontend and FastAPI backend for high-performance agent processing.",
      link: "/docs",
      color: "bg-purple-500",
    },
    {
      icon: Book,
      title: "Project Workflow",
      description: "From idea to deployment: Prompt → Plan → Implement → Preview. Simple and powerful.",
      link: "/docs",
      color: "bg-green-500",
    },
  ];

  return (
    <section id="docs" className="py-24 relative bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4 px-4 py-1.5 bg-primary/10 rounded-full">
            Documentation
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Understand the{" "}
            <span className="text-highlight">ArtReal</span> System
          </h2>
          <p className="text-lg text-muted-foreground">
            A powerful multi-agent architecture designed to build software autonomously.
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {resources.map((resource, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl p-8 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-ios-lg"
            >
              <div className={`w-14 h-14 rounded-2xl ${resource.color} flex items-center justify-center mb-6 shadow-ios`}>
                <resource.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">
                {resource.title}
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {resource.description}
              </p>
              <a
                href={resource.link}
                className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all font-medium text-sm"
              >
                Learn more
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-10 border border-primary/20">
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              Ready to start building?
            </h3>
            <p className="text-muted-foreground mb-8">
              Create your first project in minutes. No credit card required.
            </p>
            <Button size="lg" className="rounded-2xl bg-gradient-blue hover:opacity-90 text-white border-0 shadow-ios px-8" asChild>
              <Link to="/">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DocsSection;
