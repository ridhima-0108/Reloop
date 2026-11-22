"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud, Sparkles, MapPin, Package, ArrowRight,
  Zap, Info, Check, AlertCircle, RefreshCw
} from "lucide-react";
import { analyzeItem, getSampleItems, SampleItem, ItemProfile } from "@/lib/api";
import DemoBadge from "@/components/DemoBadge";

export default function AnalyzePage() {
  const router = useRouter();
  const [samples, setSamples] = useState<SampleItem[]>([]);
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [city, setCity] = useState("Bengaluru");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Editable preliminary profile state
  const [prelimProfile, setPrelimProfile] = useState<ItemProfile | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(true);

  useEffect(() => {
    getSampleItems().then(setSamples).catch(() => {});
  }, []);

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result as string;
        setImagePreview(b64);
        setPrelimProfile(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // One-click Sample selection
  const selectSample = (sample: SampleItem) => {
    setDescription(sample.description);
    setQuantity(sample.quantity);
    setCity(sample.city);
    setImagePreview(sample.image_url);
    setPrelimProfile(sample.expected_profile);
    setErrorMessage(null);
  };

  // Run AI / Heuristic Analysis
  const handleAnalyze = async () => {
    if (!description.trim() && !imagePreview) {
      setErrorMessage("Please enter an item description or upload a photo.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const result = await analyzeItem({
        image_base64: imagePreview || undefined,
        description,
        quantity,
        location_city: city,
        lat: city === "Bengaluru" ? 12.9716 : city === "Delhi NCR" ? 28.6139 : 19.0760,
        lng: city === "Bengaluru" ? 77.5946 : city === "Delhi NCR" ? 77.2090 : 72.8777,
      });

      setPrelimProfile(result.item_profile);
      setIsDemoMode(result.is_demo_mode);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to analyze item. Please check network connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Proceed to Decision Engine Results
  const handleProceedToResults = () => {
    if (!prelimProfile) return;
    // Store in sessionStorage for results page
    sessionStorage.setItem("reloop_current_profile", JSON.stringify(prelimProfile));
    sessionStorage.setItem("reloop_is_demo", JSON.stringify(isDemoMode));
    router.push("/results");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Step 1: Item Inspection & Classification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-earth-900 tracking-tight">
          What item would you like to reloop?
        </h1>
        <p className="text-sm text-earth-600">
          Upload a photo or type a short description. Our AI inspects the material condition and estimates recovery viability.
        </p>
      </div>

      {/* 4 ONE-CLICK DEMO SAMPLES BAR */}
      <div className="bg-white rounded-2xl p-5 border border-earth-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-earth-700 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            1-Click Demo Samples (Instant Test)
          </span>
          <DemoBadge isDemo={true} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {samples.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => selectSample(s)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl border border-earth-200 hover:border-brand-500 hover:bg-brand-50/50 text-left transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-earth-50 border border-earth-200 p-1 shrink-0 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image_url} alt={s.name} className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-earth-900 truncate group-hover:text-brand-700">{s.name}</p>
                <p className="text-[10px] text-earth-500 truncate">{s.city} • Qty {s.quantity}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN FORM */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-2xl p-6 border border-earth-200 shadow-sm space-y-5">
          {/* File Upload Box */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-earth-700 mb-2">
              Item Photo (Optional but recommended)
            </label>
            <div className="relative border-2 border-dashed border-earth-300 hover:border-brand-500 rounded-2xl p-6 text-center transition-colors bg-earth-50/50 hover:bg-white cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-brand-100/70 text-brand-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-xs text-earth-600">
                  <span className="font-bold text-brand-700">Click to upload photo</span> or drag and drop
                </div>
                <p className="text-[10px] text-earth-400">PNG, JPG, WEBP up to 10MB</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-earth-700 mb-2">
              Item Description & Condition Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. OnePlus 9RT with cracked front screen, still powers on. Or: Pack of 4 old cotton t-shirts, 2 wearable, 1 torn."
              className="w-full rounded-xl border border-earth-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-earth-900 bg-white"
            />
          </div>

          {/* Quantity & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-earth-700 mb-2 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-earth-500" /> Quantity / Units
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-xl border border-earth-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-earth-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-earth-700 mb-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-earth-500" /> City / Region
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-earth-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-earth-900 bg-white"
              >
                <option value="Bengaluru">Bengaluru (Electronic City, Indiranagar, HSR)</option>
                <option value="Delhi NCR">Delhi NCR (South Delhi, Noida, Gurugram)</option>
                <option value="Mumbai">Mumbai (Bandra, Dharavi, Andheri, Fort)</option>
              </select>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Analyze CTA */}
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Gemini AI Inspection...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Item Attributes</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Preliminary Profile Preview & Edit (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-earth-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-earth-100 pb-3">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-earth-800">
                AI Classification Preview
              </h3>
              {prelimProfile && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Ready
                </span>
              )}
            </div>

            {/* Visual thumbnail */}
            {imagePreview ? (
              <div className="w-full h-44 rounded-xl overflow-hidden bg-earth-50 border border-earth-200 flex items-center justify-center p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-full h-32 rounded-xl bg-earth-50 border border-earth-200 border-dashed flex flex-col items-center justify-center text-xs text-earth-400">
                <Package className="w-8 h-8 mb-1 opacity-40" />
                <span>No photo uploaded yet</span>
              </div>
            )}

            {/* Profile Confirmation Card */}
            {prelimProfile ? (
              <div className="space-y-3 pt-2">
                {/* Confidence Bar */}
                <div className="bg-earth-50 p-3 rounded-xl border border-earth-200 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-earth-700">AI Confidence Score</span>
                    <span className="font-mono font-bold text-brand-800">
                      {Math.round(prelimProfile.confidence * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-earth-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-500 h-2 rounded-full"
                      style={{ width: `${prelimProfile.confidence * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-earth-500 flex items-center gap-1 pt-0.5">
                    <Info className="w-3 h-3 text-earth-400 shrink-0" />
                    Review and confirm these details before generating ranked routes.
                  </p>
                </div>

                {/* Editable Fields */}
                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="font-bold text-earth-700 block mb-1">Item Category / Title</label>
                    <input
                      type="text"
                      value={prelimProfile.item_type}
                      onChange={(e) => setPrelimProfile({ ...prelimProfile, item_type: e.target.value })}
                      className="w-full rounded-lg border border-earth-300 p-2 font-medium text-earth-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-earth-700 block mb-1">Detected Material Composition</label>
                    <input
                      type="text"
                      value={prelimProfile.material}
                      onChange={(e) => setPrelimProfile({ ...prelimProfile, material: e.target.value })}
                      className="w-full rounded-lg border border-earth-300 p-2 font-medium text-earth-900 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-earth-700 block mb-1">Visible Condition</label>
                      <select
                        value={prelimProfile.condition}
                        onChange={(e) => setPrelimProfile({ ...prelimProfile, condition: e.target.value })}
                        className="w-full rounded-lg border border-earth-300 p-2 font-medium text-earth-900 bg-white"
                      >
                        <option value="broken">Broken (Needs repair)</option>
                        <option value="poor">Poor (Heavy wear)</option>
                        <option value="fair">Fair (Usable with flaws)</option>
                        <option value="good">Good (Clean, working)</option>
                        <option value="like_new">Like New (Mint)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-earth-700 block mb-1">Est. Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={prelimProfile.estimated_weight_kg}
                        onChange={(e) =>
                          setPrelimProfile({
                            ...prelimProfile,
                            estimated_weight_kg: parseFloat(e.target.value) || 0.5,
                          })
                        }
                        className="w-full rounded-lg border border-earth-300 p-2 font-medium text-earth-900 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-earth-700 block mb-1">Condition Notes</label>
                    <textarea
                      rows={2}
                      value={prelimProfile.notes}
                      onChange={(e) => setPrelimProfile({ ...prelimProfile, notes: e.target.value })}
                      className="w-full rounded-lg border border-earth-300 p-2 text-earth-800 bg-white"
                    />
                  </div>
                </div>

                {/* Final Decision Engine Trigger */}
                <button
                  type="button"
                  onClick={handleProceedToResults}
                  className="w-full mt-3 py-3 px-4 rounded-xl bg-earth-900 hover:bg-black text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 group transition-all"
                >
                  <span>Rank Recovery Routes</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="text-center py-6 px-4 space-y-2">
                <p className="text-xs text-earth-500">
                  Select a sample above or enter details and click <strong>&ldquo;Analyze Item Attributes&rdquo;</strong> to generate your item profile.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
