"use client";

import React, { useEffect, useRef } from "react";
import { Partner } from "@/lib/api";

interface MapViewProps {
  partners: Partner[];
  center?: [number, number];
  zoom?: number;
  selectedPartnerId?: string | null;
  onSelectPartner?: (partner: Partner) => void;
}

export default function MapView({
  partners,
  center = [12.9716, 77.5946],
  zoom = 12,
  selectedPartnerId,
  onSelectPartner,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    // Dynamically load Leaflet
    import("leaflet").then((L) => {
      // Fix default Leaflet icon paths in bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      // Initialize map instance if not already initialized
      if (!mapInstanceRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current).setView(center, zoom);
        
        // Use clean OpenStreetMap tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear existing markers
      Object.values(markersRef.current).forEach((m: any) => map.removeLayer(m));
      markersRef.current = {};

      const markerBounds = L.latLngBounds([]);

      // Custom marker colors by partner type
      const getMarkerColor = (type: string) => {
        switch (type) {
          case "kabadiwala": return "#16a34a"; // green
          case "ewaste_recycler": return "#2563eb"; // blue
          case "repair_shop": return "#d97706"; // amber
          case "textile_collector": return "#9333ea"; // purple
          case "composter": return "#65a30d"; // lime
          case "resale_buyer": return "#0891b2"; // cyan
          default: return "#475569";
        }
      };

      partners.forEach((partner) => {
        if (!partner.lat || !partner.lng) return;

        const isSelected = selectedPartnerId === partner.id;
        const color = getMarkerColor(partner.type);
        const size = isSelected ? 34 : 26;

        const customIcon = L.divIcon({
          className: "custom-map-pin",
          html: `
            <div style="
              width: ${size}px;
              height: ${size}px;
              background-color: ${color};
              border: ${isSelected ? "3px solid #000" : "2px solid #fff"};
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 4px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <div style="
                width: 8px;
                height: 8px;
                background-color: #fff;
                border-radius: 50%;
                transform: rotate(45deg);
              "></div>
            </div>
          `,
          iconSize: [size, size],
          iconAnchor: [size / 2, size],
          popupAnchor: [0, -size],
        });

        const marker = L.marker([partner.lat, partner.lng], { icon: customIcon }).addTo(map);

        const materialsHtml = partner.accepted_materials
          .slice(0, 4)
          .map((m) => `<span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-right: 4px; display: inline-block;">${m}</span>`)
          .join("");

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; font-size: 12px; max-width: 220px; line-height: 1.4;">
            <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 2px;">${partner.name}</div>
            <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">${partner.address}</div>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <span style="background: #ecfdf5; color: #065f46; font-weight: bold; padding: 1px 6px; border-radius: 4px; font-size: 11px;">★ ${partner.rating} (${partner.reviews_count})</span>
              <span style="color: #059669; font-size: 11px; font-weight: 600;">${partner.pickup_available ? "✓ Doorstep Pickup" : "Drop-off Only"}</span>
            </div>
            <div style="margin-bottom: 6px;">${materialsHtml}</div>
            <div style="color: #475569; font-size: 11px; font-weight: 500;">Pricing: ${partner.price_expectation}</div>
            <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0; font-weight: bold; color: #16a34a;">
              📞 ${partner.phone}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on("click", () => {
          if (onSelectPartner) onSelectPartner(partner);
        });

        markersRef.current[partner.id] = marker;
        markerBounds.extend([partner.lat, partner.lng]);
      });

      // Adjust map view to fit markers if there are partners
      if (partners.length > 0 && markerBounds.isValid()) {
        map.fitBounds(markerBounds, { padding: [40, 40], maxZoom: 14 });
      }
    });

    return () => {
      // clean up if component unmounts
    };
  }, [partners, selectedPartnerId, center, zoom, onSelectPartner]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden shadow-inner border border-earth-200">
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-sm p-2.5 rounded-xl shadow-md border border-earth-200 text-[11px] space-y-1">
        <span className="font-bold text-earth-800 uppercase tracking-wider block mb-1">Partner Types</span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"/> Kabadiwala</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"/> E-Waste Recycler</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"/> Repair Shop</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"/> Textile NGO</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-lime-600 inline-block"/> Composter</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-600 inline-block"/> Resale Buyer</span>
        </div>
      </div>
    </div>
  );
}
