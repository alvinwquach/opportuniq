"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  IoWarning,
  IoCheckmarkCircle,
  IoBag,
  IoShield,
  IoFlash,
  IoCall,
  IoEye,
  IoHandLeft,
} from "react-icons/io5";
import { FaWind, FaTshirt } from "react-icons/fa";

/**
 * PartsAvailabilityDemo
 *
 * Clean two-column layout with toggle - no layout shifts
 * Light background section to break up the dark page
 * Scenario: Attic insulation with fiberglass - requires PPE
 */

const SCENARIO = {
  title: "Attic Insulation Replacement",
  subtitle: "Old fiberglass insulation deteriorating, needs replacement",
  difficulty: "Moderate",
  timeEstimate: "4-6 hours",
};

const PPE_REQUIRED = [
  { name: "N95 Respirator", icon: FaWind, price: 12.99 },
  { name: "Safety Goggles", icon: IoEye, price: 8.99 },
  { name: "Work Gloves", icon: IoHandLeft, price: 14.99 },
  { name: "Disposable Coveralls", icon: FaTshirt, price: 19.99 },
];

const MATERIALS = [
  { id: 1, name: "R-38 Fiberglass Batts (8-pack)", price: 67.98 },
  { id: 2, name: "Insulation Supports", price: 24.99 },
  { id: 3, name: "Utility Knife", price: 12.97 },
  { id: 4, name: "Staple Gun + Staples", price: 34.99 },
];

const PRO_OPTION = {
  price: 1200,
  priceRange: "$800-1,500",
  timeframe: "1 day",
  includes: ["All materials", "Professional labor", "Old insulation disposal", "Building inspection", "10-year warranty"],
};

const NEARBY_STORES = [
  {
    name: "Home Depot",
    driveTime: 6,
    lat: 42.3876,
    lng: -71.0812,
    color: "#F96302",
  },
  {
    name: "Lowe's",
    driveTime: 10,
    lat: 42.3912,
    lng: -71.0328,
    color: "#004990",
  },
];

const USER_LOCATION = { lat: 42.3736, lng: -71.1097 };

// Light mode styles for AAA accessibility
const styles = {
  text: { color: '#111827' },
  textMuted: { color: '#4b5563' },
  accent: '#2563eb',
  accentLight: '#dbeafe',
  accentBorder: '#bfdbfe',
  success: '#16a34a',
  successLight: '#dcfce7',
  successBorder: '#bbf7d0',
  warning: '#d97706',
  warningLight: '#fef3c7',
  warningBorder: '#fde68a',
};

export function PartsAvailabilityDemo() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedOption, setSelectedOption] = useState<"diy" | "pro">("diy");


  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken =
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
      "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-71.0697, 42.3801],
      zoom: 11.5,
      attributionControl: false,
      interactive: false,
    });

    map.current.on("load", () => {
      // User location
      const userEl = document.createElement("div");
      userEl.innerHTML = `<div style="width:14px;height:14px;background:#0066FF;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`;
      new mapboxgl.Marker({ element: userEl })
        .setLngLat([USER_LOCATION.lng, USER_LOCATION.lat])
        .addTo(map.current!);

      // Store markers
      NEARBY_STORES.forEach((store) => {
        const el = document.createElement("div");
        el.innerHTML = `<div style="width:32px;height:32px;border-radius:8px;background:${store.color};border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;color:white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${store.name.charAt(0)}</div>`;
        new mapboxgl.Marker({ element: el })
          .setLngLat([store.lng, store.lat])
          .addTo(map.current!);
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);


  const ppeCost = PPE_REQUIRED.reduce((sum, p) => sum + p.price, 0);
  const materialsCost = MATERIALS.reduce((sum, p) => sum + p.price, 0);
  const diyTotalCost = ppeCost + materialsCost;
  const savings = PRO_OPTION.price - diyTotalCost;

  return (
    <section className="py-20 px-6" style={{ backgroundColor: '#f9fafb' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
            style={{ backgroundColor: styles.warningLight, color: styles.warning, border: `1px solid ${styles.warningBorder}` }}
          >
            <IoWarning className="w-3.5 h-3.5" />
            Safety Gear Required
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={styles.text}>
            {SCENARIO.title}
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={styles.textMuted}>
            {SCENARIO.subtitle}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 rounded-xl border-2 shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
            <button
              onClick={() => setSelectedOption("diy")}
              className="px-6 py-3 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: selectedOption === "diy" ? styles.accent : 'transparent',
                color: selectedOption === "diy" ? '#ffffff' : styles.textMuted.color,
              }}
            >
              <span className="flex items-center gap-2">
                <IoFlash className="w-4 h-4" />
                Do It Yourself
              </span>
            </button>
            <button
              onClick={() => setSelectedOption("pro")}
              className="px-6 py-3 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: selectedOption === "pro" ? styles.success : 'transparent',
                color: selectedOption === "pro" ? '#ffffff' : styles.textMuted.color,
              }}
            >
              <span className="flex items-center gap-2">
                <IoShield className="w-4 h-4" />
                Hire a Pro
              </span>
            </button>
          </div>
        </div>

        {/* Main Content - Fixed two column layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Details */}
          <div className="space-y-6">
            {selectedOption === "diy" ? (
              <>
                {/* PPE Required */}
                <div className="p-6 rounded-2xl border-2" style={{ backgroundColor: styles.warningLight, borderColor: styles.warningBorder }}>
                  <div className="flex items-center gap-2 mb-4">
                    <IoWarning className="w-5 h-5" style={{ color: styles.warning }} />
                    <h3 className="font-semibold" style={styles.text}>Safety Equipment Required</h3>
                  </div>
                  <p className="text-sm mb-4" style={styles.textMuted}>
                    Fiberglass particles irritate skin, eyes, and lungs. Required PPE:
                  </p>
                  <div className="space-y-2">
                    {PPE_REQUIRED.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-3 rounded-xl border-2"
                        style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: styles.warningLight }}>
                            <item.icon className="w-4 h-4" style={{ color: styles.warning }} />
                          </div>
                          <span className="text-sm font-medium" style={styles.text}>{item.name}</span>
                        </div>
                        <span className="text-sm font-mono" style={styles.textMuted}>${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 flex justify-between" style={{ borderTop: `1px solid ${styles.warningBorder}` }}>
                    <span className="text-sm" style={styles.textMuted}>Safety gear subtotal</span>
                    <span className="text-sm font-semibold" style={styles.text}>${ppeCost.toFixed(2)}</span>
                  </div>
                </div>

                {/* Materials */}
                <div className="p-6 rounded-2xl border-2" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <IoBag className="w-5 h-5" style={{ color: styles.accent }} />
                    <h3 className="font-semibold" style={styles.text}>Materials Needed</h3>
                  </div>
                  <div className="space-y-2">
                    {MATERIALS.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl"
                        style={{ backgroundColor: '#f9fafb' }}
                      >
                        <span className="text-sm" style={styles.text}>{item.name}</span>
                        <span className="text-sm font-mono" style={styles.textMuted}>${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 flex justify-between" style={{ borderTop: '1px solid #e5e7eb' }}>
                    <span className="text-sm" style={styles.textMuted}>Materials subtotal</span>
                    <span className="text-sm font-semibold" style={styles.text}>${materialsCost.toFixed(2)}</span>
                  </div>
                </div>

                {/* DIY Total */}
                <div className="p-6 rounded-2xl text-white" style={{ backgroundColor: styles.accent }}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ color: '#dbeafe' }}>DIY Total Cost</span>
                    <span className="text-3xl font-bold">${diyTotalCost.toFixed(2)}</span>
                  </div>
                  <div className="text-sm" style={{ color: '#dbeafe' }}>
                    Save <span className="font-semibold text-white">${savings.toFixed(0)}</span> vs hiring a pro
                  </div>
                  <div className="mt-4 pt-4 text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.2)', color: '#dbeafe' }}>
                    Estimated time: {SCENARIO.timeEstimate}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Pro Benefits */}
                <div className="p-6 rounded-2xl border-2" style={{ backgroundColor: styles.successLight, borderColor: styles.successBorder }}>
                  <div className="flex items-center gap-2 mb-4">
                    <IoShield className="w-5 h-5" style={{ color: styles.success }} />
                    <h3 className="font-semibold" style={styles.text}>What&apos;s Included</h3>
                  </div>
                  <div className="space-y-3">
                    {PRO_OPTION.includes.map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <IoCheckmarkCircle className="w-5 h-5 flex-shrink-0" style={{ color: styles.success }} />
                        <span className="text-sm" style={styles.text}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why Pro */}
                <div className="p-6 rounded-2xl border-2" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
                  <h3 className="font-semibold mb-4" style={styles.text}>Why hire a professional?</h3>
                  <div className="space-y-4 text-sm" style={styles.textMuted}>
                    <p>
                      <span className="font-medium" style={styles.text}>No safety gear needed</span> — They bring their own PPE and handle the hazardous material.
                    </p>
                    <p>
                      <span className="font-medium" style={styles.text}>Proper disposal</span> — Old insulation is removed and disposed of according to regulations.
                    </p>
                    <p>
                      <span className="font-medium" style={styles.text}>Guaranteed work</span> — 10-year warranty on installation quality.
                    </p>
                  </div>
                </div>

                {/* Pro Total */}
                <div className="p-6 rounded-2xl text-white" style={{ backgroundColor: styles.success }}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ color: '#dcfce7' }}>Professional Installation</span>
                    <span className="text-3xl font-bold">${PRO_OPTION.price}</span>
                  </div>
                  <div className="text-sm" style={{ color: '#dcfce7' }}>
                    {PRO_OPTION.priceRange} depending on attic size
                  </div>
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    <button
                      className="w-full py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#ffffff', color: styles.success }}
                    >
                      <IoCall className="w-4 h-4" />
                      Get Free Quote
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column - Map & Summary */}
          <div className="space-y-6">
            {/* Map */}
            <div className="rounded-2xl overflow-hidden border-2 shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
              <div ref={mapContainer} className="w-full h-[280px]" />
              <div className="p-4" style={{ borderTop: '1px solid #e5e7eb' }}>
                <div className="text-sm mb-3" style={styles.textMuted}>
                  Nearby stores with materials {selectedOption === "diy" && "& safety gear"}:
                </div>
                <div className="flex gap-4">
                  {NEARBY_STORES.map((store) => (
                    <div key={store.name} className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: store.color }}
                      >
                        {store.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={styles.text}>{store.name}</div>
                        <div className="text-xs" style={styles.textMuted}>{store.driveTime} min drive</div>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedOption === "diy" && (
                  <div className="mt-3 pt-3 flex items-center gap-2 text-xs" style={{ borderTop: '1px solid #e5e7eb', color: styles.textMuted.color }}>
                    <IoCheckmarkCircle className="w-3.5 h-3.5" style={{ color: styles.success }} />
                    All PPE items available at both locations
                  </div>
                )}
              </div>
            </div>

            {/* Comparison Card */}
            <div className="p-6 rounded-2xl border-2 shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
              <h3 className="font-semibold mb-4" style={styles.text}>Quick Comparison</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <span className="text-sm" style={styles.textMuted}>Total Cost</span>
                  <div className="flex gap-6">
                    <div className="text-right">
                      <div className="text-xs" style={styles.textMuted}>DIY</div>
                      <div className="font-semibold" style={{ color: styles.accent }}>${diyTotalCost.toFixed(0)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs" style={styles.textMuted}>Pro</div>
                      <div className="font-semibold" style={{ color: styles.success }}>${PRO_OPTION.price}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <span className="text-sm" style={styles.textMuted}>Your Time</span>
                  <div className="flex gap-6">
                    <div className="text-right">
                      <div className="text-xs" style={styles.textMuted}>DIY</div>
                      <div className="font-semibold" style={styles.text}>{SCENARIO.timeEstimate}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs" style={styles.textMuted}>Pro</div>
                      <div className="font-semibold" style={styles.text}>0 hours</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <span className="text-sm" style={styles.textMuted}>Safety Gear</span>
                  <div className="flex gap-6">
                    <div className="text-right">
                      <div className="text-xs" style={styles.textMuted}>DIY</div>
                      <div className="font-semibold" style={{ color: styles.warning }}>Required</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs" style={styles.textMuted}>Pro</div>
                      <div className="font-semibold" style={{ color: styles.success }}>Included</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={styles.textMuted}>Warranty</span>
                  <div className="flex gap-6">
                    <div className="text-right">
                      <div className="text-xs" style={styles.textMuted}>DIY</div>
                      <div className="font-semibold" style={styles.textMuted}>None</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs" style={styles.textMuted}>Pro</div>
                      <div className="font-semibold" style={{ color: styles.success }}>10 years</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom recommendation */}
            <div
              className="p-4 rounded-xl border-2"
              style={{
                backgroundColor: selectedOption === "diy" ? styles.warningLight : styles.successLight,
                borderColor: selectedOption === "diy" ? styles.warningBorder : styles.successBorder
              }}
            >
              <div className="flex items-start gap-3">
                {selectedOption === "diy" ? (
                  <>
                    <IoWarning className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: styles.warning }} />
                    <div className="text-sm" style={{ color: '#92400e' }}>
                      <span className="font-medium">DIY is viable</span> if you have the time and follow safety precautions. Don&apos;t skip the PPE.
                    </div>
                  </>
                ) : (
                  <>
                    <IoCheckmarkCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: styles.success }} />
                    <div className="text-sm" style={{ color: '#166534' }}>
                      <span className="font-medium">Recommended for this job.</span> The warranty and proper disposal are worth the extra cost.
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
