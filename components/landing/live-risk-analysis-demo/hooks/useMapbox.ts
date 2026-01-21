import { useEffect, useRef, useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { DemoScenario } from "../types";

interface UseMapboxOptions {
  scenario: DemoScenario;
  isVisible: boolean;
  mounted: boolean;
}

export function useMapbox({ scenario, isVisible, mounted }: UseMapboxOptions) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  const updateMapMarkers = useCallback(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const mainMarker = new mapboxgl.Marker({ color: "#14b8a6" })
      .setLngLat([scenario.location.lng, scenario.location.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${scenario.title}</strong><br/>${scenario.location.name}`))
      .addTo(mapRef.current);
    markersRef.current.push(mainMarker);

    scenario.toolsNearby.forEach((store) => {
      const el = document.createElement("div");
      el.className = "store-marker";
      el.innerHTML = `<div style="background: #3b82f6; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M3 9h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path d="M3 9l2.45-4.9A2 2 0 017.24 3h9.52a2 2 0 011.8 1.1L21 9"/></svg></div>`;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([store.lng, store.lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<strong>${store.storeName}</strong><br/>${store.distance} mi away<br/><em>${store.tools.slice(0, 3).join(", ")}</em>`
          )
        )
        .addTo(mapRef.current!);
      markersRef.current.push(marker);
    });
  }, [scenario]);

  // Initialize Mapbox when location card becomes visible
  useEffect(() => {
    if (!mapContainerRef.current || !mounted || !isVisible) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.warn("Mapbox token not configured");
      return;
    }

    if (mapRef.current) return; // Already initialized

    mapboxgl.accessToken = token;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [scenario.location.lng, scenario.location.lat],
      zoom: 13,
      interactive: true,
      attributionControl: false,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    mapRef.current.on("load", () => {
      setMapLoaded(true);
      updateMapMarkers();
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mounted, isVisible, scenario.location.lat, scenario.location.lng, updateMapMarkers]);

  // Update map when scenario changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    mapRef.current.flyTo({
      center: [scenario.location.lng, scenario.location.lat],
      zoom: 13,
      duration: 1500,
    });

    updateMapMarkers();
  }, [scenario, mapLoaded, updateMapMarkers]);

  const resetMap = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      setMapLoaded(false);
    }
  }, []);

  return {
    mapContainerRef,
    mapLoaded,
    resetMap,
  };
}
