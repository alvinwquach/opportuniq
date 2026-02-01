"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface OnboardingMapProps {
  postalCode: string;
  country: string;
  searchRadius: number;
  /** Pre-geocoded coords - when switching steps, avoids re-fetch and prevents map jumping to country center */
  initialCoords?: { lat: number; lng: number } | null;
  initialLocationInfo?: { city: string; region?: string; countryName?: string } | null;
  onGeocodeSuccess?: (coords: { lat: number; lng: number }, locationInfo: { city: string; region?: string; countryName?: string }) => void;
}

// Default country centers
const COUNTRY_CENTERS: Record<string, [number, number]> = {
  US: [-98.5795, 39.8283],
  CA: [-106.3468, 56.1304],
  GB: [-3.436, 55.3781],
  AU: [133.7751, -25.2744],
  DE: [10.4515, 51.1657],
  FR: [2.2137, 46.2276],
  ES: [-3.7492, 40.4637],
  IT: [12.5674, 41.8719],
  NL: [5.2913, 52.1326],
  JP: [138.2529, 36.2048],
  MX: [-102.5528, 23.6345],
  BR: [-51.9253, -14.235],
  IN: [78.9629, 20.5937],
};

export function OnboardingMap({
  postalCode,
  country,
  searchRadius,
  initialCoords,
  initialLocationInfo,
  onGeocodeSuccess,
}: OnboardingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationInfo, setLocationInfo] = useState<{ city: string; region: string; countryName: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const geocodeTimeout = useRef<NodeJS.Timeout | null>(null);

  // For CSS gradient overlay positioning
  const [gradientStyle, setGradientStyle] = useState<{
    left: number;
    top: number;
    size: number;
  } | null>(null);

  // Update gradient overlay position when map moves or zooms
  const updateGradientPosition = useCallback(() => {
    if (!map.current || !coords) {
      setGradientStyle(null);
      return;
    }

    const point = map.current.project([coords.lng, coords.lat]);

    // Calculate radius in pixels based on zoom level
    // At zoom 0, 1 degree ≈ 111km. Each zoom level doubles the pixels per degree.
    const metersPerPixel = 156543.03392 * Math.cos(coords.lat * Math.PI / 180) / Math.pow(2, map.current.getZoom());
    const radiusInMeters = searchRadius * 1609.34; // miles to meters
    const radiusInPixels = radiusInMeters / metersPerPixel;

    setGradientStyle({
      left: point.x,
      top: point.y,
      size: radiusInPixels * 2,
    });
  }, [coords, searchRadius]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    mapboxgl.accessToken = token;

    const defaultCenter = COUNTRY_CENTERS[country] || COUNTRY_CENTERS.US;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: defaultCenter,
      zoom: 3,
      interactive: true,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) map.current.remove();
      map.current = null;
      setMapLoaded(false);
    };
  }, []);

  // Resize map when container becomes visible or changes size
  // (Mapbox doesn't auto-resize when parent goes from display:none to visible)
  useEffect(() => {
    const container = mapContainer.current;
    const mapInstance = map.current;
    if (!container || !mapInstance) return;

    const resizeMap = () => {
      if (container.offsetWidth > 0 && container.offsetHeight > 0) {
        mapInstance.resize();
      }
    };

    const observer = new ResizeObserver(resizeMap);
    observer.observe(container);

    // Initial resize in case we're already visible
    resizeMap();

    return () => observer.disconnect();
  }, [mapLoaded]);

  // Update map center when country changes (only when no postal code is entered)
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    // Don't fly to country center if we have coords or a postal code entered
    if (initialCoords || coords || (postalCode && postalCode.length >= 3)) return;
    const center = COUNTRY_CENTERS[country] || COUNTRY_CENTERS.US;
    map.current.flyTo({ center, zoom: 3, duration: 1000 });
  }, [country, initialCoords, coords, postalCode, mapLoaded]);

  // Geocode postal code with debounce
  useEffect(() => {
    if (geocodeTimeout.current) {
      clearTimeout(geocodeTimeout.current);
    }

    if (!postalCode || postalCode.length < 3 || !mapLoaded) {
      if (!postalCode || postalCode.length < 3) {
        setCoords(null);
        setLocationInfo(null);
        if (marker.current) {
          marker.current.remove();
          marker.current = null;
        }
        setGradientStyle(null);
      }
      return;
    }

    // Use initialCoords when provided (e.g. when switching to Radius step) - no fetch, no flash
    if (initialCoords) {
      setCoords(initialCoords);
      setLocationInfo(
        initialLocationInfo || {
          city: postalCode,
          region: "",
          countryName: country,
        }
      );
      const zoom = Math.min(11, Math.max(6, 9.5 - Math.log2(searchRadius / 15)));
      map.current?.jumpTo({ center: [initialCoords.lng, initialCoords.lat], zoom });
      if (marker.current) {
        marker.current.setLngLat([initialCoords.lng, initialCoords.lat]);
      } else if (map.current) {
        marker.current = new mapboxgl.Marker({ color: "#5eead4" })
          .setLngLat([initialCoords.lng, initialCoords.lat])
          .addTo(map.current);
      }
      updateGradientPosition();
      return;
    }

    setIsLoading(true);

    geocodeTimeout.current = setTimeout(async () => {
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token || !map.current) return;

        // Use country code for more accurate results
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(postalCode)}.json?access_token=${token}&types=postcode&country=${country.toLowerCase()}&limit=1`
        );

        if (!response.ok) throw new Error("Geocoding failed");

        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const [lng, lat] = feature.center;
          setCoords({ lat, lng });

          // Extract location info from context
          const context = feature.context || [];
          const cityContext = context.find((c: { id: string }) => c.id.startsWith("place."));
          const regionContext = context.find((c: { id: string }) => c.id.startsWith("region."));
          const countryContext = context.find((c: { id: string }) => c.id.startsWith("country."));

          const city = cityContext?.text || feature.text || postalCode;
          // Extract state/region code (e.g., "US-CA" -> "CA", or just use the text like "California")
          let region = "";
          if (regionContext?.short_code) {
            // short_code is like "US-CA", extract just "CA"
            const parts = regionContext.short_code.split("-");
            region = parts.length > 1 ? parts[1].toUpperCase() : parts[0].toUpperCase();
          } else if (regionContext?.text) {
            region = regionContext.text;
          }
          const countryName = countryContext?.text || country;

          setLocationInfo({ city, region, countryName });
          onGeocodeSuccess?.({ lat, lng }, { city, region, countryName });

          // Calculate zoom based on search radius (zoomed out a bit more for context)
          // For 25 miles, we want zoom ~8; for 5 miles, zoom ~10; for 100 miles, zoom ~6
          const zoom = Math.min(11, Math.max(6, 9.5 - Math.log2(searchRadius / 15)));

          // Use jumpTo first to ensure position, then the marker/circle will be visible
          map.current.jumpTo({
            center: [lng, lat],
            zoom,
          });

          // Add or update marker
          if (marker.current) {
            marker.current.setLngLat([lng, lat]);
          } else {
            marker.current = new mapboxgl.Marker({ color: "#5eead4" })
              .setLngLat([lng, lat])
              .addTo(map.current);
          }

          // Update gradient position
          updateGradientPosition();
        } else {
          setCoords(null);
          setLocationInfo(null);
        }
      } catch (err) {
        console.error("Geocoding error:", err);
        setCoords(null);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => {
      if (geocodeTimeout.current) {
        clearTimeout(geocodeTimeout.current);
      }
    };
  }, [postalCode, country, mapLoaded, initialCoords, initialLocationInfo, searchRadius]);

  // Update gradient when searchRadius changes
  useEffect(() => {
    if (!map.current || !coords || !mapLoaded) return;

    updateGradientPosition();

    // Adjust zoom for new radius
    const zoom = Math.min(11, Math.max(6, 9.5 - Math.log2(searchRadius / 15)));
    map.current.flyTo({ zoom, duration: 500 });
  }, [searchRadius, coords, mapLoaded, updateGradientPosition]);

  // Listen to map move/zoom events to update gradient position
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const handleMove = () => updateGradientPosition();

    map.current.on("move", handleMove);
    map.current.on("zoom", handleMove);
    map.current.on("moveend", handleMove);

    return () => {
      if (map.current) {
        map.current.off("move", handleMove);
        map.current.off("zoom", handleMove);
        map.current.off("moveend", handleMove);
      }
    };
  }, [mapLoaded, updateGradientPosition]);

  const handleZoomIn = () => {
    if (map.current) {
      map.current.zoomIn({ duration: 300 });
    }
  };

  const handleZoomOut = () => {
    if (map.current) {
      map.current.zoomOut({ duration: 300 });
    }
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/[0.06]">
      <div ref={mapContainer} className="w-full h-full" />

      {/* CSS Radial Gradient Overlay */}
      {gradientStyle && (
        <div
          className="absolute pointer-events-none rounded-full border-2 border-teal-400/50 bg-radial-[at_center] from-teal-400/25 via-teal-400/10 to-transparent"
          style={{
            left: gradientStyle.left - gradientStyle.size / 2,
            top: gradientStyle.top - gradientStyle.size / 2,
            width: gradientStyle.size,
            height: gradientStyle.size,
          }}
        />
      )}

      {/* Zoom controls */}
      <div className="absolute top-20 left-4 flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 text-white hover:bg-black/90 transition-colors flex items-center justify-center"
          aria-label="Zoom in"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 text-white hover:bg-black/90 transition-colors flex items-center justify-center"
          aria-label="Zoom out"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
            <span className="text-xs text-white/60">Finding location...</span>
          </div>
        </div>
      )}

      {/* Location info overlay - bottom card */}
      {coords && !isLoading && locationInfo && (
        <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/80 backdrop-blur-sm border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-white">
                {locationInfo.city}{locationInfo.region ? `, ${locationInfo.region}` : ""}
              </p>
              <p className="text-sm text-white/50">
                {postalCode}, {locationInfo.countryName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-teal-400">{searchRadius}</p>
              <p className="text-xs text-white/50">mile radius</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!coords && !isLoading && postalCode.length < 3 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6">
            <p className="text-white/30 text-sm">Enter your postal code to see the map</p>
          </div>
        </div>
      )}
    </div>
  );
}
