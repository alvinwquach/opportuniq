"use client";

import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import {
  IoCartOutline,
  IoPricetagOutline,
  IoLocationOutline,
  IoCheckmarkCircleOutline,
  IoCheckmarkCircle,
  IoOpenOutline,
  IoChevronForward,
} from "react-icons/io5";

const FEATURES = [
  {
    title: "Multi-Retailer Search",
    description: "Search Home Depot, Lowe's, Ace Hardware, and Amazon at once. Find the best price instantly.",
    icon: IoCartOutline,
  },
  {
    title: "Live Pricing",
    description: "See current prices from each store. No more visiting multiple websites to compare.",
    icon: IoPricetagOutline,
  },
  {
    title: "Local Stock Status",
    description: "Know if the part is in stock at your local store before you drive there.",
    icon: IoCheckmarkCircleOutline,
  },
  {
    title: "Store Directions",
    description: "Get directions to the nearest store with the parts you need. One tap to navigate.",
    icon: IoLocationOutline,
  },
];

const SAMPLE_PARTS = [
  {
    name: "1/4\" O-Ring Kit (10-pack)",
    store: "Home Depot",
    price: 4.97,
    inStock: true,
    distance: "1.2 mi",
  },
  {
    name: "Faucet Cartridge Replacement",
    store: "Lowe's",
    price: 12.98,
    inStock: true,
    distance: "2.1 mi",
  },
  {
    name: "Plumber's Tape (3-pack)",
    store: "Ace Hardware",
    price: 3.49,
    inStock: true,
    distance: "0.8 mi",
  },
  {
    name: "Basin Wrench",
    store: "Amazon",
    price: 15.99,
    inStock: true,
    distance: "Delivery",
  },
  {
    name: "Adjustable Wrench Set",
    store: "Home Depot",
    price: 19.97,
    inStock: false,
    distance: "1.2 mi",
  },
];

const RETAILERS = [
  { name: "Home Depot", color: "bg-orange-500" },
  { name: "Lowe's", color: "bg-blue-500" },
  { name: "Ace Hardware", color: "bg-red-500" },
  { name: "Amazon", color: "bg-amber-500" },
];

const BENEFITS = [
  "Compare prices across 4+ retailers",
  "See real-time stock availability",
  "Get parts matched to your diagnosis",
  "One-click to add to store cart",
  "Save favorite parts for later",
  "Track parts you've purchased",
];

export default function PartsFinderPage() {
  const totalCost = SAMPLE_PARTS.filter(p => p.inStock).reduce((sum, p) => sum + p.price, 0);

  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 px-6 bg-neutral-950">
        <div className="max-w-4xl mx-auto text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-sm text-neutral-500 mb-6">
            <Link href="/product" className="hover:text-blue-400 transition-colors">
              Product
            </Link>
            <IoChevronForward className="w-3 h-3" />
            <span className="text-neutral-300">Parts Finder</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-mono mb-6">
            <IoCartOutline className="w-4 h-4" />
            Parts Finder
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Find parts{" "}
            <span className="text-blue-400">
              at the best price
            </span>
          </h1>

          <p className="text-lg text-neutral-200 max-w-2xl mx-auto mb-10">
            Know exactly what parts you need and where to get them. Compare prices
            across retailers and check local stock before you go.
          </p>

          <WaitlistModal>
            <Button className="h-12 px-8 font-mono font-bold bg-blue-500 hover:bg-blue-400 text-black rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.4)]">
              Get Early Access
            </Button>
          </WaitlistModal>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 border-t border-neutral-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {FEATURES.map((feature, i) => (
              <div key={i} className="p-6 rounded-xl bg-neutral-900 border border-neutral-700">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Parts */}
      <section className="py-20 px-6 bg-gradient-to-b from-neutral-950 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Parts matched to your repair
              </h2>
              <p className="text-neutral-300 mb-8">
                When you diagnose an issue, we identify the exact parts you&apos;ll need.
                See prices and availability across multiple stores instantly.
              </p>

              <div className="flex items-center gap-3 mb-8">
                {RETAILERS.map((retailer, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${retailer.color}`} />
                    <span className="text-xs text-neutral-400">{retailer.name}</span>
                  </div>
                ))}
              </div>

              <ul className="space-y-3">
                {BENEFITS.slice(0, 4).map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-300">
                    <IoCheckmarkCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-neutral-950/80 rounded-xl border border-neutral-800 p-4">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-sm font-medium text-neutral-400">Parts for: Kitchen Faucet Repair</span>
                <span className="text-xs text-blue-400">${totalCost.toFixed(2)} total</span>
              </div>
              <div className="space-y-2">
                {SAMPLE_PARTS.map((part, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border ${
                      part.inStock
                        ? "bg-neutral-900/50 border-neutral-800"
                        : "bg-neutral-900/30 border-neutral-800/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{part.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`w-2 h-2 rounded-full ${
                            part.store === "Home Depot" ? "bg-orange-500"
                            : part.store === "Lowe's" ? "bg-blue-500"
                            : part.store === "Ace Hardware" ? "bg-red-500"
                            : "bg-amber-500"
                          }`} />
                          <span className="text-xs text-neutral-500">{part.store}</span>
                          <span className="text-xs text-neutral-600">•</span>
                          <span className="text-xs text-neutral-500">{part.distance}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">${part.price.toFixed(2)}</p>
                        <span className={`text-xs ${part.inStock ? "text-emerald-400" : "text-red-400"}`}>
                          {part.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>
                    {part.inStock && (
                      <button className="w-full mt-2 py-1.5 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 rounded-lg transition-colors flex items-center justify-center gap-1">
                        <IoOpenOutline className="w-3 h-3" />
                        View at {part.store}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-t border-neutral-800">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "4+", label: "Retailers" },
              { value: "Real-time", label: "Pricing" },
              { value: "Local", label: "Stock status" },
              { value: "1-click", label: "To store cart" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-3xl font-bold text-blue-400 mb-1">{stat.value}</p>
                <p className="text-sm text-neutral-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-neutral-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Stop wasting trips to the store
          </h2>
          <p className="text-neutral-300 mb-8">
            Join the waitlist and get the right parts, at the right price, the first time.
          </p>
          <WaitlistModal>
            <Button className="h-14 px-8 font-mono font-bold text-lg bg-blue-500 hover:bg-blue-400 text-black rounded-lg transition-all duration-300 shadow-[0_0_30px_rgba(20,184,166,0.4)]">
              Join the Waitlist
            </Button>
          </WaitlistModal>
        </div>
      </section>
    </>
  );
}
