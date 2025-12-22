"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera, Mic, Video, Bot, CheckCircle2, Clock, DollarSign, Wrench, Users, Send, TrendingDown, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpring, animated } from "@react-spring/web";
import { useInView } from "react-intersection-observer";

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const { ref: dashboardRef, inView: dashboardInView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const dashboardSpring = useSpring({
    opacity: dashboardInView ? 1 : 0,
    transform: dashboardInView ? "translateY(0px)" : "translateY(60px)",
    config: { tension: 280, friction: 60 },
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen pt-20 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center max-w-4xl mx-auto pt-12 pb-16">
          <div
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-sm text-primary mb-8 opacity-0 backdrop-blur-sm",
              isVisible && "animate-fade-up stagger-1"
            )}
          >
            <Bot className="h-4 w-4" />
            <span>Home maintenance, handled</span>
          </div>
          <h1
            className={cn(
              "font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance mb-6 opacity-0",
              isVisible && "animate-fade-up stagger-2"
            )}
          >
            Your home decisions,{" "}
            <span className="gradient-text-coral">handled.</span>
          </h1>
          <p
            className={cn(
              "text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto opacity-0",
              isVisible && "animate-fade-up stagger-3"
            )}
          >
            Diagnose issues, find contractors, and draft emails through your Gmail or Outlook — all from one place.
          </p>
          <div
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 opacity-0",
              isVisible && "animate-fade-up stagger-4"
            )}
          >
            <Button
              size="lg"
              className="h-14 px-8 text-base font-medium rounded-xl group"
            >
              Start free
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base font-medium rounded-xl"
            >
              See how it works
            </Button>
          </div>
          <div
            className={cn(
              "flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground opacity-0",
              isVisible && "animate-fade-up stagger-5"
            )}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Free forever
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              No credit card
            </span>
          </div>
          <div
            className={cn(
              "flex flex-col items-center gap-4 mt-12 opacity-0",
              isVisible && "animate-fade-up stagger-6"
            )}
          >
            <p className="text-sm text-muted-foreground">Works with your email</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-card border border-border/50 shadow-sm">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.0733C24 11.3999 23.9375 10.7332 23.8192 10.0866H12.2422V13.8466H18.8505C18.582 15.2999 17.7443 16.5599 16.5137 17.3866V20.0799H20.4062C22.6095 18.0666 24 15.3333 24 12.0733Z" fill="#4285F4"/>
                  <path d="M12.2422 22.6667C15.1252 22.6667 17.5598 21.7467 20.4062 20.08L16.5137 17.3867C15.4745 18.0867 14.137 18.5067 12.2422 18.5067C9.47474 18.5067 7.10974 16.4667 6.19349 13.8L2.18224 16.5667C4.15349 20.4667 7.93974 22.6667 12.2422 22.6667Z" fill="#34A853"/>
                  <path d="M6.19349 13.8C5.67599 12.3467 5.67599 10.6534 6.19349 9.20005V6.43339H2.18224C0.435742 9.89339 0.435742 14.1067 2.18224 17.5667L6.19349 13.8Z" fill="#FBBC04"/>
                  <path d="M12.2422 5.49333C14.2492 5.46 16.1865 6.24 17.6355 7.61333L21.0427 4.24C18.441 1.85333 14.9452 0.533333 12.2422 0.573333C7.93974 0.573333 4.15349 2.77333 2.18224 6.43333L6.19349 9.2C7.10974 6.53333 9.47474 5.49333 12.2422 5.49333Z" fill="#EA4335"/>
                </svg>
                <span className="font-medium text-sm text-foreground">Gmail</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-card border border-border/50 shadow-sm">
                <Image
                  src="/outlook.png"
                  alt="Outlook"
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
                <span className="font-medium text-sm text-foreground">Outlook</span>
              </div>
            </div>
          </div>
        </div>
        <animated.div
          ref={dashboardRef}
          style={dashboardSpring}
          className="relative max-w-6xl mx-auto"
        >
          <div className="absolute -inset-4 bg-linear-to-b from-primary/10 via-primary/5 to-transparent rounded-4xl blur-3xl pointer-events-none animate-pulse" />
          {/* Dashboard container */}
          <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-muted-foreground font-medium">Opportuniq Dashboard</span>
              </div>
            </div>
            <div className="grid md:grid-cols-12 min-h-125">
              <div className="md:col-span-3 border-r border-border p-4 bg-muted/20">
                <div className="space-y-2">
                  {[
                    { icon: Bell, label: "Active Issues", count: "3", active: true },
                    { icon: Users, label: "Household", count: "4" },
                    { icon: TrendingDown, label: "Budget", count: "" },
                    { icon: Wrench, label: "Inventory", count: "12" },
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
                  <p className="text-xs font-medium mb-3">New Issue</p>
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
                <div className="p-4 rounded-xl border-l-4 border-l-yellow-500 border border-border bg-yellow-500/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span>🟡</span>
                      <h3 className="font-semibold text-sm">Water heater - rumbling</h3>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                      VOTE NEEDED
                    </span>
                  </div>

                  {/* AI Recommendation */}
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-primary">AI Recommendation</span>
                      <span className="text-xs font-mono text-primary">87%</span>
                    </div>
                    <p className="text-sm font-semibold mb-1">DIY Flush</p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>$0</span>
                      <span>45 min</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>👤 You: Not voted</span>
                      <span>👤 Sarah: ✅ Approved</span>
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
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Household Vote</p>
                  <div className="space-y-2">
                    {[
                      { name: "You", vote: "DIY", avatar: "JD" },
                      { name: "Sarah", vote: "Pending", avatar: "SK" },
                    ].map((member, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-background">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                            {member.avatar}
                          </div>
                          <span className="text-sm">{member.name}</span>
                        </div>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded",
                          member.vote === "DIY" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"
                        )}>
                          {member.vote}
                        </span>
                      </div>
                    ))}
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
        </animated.div>
      </div>
    </section>
  );
}
