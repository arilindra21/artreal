import { MessageSquare, Wand2, Rocket } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    number: "1",
    title: "Describe Your Vision",
    description: "Tell us what you want to build in plain English. Be as specific or as vague as you like - our AI adapts to your style.",
    color: "bg-blue-500",
  },
  {
    icon: Wand2,
    number: "2",
    title: "Watch It Come to Life",
    description: "See your application materialize in real-time. Make adjustments and refine your vision through natural conversation.",
    color: "bg-purple-500",
  },
  {
    icon: Rocket,
    number: "3",
    title: "Ship with Confidence",
    description: "Your app is fully functional, secure, and ready for users. Download the code or deploy instantly.",
    color: "bg-green-500",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 relative bg-secondary/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4 px-4 py-1.5 bg-primary/10 rounded-full">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Three steps to{" "}
            <span className="text-highlight">production</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Building software has never been simpler. No coding experience required.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Line for Desktop */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-green-500/30" />

            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="text-center">
                  {/* Icon Container */}
                  <div className="relative inline-flex mb-8">
                    <div className={`w-20 h-20 rounded-3xl ${step.color} flex items-center justify-center shadow-ios-lg`}>
                      <step.icon className="w-9 h-9 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-primary flex items-center justify-center text-sm font-bold text-primary shadow-ios">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-4 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
