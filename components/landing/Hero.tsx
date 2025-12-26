"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera, Mic, Video, Bot, CheckCircle2, Clock, DollarSign, Wrench, Users, Send, TrendingDown, Bell, Sparkles, Lock, BookOpen, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      if (!sectionRef.current) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // Dashboard is VISIBLE immediately on load, tilted back like a laptop
      // As user scrolls, it "opens" toward them (like opening a laptop lid)
      // progress: 0 = tilted back (initial state), 1 = fully flat (final state)
      const scrollRange = windowHeight * 0.15; // Complete animation over just 15vh of scroll (very quick)
      const progress = Math.max(0, Math.min(1, scrollY / scrollRange));
      setScrollProgress(progress);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Scroll-based "laptop opening" animation
  // Dashboard starts tilted back and pulled up, then opens flat as user scrolls
  const rotateX = (1 - scrollProgress) * 30;      // 30° tilted → 0° flat
  const translateY = (1 - scrollProgress) * -35;  // -35% up → 0% (settles down)
  const scale = 0.88 + scrollProgress * 0.12;     // 0.88 → 1.0
  const dashboardTransform = `perspective(1200px) rotateX(${rotateX}deg) translateY(${translateY}%) scale(${scale})`;
  const dashboardOpacity = 1;

  return (
    <section ref={sectionRef} className="relative pt-16 pb-8 overflow-visible bg-white dark:bg-slate-900">
      <div className="absolute inset-0 dot-pattern opacity-40" />
      <div className="absolute inset-0 gradient-radial" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-10 items-center pt-8 pb-6">
          <div className="max-w-xl">
            <h1
              className={cn(
                "headline-xl font-display text-navy dark:text-white text-balance mb-6 opacity-0",
                isVisible && "animate-fade-up stagger-1"
              )}
            >
              Stop guessing.{" "}
              <span className="gradient-text-primary">Start deciding.</span>
            </h1>
            <p
              className={cn(
                "body-xl text-slate-600 dark:text-slate-400 mb-8 opacity-0",
                isVisible && "animate-fade-up stagger-2"
              )}
            >
              Every repair, setup, and maintenance decision—researched, compared, and ready for you (or your whole group) to act on.
            </p>
            <div
              className={cn(
                "flex flex-col sm:flex-row items-start gap-3 mb-6 opacity-0",
                isVisible && "animate-fade-up stagger-3"
              )}
            >
              <Button
                size="lg"
                className="h-11 px-6 font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-premium hover:shadow-premium-lg transition-all hover:-translate-y-0.5"
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-6 font-medium rounded-lg glass hover:shadow-premium transition-all"
              >
                See How It Works
              </Button>
            </div>

            <div
              className={cn(
                "opacity-0",
                isVisible && "animate-fade-up stagger-4"
              )}
            >
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Integrates with</p>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.0733C24 11.3999 23.9375 10.7332 23.8192 10.0866H12.2422V13.8466H18.8505C18.582 15.2999 17.7443 16.5599 16.5137 17.3866V20.0799H20.4062C22.6095 18.0666 24 15.3333 24 12.0733Z" fill="#4285F4"/>
                    <path d="M12.2422 22.6667C15.1252 22.6667 17.5598 21.7467 20.4062 20.08L16.5137 17.3867C15.4745 18.0867 14.137 18.5067 12.2422 18.5067C9.47474 18.5067 7.10974 16.4667 6.19349 13.8L2.18224 16.5667C4.15349 20.4667 7.93974 22.6667 12.2422 22.6667Z" fill="#34A853"/>
                    <path d="M6.19349 13.8C5.67599 12.3467 5.67599 10.6534 6.19349 9.20005V6.43339H2.18224C0.435742 9.89339 0.435742 14.1067 2.18224 17.5667L6.19349 13.8Z" fill="#FBBC04"/>
                    <path d="M12.2422 5.49333C14.2492 5.46 16.1865 6.24 17.6355 7.61333L21.0427 4.24C18.441 1.85333 14.9452 0.533333 12.2422 0.573333C7.93974 0.573333 4.15349 2.77333 2.18224 6.43333L6.19349 9.2C7.10974 6.53333 9.47474 5.49333 12.2422 5.49333Z" fill="#EA4335"/>
                  </svg>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Google</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all">
                  <Image
                    src="/outlook.png"
                    alt="Outlook"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Outlook</span>
                </button>
              </div>
            </div>
          </div>

          <div className={cn(
            "opacity-0",
            isVisible && "animate-fade-up stagger-2"
          )}>
            <div className="relative">
              <div className="absolute -inset-4 bg-linear-to-br from-emerald-500/20 to-emerald-600/20 blur-3xl" />
              <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                      <Camera className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                      <div className="h-2 w-24 bg-slate-100 dark:bg-slate-800/50 rounded" />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                    <div className="flex items-start gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-emerald-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="h-2 w-full bg-emerald-200 dark:bg-emerald-900/50 rounded mb-1.5" />
                        <div className="h-2 w-3/4 bg-emerald-100 dark:bg-emerald-900/30 rounded" />
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-emerald-600">Analysis complete</div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Your Options:</div>
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1">DIY Fix</div>
                      <div className="flex gap-2 text-[10px] text-slate-600 dark:text-slate-400">
                        <span>$45</span>
                        <span>•</span>
                        <span>2-3 hrs</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1">Professional</div>
                      <div className="flex gap-2 text-[10px] text-slate-600 dark:text-slate-400">
                        <span>$800+</span>
                        <span>•</span>
                        <span>1-2 hrs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            transform: dashboardTransform,
            opacity: dashboardOpacity,
            transformOrigin: "center bottom", // Rotate from bottom edge like laptop hinge
            transition: "transform 0.05s ease-out",
          }}
          className="relative max-w-6xl mx-auto -mt-4"
        >
          <div className="absolute -inset-4 bg-linear-to-b from-primary/10 via-primary/5 to-transparent rounded-4xl blur-3xl pointer-events-none" />
          <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="px-4 py-1.5 rounded-lg bg-background border border-border flex items-center gap-2 max-w-md w-full">
                  <Lock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">www.opportuniq.app</span>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-12 min-h-125">
              <div className="md:col-span-3 border-r border-border p-4 bg-muted/20">
                <div className="space-y-2">
                  {[
                    { icon: Bell, label: "Active Projects", count: "3", active: true },
                    { icon: Users, label: "Workspace", count: "4" },
                    { icon: BookOpen, label: "Guides", count: "" },
                    { icon: Calendar, label: "Calendar", count: "" },
                    { icon: TrendingDown, label: "Budget", count: "" },
                    { icon: Wrench, label: "History", count: "12" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl text-sm transition-colors",
                        item.active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.count && (
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          item.active ? "bg-primary/20" : "bg-muted"
                        )}>
                          {item.count}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-xl border border-dashed border-border bg-background">
                  <p className="text-xs text-muted-foreground mb-3">Quick capture</p>
                  <div className="flex gap-2">
                    <button className="flex-1 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-all hover:scale-105 active:scale-95 group">
                      <Camera className="h-5 w-5 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                    <button className="flex-1 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-all hover:scale-105 active:scale-95 group">
                      <Mic className="h-5 w-5 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="md:col-span-6 p-6">
                <div className="mb-6 p-4 rounded-xl border-2 border-dashed border-border bg-background">
                  <p className="text-xs font-medium mb-3">New Project</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="p-2 rounded-lg border border-border text-center">
                      <Camera className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <span className="text-xs">Photo</span>
                    </div>
                    <div className="p-2 rounded-lg border border-border text-center">
                      <Video className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <span className="text-xs">Video</span>
                    </div>
                    <div className="p-2 rounded-lg border border-border text-center">
                      <Mic className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <span className="text-xs">Voice</span>
                    </div>
                  </div>
                  <div className="px-3 py-2 rounded-lg border border-border bg-card text-xs text-muted-foreground">
                    Or type what's wrong...
                  </div>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-l-primary border border-border bg-primary/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span>🟡</span>
                      <h3 className="font-semibold text-sm">Water heater - rumbling</h3>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      Moderate urgency
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 border border-border mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">Diagnosis</span>
                      <span className="text-xs font-mono text-primary">87% confident</span>
                    </div>
                    <p className="text-sm font-semibold mb-1">Sediment buildup in tank</p>
                    <p className="text-xs text-muted-foreground">Recommend flushing within 2-4 weeks</p>
                  </div>

                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-primary">Recommended Action</span>
                    </div>
                    <p className="text-sm font-semibold mb-1">DIY Tank Flush</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        $0 (DIY)
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        45 min
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-3 border-l border-border p-4 bg-muted/10">
                <div className="mb-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">This Month</p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Available</span>
                        <span className="font-semibold text-primary">$847</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full w-3/4 bg-primary rounded-full" />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>Emergency buffer: $500</p>
                      <p>Pending decisions: $180-240</p>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">This Week</p>
                  <div className="space-y-2">
                    <div className="p-2 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs">🏠</span>
                        <p className="text-xs font-medium">Sarah WFH</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Tue, Jan 16 · All day</p>
                    </div>
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs">🔧</span>
                        <p className="text-xs font-medium">Plumber Visit</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Thu, Jan 18 · 2-4 PM</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs">👥</span>
                        <p className="text-xs font-medium">Ceiling Fan DIY</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Sat, Jan 20 · 10 AM (2 people)</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Draft Email</p>
                  <div className="p-3 rounded-lg bg-background border border-border text-xs">
                    <p className="font-medium mb-1">To: Bay Area Plumbing</p>
                    <p className="text-muted-foreground line-clamp-3">
                      Hi, I have a 10-year-old water heater making rumbling noises. Looking for a quote on tank flush or assessment...
                    </p>
                    <button className="flex items-center gap-1.5 text-primary font-medium mt-2 hover:underline">
                      <Send className="h-3 w-3" />
                      Review & Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
