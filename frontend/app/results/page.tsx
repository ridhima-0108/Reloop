"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, CheckCircle2, ArrowRight, MapPin, DollarSign, Leaf,
  Wrench, Recycle, Heart, HelpCircle, ShieldCheck, Calendar, Phone,
  ChevronRight, RefreshCw, AlertCircle, ShoppingBag, ArrowLeft
} from "lucide-react";
import {
  ItemProfile, RouteRecommendation, RecommendationResponse, Partner,
  getRecommendations, getPartners, createBooking, getSampleItems, createMarketplaceListing
} from "@/lib/api";
import DemoBadge from "@/components/DemoBadge";
import ScoreBreakdownModal from "@/components/ScoreBreakdownModal";
import MapView from "@/components/MapView";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ItemProfile | null>(null);
  const [recResponse, setRecResponse] = useState<RecommendationResponse | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  // Selected route for active inspection
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);

  // Score breakdown modal
  const [auditModalRec, setAuditModalRec] = useState<RouteRecommendation | null>(null);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingAddress, setBookingAddress] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Listing creation state
  const [listingSuccess, setListingSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        let loadedProfile: ItemProfile | null = null;
        const sampleId = searchParams.get("sample");

        if (sampleId) {
          const sampleList = await getSampleItems();
          const match = sampleList.find((s) => s.id === sampleId);
          if (match) {
            loadedProfile = match.expected_profile;
          }
        }

        if (!loadedProfile && typeof window !== "undefined") {
          const stored = sessionStorage.getItem("reloop_current_profile");
          if (stored) {
            loadedProfile = JSON.parse(stored);
          }
        }

        // Fallback default if user directly hits /results
        if (!loadedProfile) {
          loadedProfile = {
            item_type: "Smartphone (Cracked Screen)",
            material: "Gorilla Glass, Aluminum Alloy, Lithium-Ion",
            condition: "broken",
            quantity: 1,
            confidence: 0.94,
            recyclable: true,
            notes: "Screen glass cracked after drop, touch and camera functional.",
            estimated_weight_kg: 0.22,
            city: "Bengaluru",
            lat: 12.9716,
            lng: 77.5946,
          };
        }

        setProfile(loadedProfile);

        // Run Decision Engine
        const recs = await getRecommendations(loadedProfile);
        setRecResponse(recs);

        // Fetch nearby matching partners
        const partnerList = await getPartners({
          city: loadedProfile.city,
          lat: loadedProfile.lat,
          lng: loadedProfile.lng,
        });
        setPartners(partnerList);
        if (partnerList.length > 0) {
          setSelectedPartner(partnerList[0]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to compute decision recommendations.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [searchParams]);

  const activeRec = recResponse?.recommendations[activeRouteIndex];

  // Booking submit handler
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !activeRec) return;

    setBookingSubmitting(true);
    try {
      await createBooking({
        user_name: bookingName || "Demo User",
        user_phone: bookingPhone || "+91 98765 00000",
        user_address: bookingAddress || `${profile.city} Central Hub`,
        item_type: profile.item_type,
        material: profile.material,
        condition: profile.condition,
        quantity: profile.quantity,
        route: activeRec.route,
        partner_id: selectedPartner?.id,
        partner_name: selectedPartner?.name,
        estimated_weight_kg: profile.estimated_weight_kg * profile.quantity,
        co2_saved_kg: activeRec.co2_saved_kg,
        notes: `Booked via RELOOP. Indicative payout: ${activeRec.price_range_inr}`,
      });
      setBookingSuccess(true);
      setTimeout(() => {
        router.push("/tracking");
      }, 1800);
    } catch (err) {
      alert("Failed to create recovery request. Please try again.");
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Create Marketplace Listing handler
  const handleCreateListing = async () => {
    if (!profile || !activeRec) return;
    try {
      await createMarketplaceListing({
        title: profile.item_type,
        description: profile.notes || `${profile.material} in ${profile.condition} condition.`,
        category: "Electronics",
        condition: profile.condition,
        price_inr: activeRec.indicative_value_inr || 500,
        location: profile.city,
        image_url: profile.image_preview || "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
        seller_name: "Verified Relooper",
        seller_contact: "+91 98450 11223",
      });
      setListingSuccess(true);
      setTimeout(() => {
        router.push("/marketplace");
      }, 1500);
    } catch (err) {
      alert("Failed to create marketplace listing.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center space-y-4">
        <RefreshCw className="w-10 h-10 animate-spin text-brand-600 mx-auto" />
        <h2 className="text-xl font-bold text-earth-800">Calculating Multi-Criteria Decision Model...</h2>
        <p className="text-xs text-earth-500 max-w-md mx-auto">
          Comparing resale value, repair feasibility, verified partner coordinates in {profile?.city || "your city"}, and carbon savings.
        </p>
      </div>
    );
  }

  if (error || !recResponse || !profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-xl font-bold text-earth-900">Analysis Error</h2>
        <p className="text-sm text-earth-600">{error || "Could not retrieve recommendations."}</p>
        <Link href="/analyze" className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm">
          Try Again
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-earth-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/analyze" className="text-xs font-semibold text-earth-500 hover:text-earth-800 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Analyze
            </Link>
            <span className="text-earth-300">•</span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Decision Engine Output</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-earth-900 mt-1">
            Recovery Options for <span className="text-brand-700">{profile.item_type}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <DemoBadge isDemo={recResponse.is_demo_mode} />
        </div>
      </div>

      {/* Summary Alert */}
      <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-brand-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-brand-900 leading-relaxed">
          <span className="font-extrabold">Executive Summary: </span>
          {recResponse.summary_explanation}
        </div>
      </div>

      {/* ITEM PROFILE CARD (Editable Overview) */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-earth-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {profile.image_preview ? (
            <div className="w-20 h-20 rounded-xl bg-earth-50 border border-earth-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile.image_preview} alt={profile.item_type} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 font-bold flex items-center justify-center shrink-0">
              <Recycle className="w-8 h-8" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-earth-100 text-earth-700">
                Condition: {profile.condition}
              </span>
              <span className="text-xs font-semibold text-earth-500">
                Qty: {profile.quantity} ({profile.estimated_weight_kg * profile.quantity} kg)
              </span>
              <span className="text-xs font-bold text-brand-700">
                {Math.round(profile.confidence * 100)}% Confidence
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-earth-900 mt-1">{profile.item_type}</h2>
            <p className="text-xs text-earth-500 mt-0.5">
              Material: <strong className="text-earth-700">{profile.material}</strong> • Location: <strong className="text-earth-700">{profile.city}</strong>
            </p>
          </div>
        </div>

        <Link
          href="/analyze"
          className="text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition-colors shrink-0"
        >
          Edit Item Attributes ✎
        </Link>
      </div>

      {/* ROUTE COMPARISON CARDS / GRID (The core differentiator!) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-extrabold text-earth-900 flex items-center gap-2">
            <span>Ranked Recovery Routes</span>
            <span className="text-xs font-normal text-earth-500">(Click any route to view details)</span>
          </h3>
          <span className="text-xs text-earth-400 font-medium">Scored out of 100 points</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {recResponse.recommendations.map((rec, index) => {
            const isSelected = activeRouteIndex === index;
            const isWinner = rec.rank === 1;

            return (
              <button
                key={rec.route}
                onClick={() => setActiveRouteIndex(index)}
                className={`text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between relative ${
                  isSelected
                    ? "bg-brand-50/70 border-brand-500 ring-2 ring-brand-500/30 shadow-md"
                    : "bg-white border-earth-200 hover:border-earth-400 hover:shadow-sm"
                }`}
              >
                {isWinner && (
                  <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-brand-600 text-white font-extrabold text-[9px] uppercase tracking-wider shadow">
                    ★ Best
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-earth-400 uppercase">
                      #{rec.rank}
                    </span>
                    <span
                      className={`text-xs font-extrabold font-mono px-1.5 py-0.5 rounded ${
                        rec.score >= 80
                          ? "bg-emerald-100 text-emerald-800"
                          : rec.score >= 60
                          ? "bg-amber-100 text-amber-800"
                          : "bg-earth-100 text-earth-600"
                      }`}
                    >
                      {rec.score}/100
                    </span>
                  </div>
                  <h4 className="font-extrabold text-xs text-earth-900 leading-tight">{rec.title}</h4>
                </div>

                <div className="mt-3 pt-2 border-t border-earth-100/80 space-y-1">
                  <p className="text-[10px] text-earth-500 truncate" title={rec.price_range_inr}>
                    {rec.price_range_inr}
                  </p>
                  <p className="text-[10px] text-teal-700 font-semibold">
                    {rec.co2_saved_kg} kg CO2
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECTED ROUTE DEEP DIVE SECTION */}
      {activeRec && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Route Details, Why, Instructions & Pricing (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-earth-200 shadow-sm space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-earth-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
                    Rank #{activeRec.rank} Recovery Route
                  </span>
                  {activeRec.is_recommended && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> AI Recommended
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-earth-900 mt-1">{activeRec.title}</h3>
              </div>

              {/* View Transparent Audit Button */}
              <button
                onClick={() => setAuditModalRec(activeRec)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-300 bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold transition-colors shrink-0"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why {activeRec.score}/100? Audit Score</span>
              </button>
            </div>

            {/* Why This Route */}
            <div className="bg-earth-50 p-4 rounded-2xl border border-earth-200 space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-earth-700">Rationale & Market Dynamics</h4>
              <p className="text-sm text-earth-800 leading-relaxed">{activeRec.why}</p>
            </div>

            {/* Indicative Value & Carbon Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-earth-200 bg-emerald-50/50 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Indicative Value / Cost
                </span>
                <p className="text-xl font-black text-emerald-900">{activeRec.price_range_inr}</p>
                <p className="text-[11px] text-emerald-700">
                  *Labelled as indicative. Real quotes confirmed upon partner inspection.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-earth-200 bg-teal-50/50 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-teal-600" /> Carbon Avoidance
                </span>
                <p className="text-xl font-black text-teal-900">{activeRec.co2_saved_kg} kg CO2e</p>
                <p className="text-[11px] text-teal-700">
                  Equivalent to keeping a passenger car off the road for {Math.round(activeRec.co2_saved_kg * 4)} km.
                </p>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-earth-800">
                Actionable Step-by-Step Checklist
              </h4>
              <div className="space-y-2.5">
                {activeRec.instructions.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-earth-50 border border-earth-100 text-xs text-earth-800">
                    <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-4 border-t border-earth-100 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setIsBookingOpen(true)}
                className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 group transition-all"
              >
                <span>Book Pickup / Drop-off</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {activeRec.route === "resell" && (
                <button
                  onClick={handleCreateListing}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-xl border border-earth-300 hover:bg-earth-50 text-earth-800 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-brand-600" />
                  <span>List on Marketplace</span>
                </button>
              )}
            </div>

            {listingSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                ✓ Listing successfully published to RELOOP Marketplace! Redirecting...
              </div>
            )}
          </div>

          {/* Right Column: Local Matching Partners Map & List (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-earth-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-earth-900">
                    Matching Partners in {profile.city}
                  </h3>
                  <p className="text-[11px] text-earth-500">
                    {partners.length} verified collectors ready for intake
                  </p>
                </div>
                <Link href="/partners" className="text-xs font-bold text-brand-700 hover:underline">
                  View All →
                </Link>
              </div>

              {/* Map Component */}
              <div className="h-64 w-full">
                <MapView
                  partners={partners}
                  center={[profile.lat || 12.9716, profile.lng || 77.5946]}
                  selectedPartnerId={selectedPartner?.id}
                  onSelectPartner={setSelectedPartner}
                />
              </div>

              {/* Partner List Mini Cards */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {partners.slice(0, 4).map((p) => {
                  const isSelected = selectedPartner?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPartner(p)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? "bg-brand-50 border-brand-500 ring-1 ring-brand-500"
                          : "bg-earth-50 border-earth-200 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-earth-900">
                        <span className="truncate">{p.name}</span>
                        <span className="text-brand-700 text-[11px] shrink-0 font-mono">
                          {p.distance_km} km
                        </span>
                      </div>
                      <p className="text-[11px] text-earth-500 truncate mt-0.5">{p.address}</p>
                      <div className="flex items-center justify-between text-[10px] text-earth-600 mt-2">
                        <span>★ {p.rating} ({p.reviews_count})</span>
                        <span className="font-semibold text-emerald-700">
                          {p.pickup_available ? "✓ Doorstep Pickup" : "Drop-off"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transparent Score Breakdown Audit Modal */}
      <ScoreBreakdownModal
        recommendation={auditModalRec}
        onClose={() => setAuditModalRec(null)}
      />

      {/* BOOKING PICKUP MODAL */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-earth-200 space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Schedule Recovery</span>
              <h3 className="text-xl font-extrabold text-earth-900 mt-0.5">
                Confirm Handoff with {selectedPartner?.name || "Verified Collector"}
              </h3>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-bold text-earth-900 text-lg">Booking Confirmed!</h4>
                <p className="text-xs text-earth-600">Redirecting to status tracker...</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-earth-700 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full rounded-xl border border-earth-300 p-2.5 text-earth-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-earth-700 block mb-1">Contact Phone (for Driver WhatsApp / Call)</label>
                  <input
                    type="tel"
                    required
                    value={bookingPhone}
                    onChange={(e) => setBookingPhone(e.target.value)}
                    placeholder="+91 98450 00000"
                    className="w-full rounded-xl border border-earth-300 p-2.5 text-earth-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-earth-700 block mb-1">Pickup Address & Landmark</label>
                  <textarea
                    rows={2}
                    required
                    value={bookingAddress}
                    onChange={(e) => setBookingAddress(e.target.value)}
                    placeholder="Apartment name, street, neighborhood..."
                    className="w-full rounded-xl border border-earth-300 p-2.5 text-earth-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="bg-earth-50 p-3 rounded-xl border border-earth-200 space-y-1">
                  <div className="flex justify-between font-bold text-earth-800">
                    <span>Selected Route:</span>
                    <span className="text-brand-700">{activeRec?.title}</span>
                  </div>
                  <div className="flex justify-between text-earth-600">
                    <span>Est. Payout/Terms:</span>
                    <span>{activeRec?.price_range_inr}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(false)}
                    className="px-4 py-2 rounded-xl text-earth-600 font-semibold hover:bg-earth-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow transition-all disabled:opacity-50"
                  >
                    {bookingSubmitting ? "Confirming..." : "Confirm Handoff"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-earth-500">Loading recommendations...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
