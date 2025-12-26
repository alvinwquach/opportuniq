import { Section, AnimatedElement } from "./shared";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  ClipboardList,
  CalendarCheck,
  Wind,
  Flame,
  Snowflake,
  CalendarClock,
  AlertCircle,
  FileText,
  Bell,
  Calendar,
  CheckCircle2,
  Mail,
} from "lucide-react";

const appliances = [
  { name: "HVAC System", brand: "Carrier", age: "8 years", status: "good", icon: Wind },
  { name: "Water Heater", brand: "Rheem", age: "12 years", status: "aging", icon: Flame },
  { name: "Refrigerator", brand: "Samsung", age: "3 years", status: "good", icon: Snowflake },
];

const tasks = [
  { task: "Replace HVAC filter", due: "Overdue", urgent: true },
  { task: "Flush water heater", due: "This week", urgent: false },
  { task: "Clean dryer vent", due: "Next month", urgent: false },
];

const features = [
  { icon: FileText, text: "Attach warranties & receipts" },
  { icon: Bell, text: "Reminders before it's urgent" },
  { icon: Calendar, text: "Google Calendar & Outlook sync" },
  { icon: CheckCircle2, text: "Track maintenance history" },
];

export function HomeManagement() {
  return (
    <Section background="muted">
      <AnimatedElement>
        <Section.Header
          badge={
            <Badge variant="secondary" className="border border-border/50">
              <Home className="h-3 w-3 mr-1.5" />
              Home Management
            </Badge>
          }
          title="Track what you own, maintain what matters"
          description="Log your appliances with age and warranty info. Get automatic maintenance schedules and reminders before things become urgent."
        />
      </AnimatedElement>
      <div className="grid lg:grid-cols-2 gap-6">
        <AnimatedElement>
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden h-full">
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                <p className="font-semibold">Home Inventory</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                3 items
              </Badge>
            </div>
            <div className="p-4 space-y-2">
              {appliances.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.brand} · {item.age}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      item.status === "good"
                        ? "bg-primary/10 text-primary"
                        : "bg-yellow-500/10 text-yellow-500"
                    }`}
                  >
                    {item.status === "good" ? "Good" : "Aging"}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-yellow-500/10 border-t border-yellow-500/20">
              <p className="text-xs">
                <AlertCircle className="inline h-3 w-3 mr-1 text-yellow-500" />
                Water heater approaching end-of-life (12 of 10-15 years)
              </p>
            </div>
          </div>
        </AnimatedElement>
        <AnimatedElement delay={100}>
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden h-full">
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-primary" />
                <p className="font-semibold">Maintenance Schedule</p>
              </div>
              <p className="text-xs text-muted-foreground">December 2024</p>
            </div>
            <div className="p-4 space-y-2">
              {tasks.map((task, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    task.urgent
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-border/50 bg-muted/30"
                  }`}
                >
                  <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      task.urgent ? "bg-destructive/10" : "bg-muted"
                    }`}
                  >
                    <CalendarClock
                      className={`h-4 w-4 ${
                        task.urgent ? "text-destructive" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{task.task}</p>
                  </div>
                  <p
                    className={`text-xs font-medium ${
                      task.urgent ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {task.due}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-3 bg-muted/30 border-t border-border/50 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Syncs with your calendar
              </p>
              <div className="flex items-center gap-1">
                <div className="h-5 w-5 rounded bg-card border border-border/50 flex items-center justify-center">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="h-5 w-5 rounded bg-card border border-border/50 flex items-center justify-center">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </AnimatedElement>
      </div>
      <AnimatedElement delay={200}>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <item.icon className="h-4 w-4 text-primary shrink-0" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </AnimatedElement>
    </Section>
  );
}
