import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Projects", href: "/projects" },
    { label: "Features", href: "/#features" },
    { label: "How it Works", href: "/#how-it-works" },
    { label: "Docs", href: "/docs" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <div
          className="transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
          style={{
            margin: scrolled ? "12px auto" : "16px 16px",
            maxWidth: scrolled ? "700px" : "100%",
            padding: scrolled ? "0 12px" : "0",
          }}
        >
          <div
            className="backdrop-blur-xl bg-white/80 border border-white/50 shadow-lg shadow-black/[0.03] transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{
              borderRadius: scrolled ? "100px" : "16px",
              padding: scrolled ? "8px 15px" : "12px 24px",
            }}
          >
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center group">
                <img
                  src="/artreal_logo.png"
                  alt="ArtReal"
                  className="object-contain transition-all duration-500 group-hover:opacity-80"
                  style={{
                    height: scrolled ? "28px" : "34px",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.classList.remove("hidden");
                  }}
                />
                <span
                  className="hidden font-semibold text-foreground transition-all duration-500"
                  style={{ fontSize: scrolled ? "16px" : "18px" }}
                >
                  Art<span className="text-highlight">Real</span>
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) =>
                  link.href.startsWith('/#') ? (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground hover:bg-black/5 rounded-full transition-all duration-300 font-medium"
                      style={{
                        padding: scrolled ? "6px 12px" : "8px 16px",
                        fontSize: scrolled ? "13px" : "14px",
                      }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="text-muted-foreground hover:text-foreground hover:bg-black/5 rounded-full transition-all duration-300 font-medium"
                      style={{
                        padding: scrolled ? "6px 12px" : "8px 16px",
                        fontSize: scrolled ? "13px" : "14px",
                      }}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>

              {/* Desktop CTA */}
              <div className="hidden md:flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 transition-all duration-500 opacity-60 cursor-default"
                      style={{
                        height: scrolled ? "32px" : "36px",
                        padding: scrolled ? "0 12px" : "0 16px",
                        fontSize: scrolled ? "13px" : "14px",
                      }}
                    >
                      Sign in
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-gray-900 text-white border-gray-800">
                    <p className="text-sm">Demo mode - no login required</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="rounded-full bg-gradient-blue hover:opacity-90 transition-all duration-500 shadow-ios text-white border-0 opacity-60 cursor-default"
                      style={{
                        height: scrolled ? "32px" : "36px",
                        padding: scrolled ? "0 16px" : "0 20px",
                        fontSize: scrolled ? "13px" : "14px",
                      }}
                    >
                      Get Started
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-gray-900 text-white border-gray-800">
                    <p className="text-sm">Demo mode - just type your idea below!</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex items-center justify-center rounded-full hover:bg-black/5 transition-all duration-300"
                style={{
                  width: scrolled ? "32px" : "40px",
                  height: scrolled ? "32px" : "40px",
                }}
              >
                {mobileMenuOpen ? (
                  <X size={scrolled ? 18 : 20} />
                ) : (
                  <Menu size={scrolled ? 18 : 20} />
                )}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden pt-4 pb-2 animate-ios-fade-in">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) =>
                    link.href.startsWith('/#') ? (
                      <a
                        key={link.label}
                        href={link.href}
                        className="px-4 py-3 text-foreground hover:bg-black/5 rounded-xl transition-colors text-sm font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={link.label}
                        to={link.href}
                        className="px-4 py-3 text-foreground hover:bg-black/5 rounded-xl transition-colors text-sm font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    )
                  )}
                  <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start rounded-xl opacity-60 cursor-default"
                      disabled
                    >
                      Sign in
                      <span className="ml-2 text-xs text-muted-foreground">(Demo mode)</span>
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-xl bg-gradient-blue hover:opacity-90 text-white border-0 opacity-60 cursor-default"
                      disabled
                    >
                      Get Started
                      <span className="ml-2 text-xs opacity-80">(Demo mode)</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
