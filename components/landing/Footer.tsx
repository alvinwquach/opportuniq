"use client";

import { useState, useEffect } from "react";
import { Home, ArrowRight, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const links = [
  { href: "#features", label: "Features" },
  { href: "#compare", label: "Compare" },
  { href: "#faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference on mount
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const htmlElement = document.documentElement;
    const isDarkMode = htmlElement.classList.contains("dark");
    setIsDark(isDarkMode || prefersDark);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <footer className="relative bg-card">
      <div className="h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border">
            <Sun className="h-4 w-4 text-muted-foreground" />
            <Switch
              checked={isDark}
              onCheckedChange={toggleTheme}
              aria-label="Toggle theme"
            />
            <Moon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div>
            <a href="/" className="flex items-center gap-2.5 mb-6 group">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/20 transition-all">
                <Home className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold text-xl text-foreground">Opportuniq</span>
            </a>
            <p className="text-foreground mb-6 max-w-sm">
              Smart decisions for household expenses with tariff intelligence. Know when to DIY, when to hire, and when to wait.
            </p>
            <div className="flex gap-2 max-w-sm">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Get product updates"
                className="flex-1 h-11 px-4 rounded-lg bg-muted/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
              <Button size="sm" className="h-11 px-4 rounded-lg">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col md:items-end">
            <nav className="flex flex-wrap gap-6">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-foreground">
            &copy; {new Date().getFullYear()} Opportuniq. All rights reserved.
          </p>
          <p className="text-xs text-foreground/70">
            Helping homeowners make smarter decisions with tariff intelligence.
          </p>
        </div>
      </div>
    </footer>
  );
}
