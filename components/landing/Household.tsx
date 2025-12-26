import { Section, AnimatedElement } from "./shared";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  Crown,
  UserCog,
  UserCheck,
  Eye,
  Vote,
  Timer,
  CheckCircle2,
  BarChart3,
} from "lucide-react";

const roles = [
  { icon: Crown, title: "Owner", desc: "Full control & billing", color: "yellow" },
  { icon: UserCog, title: "Co-owner", desc: "Manage & approve", color: "blue" },
  { icon: UserCheck, title: "Contributor", desc: "Submit & vote", color: "green" },
  { icon: Eye, title: "Viewer", desc: "Read-only access", color: "gray" },
];

const colorClasses = {
  yellow: "bg-yellow-500/10 text-yellow-500",
  blue: "bg-blue-500/10 text-blue-500",
  green: "bg-primary/10 text-primary",
  gray: "bg-muted text-muted-foreground",
};

export function Household() {
  return (
    <Section>
      <AnimatedElement>
        <Section.Header
          badge={
            <Badge variant="secondary" className="border border-border/50">
              <Users className="h-3 w-3 mr-1.5" />
              Household Governance
            </Badge>
          }
          title="Decide together, document everything"
          description="Invite your partner, kids, or roommates. Everyone gets the right level of access, votes on big decisions, and sees the same AI analysis."
        />
      </AnimatedElement>
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <AnimatedElement>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-4">
              Flexible role system
            </p>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-border/50 bg-muted/30 hover:border-primary/30 transition-colors"
                >
                  <div
                    className={`h-10 w-10 rounded-lg ${
                      colorClasses[role.color as keyof typeof colorClasses]
                    } flex items-center justify-center mb-3`}
                  >
                    <role.icon className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-sm">{role.title}</p>
                  <p className="text-xs text-muted-foreground">{role.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-sm">
                <Users className="inline h-4 w-4 mr-1.5 text-primary" />
                Invite unlimited members via email or shareable link
              </p>
            </div>
          </div>
        </AnimatedElement>
        <AnimatedElement delay={100}>
          <div className="rounded-xl border border-border/50 bg-card shadow-lg overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Replace aging HVAC system</p>
                  <p className="text-sm text-muted-foreground">
                    Decision pending · 2 votes needed
                  </p>
                </div>
                <Badge variant="secondary">
                  <Vote className="h-3 w-3 mr-1" />
                  Voting
                </Badge>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-500/10 text-blue-500 text-sm">
                    JM
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 rounded-xl bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Jamie</p>
                    <span className="text-xs text-muted-foreground">Co-owner</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Wait until after the tariffs settle.
                  </p>
                  <Badge
                    variant="outline"
                    className="text-xs bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-500 mt-2"
                  >
                    <Timer className="h-3 w-3 mr-1" />
                    Wait
                  </Badge>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    AL
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 rounded-xl bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Alex</p>
                    <span className="text-xs text-muted-foreground">Owner</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Rebate ends March. We&apos;d lose $2,000.
                  </p>
                  <Badge
                    variant="outline"
                    className="text-xs bg-primary/10 border-primary/20 text-primary mt-2"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Buy now
                  </Badge>
                </div>
              </div>
            </div>
            <div className="p-3 bg-yellow-500/10 border-t border-yellow-500/20">
              <p className="text-sm">
                <BarChart3 className="inline h-4 w-4 mr-1.5 text-yellow-500" />
                <strong>AI:</strong> Buy now saves $800 net after rebate deadline.
              </p>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </Section>
  );
}
