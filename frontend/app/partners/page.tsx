"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin, Phone, Star, ShieldCheck, Filter, Search,
  Recycle, Wrench, CheckCircle, Clock, Truck, ChevronRight
} from "lucide-react";
import { getPartners, Partner } from "@/lib/api";
import MapView from "@/components/MapView";
import Link from "next/link";

export default function PartnersDirectoryPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [materialFilter, setMaterialFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await getPartners({
          city: cityFilter,
          type: typeFilter,
          material: materialFilter,
        });
        setPartners(list);
        if (list.length > 0) {
          setSelectedPartner(list[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [cityFilter, typeFilter, materialFilter]);

  // Client-side text query search
  const filteredPartners = partners.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.accepted_materials.some((m) => m.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-earth-200 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
            Verified Partner Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-earth-900 mt-1">
            Neighborhood Circular Recovery Network
          </h1>
          <p className="text-sm text-earth-600 mt-0.5">
            Explore 31+ verified kabadiwalas, repair clinics, e-waste dismantlers, textile NGOs, and compost hubs.
          </p>
        </div>
        <Link
          href="/analyze"
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow transition-all self-start md:self-auto"
        >
          Inspect New Item +
        </Link>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-2xl p-4 border border-earth-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* City Filter */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-earth-500 block mb-1">
            City / Region
          </label>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full text-xs font-semibold p-2.5 rounded-xl border border-earth-300 bg-white text-earth-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Cities (Bengaluru, Delhi, Mumbai)</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Delhi NCR">Delhi NCR</option>
            <option value="Mumbai">Mumbai</option>
          </select>
        </div>

        {/* Partner Type */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-earth-500 block mb-1">
            Partner Specialty
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full text-xs font-semibold p-2.5 rounded-xl border border-earth-300 bg-white text-earth-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Categories</option>
            <option value="kabadiwala">Kabadiwala (Dry Scrap)</option>
            <option value="ewaste_recycler">E-Waste Recycler</option>
            <option value="repair_shop">Repair Shop</option>
            <option value="textile_collector">Textile Collector / NGO</option>
            <option value="composter">Composter & Biomethanation</option>
            <option value="resale_buyer">Resale Buyer</option>
          </select>
        </div>

        {/* Accepted Material */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-earth-500 block mb-1">
            Accepted Material
          </label>
          <select
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="w-full text-xs font-semibold p-2.5 rounded-xl border border-earth-300 bg-white text-earth-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">Any Material</option>
            <option value="cardboard">Cardboard & Paper</option>
            <option value="plastic">Plastics (PET, HDPE)</option>
            <option value="smartphones">Smartphones & Electronics</option>
            <option value="clothes">Textiles & Garments</option>
            <option value="metal">Metals (Copper, Aluminum, Iron)</option>
            <option value="vegetable">Vegetable / Wet Waste</option>
          </select>
        </div>

        {/* Search Input */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-earth-500 block mb-1">
            Search by Name or Area
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-earth-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="e.g. Koramangala, ScrapUncle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium pl-8 pr-3 py-2.5 rounded-xl border border-earth-300 text-earth-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {/* MAP + LIST SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Map (7 cols) */}
        <div className="lg:col-span-7 h-[560px] sticky top-24">
          <MapView
            partners={filteredPartners}
            selectedPartnerId={selectedPartner?.id}
            onSelectPartner={setSelectedPartner}
            center={
              cityFilter === "Delhi NCR"
                ? [28.6139, 77.2090]
                : cityFilter === "Mumbai"
                ? [19.0760, 72.8777]
                : [12.9716, 77.5946]
            }
          />
        </div>

        {/* Partner Cards Grid (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5 max-h-[560px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs text-earth-500 font-medium px-1">
            <span>Showing {filteredPartners.length} partners</span>
            <span>Sorted by verified status</span>
          </div>

          {filteredPartners.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-xs text-earth-500 border border-earth-200">
              No partners match current filter criteria. Try selecting &ldquo;All Cities&rdquo;.
            </div>
          ) : (
            filteredPartners.map((partner) => {
              const isSelected = selectedPartner?.id === partner.id;
              return (
                <div
                  key={partner.id}
                  onClick={() => setSelectedPartner(partner)}
                  className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer ${
                    isSelected
                      ? "border-brand-500 ring-2 ring-brand-500/30 shadow-md"
                      : "border-earth-200 hover:border-earth-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                          {partner.type.replace("_", " ")}
                        </span>
                        {partner.verified && (
                          <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-sm text-earth-900 mt-1">{partner.name}</h3>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 font-bold text-xs bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {partner.rating}
                      </span>
                      <p className="text-[10px] text-earth-400 mt-0.5">{partner.reviews_count} reviews</p>
                    </div>
                  </div>

                  <p className="text-xs text-earth-500 mt-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-earth-400 shrink-0" /> {partner.address}
                  </p>

                  {/* Accepted Materials tags */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {partner.accepted_materials.slice(0, 5).map((mat) => (
                      <span
                        key={mat}
                        className="text-[10px] font-medium bg-earth-100 text-earth-700 px-2 py-0.5 rounded"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>

                  {/* Pricing and Logistics */}
                  <div className="mt-3 pt-2.5 border-t border-earth-100 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      {partner.pickup_available ? "Doorstep Pickup Available" : "Drop-off Station"}
                    </span>
                    <a
                      href={`tel:${partner.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> {partner.phone}
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
