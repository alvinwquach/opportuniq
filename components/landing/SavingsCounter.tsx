"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as d3 from "d3";
import { IoTrendingUp, IoPeople, IoFlash } from "react-icons/io5";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}


interface CounterDigit {
  value: number;
  offset: number;
}

export function SavingsCounter() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [totalSaved, setTotalSaved] = useState(2847652);
  const [usersCount, setUsersCount] = useState(12847);
  const [decisionsToday, setDecisionsToday] = useState(1247);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || !mounted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [mounted]);

  // Simulate real-time updates
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      // Random increment between $5 and $50
      const increment = Math.floor(Math.random() * 45) + 5;
      setTotalSaved(prev => prev + increment);

      // Occasionally increment decisions
      if (Math.random() > 0.7) {
        setDecisionsToday(prev => prev + 1);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  // Animated number component
  const AnimatedNumber = ({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const prevValueRef = useRef(0);

    useEffect(() => {
      if (!isVisible) return;

      const startValue = prevValueRef.current;
      const endValue = value;
      prevValueRef.current = value;

      const duration = 1500;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic

        const current = Math.floor(startValue + (endValue - startValue) * eased);
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, [value, isVisible]);

    return (
      <span className="tabular-nums">
        {prefix}{displayValue.toLocaleString()}{suffix}
      </span>
    );
  };

  if (!mounted) return null;

  return (
    <div
      ref={sectionRef}
      className="relative py-16 lg:py-20 bg-linear-to-b from-gray-900 to-black overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-500/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-4">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Live Counter
          </div>
          <h2 className="text-lg text-gray-400 mb-2">
            Total Saved by OpportunIQ Users
          </h2>
          <div className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-2">
            <span className="text-emerald-400">$</span>
            <AnimatedNumber value={totalSaved} />
          </div>
          <p className="text-sm text-gray-500">
            and counting...
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-4 text-center backdrop-blur-sm">
            <IoPeople className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              <AnimatedNumber value={usersCount} />
            </div>
            <div className="text-xs text-gray-500">Active Users</div>
          </div>
          <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-4 text-center backdrop-blur-sm">
            <IoFlash className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              <AnimatedNumber value={decisionsToday} />
            </div>
            <div className="text-xs text-gray-500">Decisions Today</div>
          </div>
          <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-4 text-center backdrop-blur-sm">
            <IoTrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              $<AnimatedNumber value={Math.floor(totalSaved / usersCount)} />
            </div>
            <div className="text-xs text-gray-500">Avg. per User</div>
          </div>
        </div>
        <div className="mt-10 max-w-md mx-auto">
          <RecentActivityFeed isVisible={isVisible} />
        </div>
      </div>
    </div>
  );
}

function RecentActivityFeed({ isVisible }: { isVisible: boolean }) {
  const [activities, setActivities] = useState<Array<{
    id: number;
    name: string;
    action: string;
    amount: number;
    time: string;
  }>>([]);

  const names = ["Alex", "Jordan", "Sam", "Taylor", "Morgan", "Casey", "Riley", "Drew"];
  const actions = [
    "saved on a faucet repair",
    "chose DIY for AC filter",
    "fixed a ceiling crack",
    "saved on garage door fix",
    "repaired dishwasher drain",
  ];

  useEffect(() => {
    if (!isVisible) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActivities([
      { id: 1, name: names[0], action: actions[0], amount: 185, time: "just now" },
      { id: 2, name: names[1], action: actions[1], amount: 95, time: "2 min ago" },
      { id: 3, name: names[2], action: actions[2], amount: 240, time: "5 min ago" },
    ]);

    // Add new activities periodically
    const interval = setInterval(() => {
      const newActivity = {
        id: Date.now(),
        name: names[Math.floor(Math.random() * names.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        amount: Math.floor(Math.random() * 250) + 50,
        time: "just now",
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 2)]);
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="space-y-2">
      {activities.map((activity, i) => (
        <div
          key={activity.id}
          className={`flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-800/30 border border-gray-700/30 text-sm transition-all duration-500 ${
            i === 0 ? "opacity-100 scale-100" : "opacity-60 scale-98"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-xs font-medium text-white">
            {activity.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-medium text-white">{activity.name}</span>
            <span className="text-gray-400"> {activity.action}</span>
          </div>
          <div className="text-emerald-400 font-medium">
            +${activity.amount}
          </div>
        </div>
      ))}
    </div>
  );
}
