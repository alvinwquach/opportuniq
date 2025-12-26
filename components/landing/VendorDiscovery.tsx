import { Section, AnimatedElement } from "./shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Search,
  Globe,
  Star,
  DollarSign,
  PhoneCall,
  Mail,
  LucideIcon,
} from "lucide-react";

const vendors = [
  {
    name: "ABC Heating & Air",
    rating: 4.9,
    reviews: 234,
    price: "$$",
    specialty: "HVAC repair",
    match: 95,
    best: true,
  },
  {
    name: "CoolBreeze HVAC",
    rating: 4.7,
    reviews: 156,
    price: "$$",
    specialty: "Installations",
    match: 88,
    best: false,
  },
  {
    name: "QuickFix Climate",
    rating: 4.5,
    reviews: 89,
    price: "$",
    specialty: "Emergency calls",
    match: 82,
    best: false,
  },
];

const features: { icon: LucideIcon; text: string }[] = [
  { icon: Globe, text: "Searches multiple platforms (Yelp, Google, Angi, HomeAdvisor)" },
  { icon: Star, text: "Weighted scoring based on reviews for your specific issue" },
  { icon: DollarSign, text: "Typical pricing ranges for your area and job type" },
  { icon: PhoneCall, text: "Contact info and business hours when available" },
  { icon: Mail, text: "Pre-written outreach messages with your job details" },
];

export function VendorDiscovery() {
  return (
    <Section background="muted">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <AnimatedElement className="order-2 lg:order-1">
          <div className="rounded-xl border border-border/50 bg-card shadow-lg overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center gap-2 bg-muted/30">
              <Globe className="h-5 w-5 text-blue-500" />
              <p className="font-semibold">Finding contractors for: HVAC repair</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>Searching local businesses and reviews...</span>
              </div>
              <div className="space-y-3">
                {vendors.map((vendor, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-4 rounded-xl border transition-colors",
                      vendor.best
                        ? "border-primary/30 bg-primary/5"
                        : "border-border/50 hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{vendor.name}</p>
                          {vendor.best && (
                            <Badge className="bg-primary text-primary-foreground text-xs">
                              Best match
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            {vendor.rating} ({vendor.reviews})
                          </span>
                          <span>{vendor.price}</span>
                          <span>{vendor.specialty}</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {vendor.match}% match
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                <Mail className="h-4 w-4 mr-2" />
                Contact top 3 for quotes
              </Button>
            </div>
          </div>
        </AnimatedElement>
        <AnimatedElement className="order-1 lg:order-2">
          <Section.Header
            align="left"
            badge={
              <Badge variant="secondary" className="border border-border/50">
                <Search className="h-3 w-3 mr-1.5" />
                Smart Vendor Discovery
              </Badge>
            }
            title={
              <>
                We find the right people,
                <br />
                so you don&apos;t have to
              </>
            }
            description="When you decide to hire, our AI scours the web for local contractors. We check ratings, read reviews, and compare typical pricing. You get a curated list, not a Google rabbit hole."
            className="mb-8"
          />
          <div className="space-y-3">
            {features.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-blue-500 shrink-0" />
                <span className="text-sm text-muted-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </AnimatedElement>
      </div>
    </Section>
  );
}
