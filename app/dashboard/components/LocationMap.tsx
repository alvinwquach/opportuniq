"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { IoLocation, IoNavigate, IoReload, IoStorefront, IoConstruct, IoSearch } from "react-icons/io5";
import { cn } from "@/lib/utils";

interface VendorMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  rating?: number;
  specialty?: string;
  type: "vendor";
}

interface StoreMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
  productCount?: number;
  type: "store";
}

type MapMarker = VendorMarker | StoreMarker;

interface LocationMapProps {
  latitude?: number | null;
  longitude?: number | null;
  postalCode?: string | null;
  country?: string;
  className?: string;
  interactive?: boolean;
  showMarker?: boolean;
  zoom?: number;
  userId?: string;
  onLocationSelect?: (coords: { lat: number; lng: number }) => void;
  // New props for enhanced functionality
  searchRadius?: number; // in miles
  showSearchRadius?: boolean;
  vendors?: VendorMarker[];
  stores?: StoreMarker[];
  isNewUser?: boolean;
  emptyStateMessage?: string;
}

// Convert miles to meters for Mapbox
function milesToMeters(miles: number): number {
  return miles * 1609.34;
}

// Create a circle GeoJSON for the search radius
function createCircle(center: [number, number], radiusInMiles: number, points = 64): GeoJSON.Feature<GeoJSON.Polygon> {
  const radiusInKm = radiusInMiles * 1.60934;
  const coords: [number, number][] = [];
  const distanceX = radiusInKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = radiusInKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([center[0] + x, center[1] + y]);
  }
  coords.push(coords[0]); // Close the polygon

  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [coords],
    },
  };
}

export function LocationMap({
  latitude,
  longitude,
  postalCode,
  country = "US",
  className,
  interactive = false,
  showMarker = true,
  zoom = 12,
  userId,
  onLocationSelect,
  searchRadius = 25,
  showSearchRadius = false,
  vendors = [],
  stores = [],
  isNewUser = false,
  emptyStateMessage,
}: LocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const vendorMarkers = useRef<mapboxgl.Marker[]>([]);
  const storeMarkers = useRef<mapboxgl.Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geocodedCoords, setGeocodedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [mapLoaded, setMapLoaded] = useState(false);

  // Trigger server-side geocoding for existing users without coordinates
  useEffect(() => {
    if (latitude && longitude) return;
    if (!postalCode || !userId) return;

    startTransition(async () => {
      try {
        const { geocodeUserLocation } = await import("@/app/dashboard/actions");
        const result = await geocodeUserLocation(userId);

        if (result.success && result.coordinates) {
          setGeocodedCoords({
            lat: result.coordinates.latitude,
            lng: result.coordinates.longitude,
          });
        }
      } catch (err) {
      }
    });
  }, [postalCode, userId, latitude, longitude]);

  const effectiveLat = latitude ?? geocodedCoords?.lat;
  const effectiveLng = longitude ?? geocodedCoords?.lng;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setError("Mapbox token not configured");
      setLoading(false);
      return;
    }

    mapboxgl.accessToken = token;

    const hasValidCoords = effectiveLat && effectiveLng;
    const center: [number, number] = [
      effectiveLng ?? -98.5795,
      effectiveLat ?? 39.8283,
    ];

    // Calculate zoom based on search radius if showing it
    const calculatedZoom = showSearchRadius && hasValidCoords
      ? Math.max(8, 14 - Math.log2(searchRadius / 5))
      : hasValidCoords ? zoom : 4;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: center,
        zoom: calculatedZoom,
        interactive: interactive,
        attributionControl: false,
        ...(!interactive && {
          dragPan: false,
          scrollZoom: false,
          doubleClickZoom: false,
          touchZoomRotate: false,
        }),
      });

      map.current.on("load", () => {
        setLoading(false);
        setMapLoaded(true);

        // Add user location marker
        if (hasValidCoords && showMarker) {
          marker.current = new mapboxgl.Marker({
            color: "#00F0FF",
          })
            .setLngLat([effectiveLng!, effectiveLat!])
            .addTo(map.current!);
        }

        // Add search radius circle
        if (hasValidCoords && showSearchRadius && map.current) {
          const circleData = createCircle([effectiveLng!, effectiveLat!], searchRadius);

          map.current.addSource("search-radius", {
            type: "geojson",
            data: circleData,
          });

          // Add fill layer (subtle)
          map.current.addLayer({
            id: "search-radius-fill",
            type: "fill",
            source: "search-radius",
            paint: {
              "fill-color": "#00F0FF",
              "fill-opacity": 0.05,
            },
          });

          // Add dashed outline
          map.current.addLayer({
            id: "search-radius-outline",
            type: "line",
            source: "search-radius",
            paint: {
              "line-color": "#00F0FF",
              "line-width": 2,
              "line-dasharray": [3, 3],
              "line-opacity": 0.5,
            },
          });
        }
      });

      map.current.on("error", () => {
        setError("Failed to load map");
        setLoading(false);
      });

      if (interactive && onLocationSelect) {
        map.current.on("click", (e) => {
          const { lng, lat } = e.lngLat;
          onLocationSelect({ lat, lng });

          if (marker.current) {
            marker.current.setLngLat([lng, lat]);
          } else {
            marker.current = new mapboxgl.Marker({
              color: "#00F0FF",
            })
              .setLngLat([lng, lat])
              .addTo(map.current!);
          }
        });
      }
    } catch {
      setError("Failed to initialize map");
      setLoading(false);
    }

    return () => {
      vendorMarkers.current.forEach((m) => m.remove());
      storeMarkers.current.forEach((m) => m.remove());
      if (map.current) {
        map.current.remove();
      }
    };
  }, [effectiveLat, effectiveLng, zoom, interactive, showMarker, onLocationSelect, showSearchRadius, searchRadius]);

  // Add vendor markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing vendor markers
    vendorMarkers.current.forEach((m) => m.remove());
    vendorMarkers.current = [];

    vendors.forEach((vendor) => {
      const el = document.createElement("div");
      el.className = "vendor-marker";
      el.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-purple-500 border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div class="p-2 min-w-[150px]">
          <p class="font-medium text-sm text-gray-900">${vendor.name}</p>
          ${vendor.rating ? `<p class="text-xs text-gray-600">★ ${vendor.rating}</p>` : ""}
          ${vendor.specialty ? `<p class="text-xs text-gray-500">${vendor.specialty}</p>` : ""}
        </div>
      `);

      const markerInstance = new mapboxgl.Marker(el)
        .setLngLat([vendor.longitude, vendor.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      vendorMarkers.current.push(markerInstance);
    });
  }, [vendors, mapLoaded]);

  // Add store markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing store markers
    storeMarkers.current.forEach((m) => m.remove());
    storeMarkers.current = [];

    stores.forEach((store) => {
      const el = document.createElement("div");
      el.className = "store-marker";
      el.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-orange-500 border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
            <path d="M2 7h20"/>
          </svg>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div class="p-2 min-w-[120px]">
          <p class="font-medium text-sm text-gray-900">${store.name}</p>
          ${store.distance ? `<p class="text-xs text-gray-600">${store.distance.toFixed(1)} mi away</p>` : ""}
          ${store.productCount ? `<p class="text-xs text-gray-500">${store.productCount} items</p>` : ""}
        </div>
      `);

      const markerInstance = new mapboxgl.Marker(el)
        .setLngLat([store.longitude, store.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      storeMarkers.current.push(markerInstance);
    });
  }, [stores, mapLoaded]);

  // Update marker when coordinates change
  useEffect(() => {
    if (!map.current || !latitude || !longitude) return;

    map.current.flyTo({
      center: [longitude, latitude],
      zoom: zoom,
      duration: 1000,
    });

    if (showMarker) {
      if (marker.current) {
        marker.current.setLngLat([longitude, latitude]);
      } else {
        marker.current = new mapboxgl.Marker({
          color: "#00F0FF",
        })
          .setLngLat([longitude, latitude])
          .addTo(map.current);
      }
    }
  }, [latitude, longitude, zoom, showMarker]);

  if (error) {
    return (
      <div
        className={cn(
          "rounded-lg bg-gray-50 border border-gray-200 flex flex-col items-center justify-center p-6",
          className
        )}
      >
        <IoLocation className="w-8 h-8 text-[#333] mb-2" />
        <p className="text-sm text-gray-400 text-center">{error}</p>
        {postalCode && (
          <p className="text-[11px] text-[#444] mt-1">Location: {postalCode}</p>
        )}
      </div>
    );
  }

  const hasVendorsOrStores = vendors.length > 0 || stores.length > 0;

  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Skeleton placeholder while map initializes - no spinner */}
      {loading && (
        <div className="absolute inset-0 bg-gray-50" />
      )}

      {/* New user empty state overlay */}
      {!loading && isNewUser && !hasVendorsOrStores && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-gray-50/90 backdrop-blur-sm rounded-xl p-4 mx-4 text-center border border-gray-200">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <IoSearch className="w-5 h-5 text-[#00F0FF]" />
            </div>
            <p className="text-sm text-gray-900 font-medium mb-1">
              {searchRadius} mile search radius
            </p>
            <p className="text-xs text-gray-500 max-w-[200px]">
              {emptyStateMessage || "Report an issue to discover nearby contractors & stores"}
            </p>
          </div>
        </div>
      )}

      {/* Location badge */}
      {postalCode && !loading && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded bg-gray-50/80 backdrop-blur-sm border border-gray-200">
          <IoLocation className="w-3 h-3 text-[#00F0FF]" />
          <span className="text-[11px] text-white">{postalCode}</span>
        </div>
      )}

      {/* Legend for markers */}
      {!loading && hasVendorsOrStores && (
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {vendors.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-50/80 backdrop-blur-sm border border-gray-200">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-[10px] text-white">{vendors.length} Vendors</span>
            </div>
          )}
          {stores.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-50/80 backdrop-blur-sm border border-gray-200">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-[10px] text-white">{stores.length} Stores</span>
            </div>
          )}
        </div>
      )}

      {/* Navigate button */}
      {latitude && longitude && !loading && (
        <a
          href={`https://www.google.com/maps?q=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded bg-gray-50/80 backdrop-blur-sm border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <IoNavigate className="w-3 h-3" />
          <span className="text-[11px]">Open</span>
        </a>
      )}
    </div>
  );
}

// Compact version for header/sidebar
export function LocationMapMini({
  latitude,
  longitude,
  postalCode,
}: {
  latitude?: number | null;
  longitude?: number | null;
  postalCode?: string | null;
}) {
  const hasLocation = latitude && longitude;

  if (!hasLocation && !postalCode) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 text-gray-500">
      <IoLocation className="w-3.5 h-3.5 text-[#00F0FF]" />
      <span className="text-[11px]">{postalCode || "Location set"}</span>
    </div>
  );
}
