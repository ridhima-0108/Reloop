"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight, Sparkles, Recycle, ShieldCheck, MapPin,
  TrendingUp, Leaf, CheckCircle2, DollarSign, Wrench, Package,
  Zap, ArrowUpRight
} from "lucide-react";
import { getSampleItems, SampleItem } from "@/lib/api";

export default function LandingPage() {
  const [samples, setSamples] = useState<SampleItem[]>([]);

  useEffect(() => {
    getSampleItems().then(setSamples).catch(() => {});
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 bg-gradient-to-b from-brand-50/60 via-[#fafaf9] to-[#fafaf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100/80 border border-brand-200 text-brand-900 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Next-Generation Circular Economy Engine</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-earth-900 tracking-tight leading-[1.15]">
              Don&apos;t just identify waste.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-700 via-brand-600 to-teal-600">
                Decide the best next life.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-earth-600 max-w-2xl mx-auto font-normal leading-relaxed">
              RELOOP compares recovery routes—<strong>Repair, Reuse, Resell, Donate, Compost, or Recycle</strong>—ranks them
              by true economic value and local availability, and connects you directly with verified neighborhood collectors.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/analyze"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 group transition-all"
              >
                <span>Analyze an Item Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/partners"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-earth-50 text-earth-800 font-semibold text-base border border-earth-300 shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <MapPin className="w-4 h-4 text-earth-500" />
                <span>Explore 30+ Partners</span>
              </Link>
            </div>

            {/* Live Stats Row */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-earth-200/80">
              <div className="text-center">
                <p className="text-2xl font-black text-earth-900">6 Routes</p>
                <p className="text-xs text-earth-500 font-medium">Ranked Transparently</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-brand-700">31+ Partners</p>
                <p className="text-xs text-earth-500 font-medium">BLR, NCR & Mumbai</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-earth-900">₹ Indicative</p>
                <p className="text-xs text-earth-500 font-medium">Real Indian Pricing</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-teal-700">100% Tracked</p>
                <p className="text-xs text-earth-500 font-medium">End-to-End Verified</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ONE-CLICK INSTANT SAMPLES TEASER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-earth-200 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md mb-1.5">
                <Zap className="w-3.5 h-3.5" /> Instant Demo
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-earth-900">Try with 4 Real-World Sample Items</h2>
              <p className="text-sm text-earth-600 mt-1">One-click to see how our hybrid decision engine evaluates different material streams.</p>
            </div>
            <Link
              href="/analyze"
              className="text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 group"
            >
              Upload custom item <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {samples.map((item) => (
              <Link
                key={item.id}
                href={`/results?sample=${item.id}`}
                className="group relative bg-earth-50 hover:bg-white rounded-2xl p-4 border border-earth-200 hover:border-brand-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-white border border-earth-200/80 mb-3 flex items-center justify-center p-2 group-hover:scale-[1.02] transition-transform">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-100/60 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-base text-earth-900 mt-1.5 group-hover:text-brand-700 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-earth-500 line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-earth-200/60 flex items-center justify-between text-xs font-semibold text-brand-700">
                  <span>Run Analysis</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (Input → Process → Core logic → Output) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            System Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-earth-900">How RELOOP Works</h2>
          <p className="text-sm sm:text-base text-earth-600">
            From an old t-shirt to a broken laptop, we turn uncertainty into actionable circular value.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-earth-200 shadow-sm relative space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center font-extrabold text-lg">
              1
            </div>
            <h3 className="text-lg font-bold text-earth-900">Input</h3>
            <p className="text-xs text-earth-600 leading-relaxed">
              Upload an item photo or describe it in plain English. Specify quantity and your Indian city/area (Bengaluru, Delhi NCR, Mumbai).
            </p>
            <div className="text-[11px] font-mono text-earth-500 bg-earth-50 p-2 rounded-lg border border-earth-100">
              Photo + GPS Pin + Quantity
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-earth-200 shadow-sm relative space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-extrabold text-lg">
              2
            </div>
            <h3 className="text-lg font-bold text-earth-900">AI Inspection</h3>
            <p className="text-xs text-earth-600 leading-relaxed">
              Gemini Vision classifies item type, pure or composite materials, visible wear (Broken, Fair, Good), and returns an honest confidence score.
            </p>
            <div className="text-[11px] font-mono text-earth-500 bg-earth-50 p-2 rounded-lg border border-earth-100">
              Item Type • Materials • Wear
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-earth-200 shadow-sm relative space-y-3 ring-2 ring-brand-500/30">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-brand-500/20">
              3
            </div>
            <h3 className="text-lg font-bold text-earth-900">Decision Engine</h3>
            <p className="text-xs text-earth-600 leading-relaxed">
              Our 4-factor multi-criteria algorithm scores all 6 routes: Resale Value, Physical Feasibility, Local Partner Proximity, and Net CO2 reduction.
            </p>
            <div className="text-[11px] font-mono text-brand-700 bg-brand-50 p-2 rounded-lg border border-brand-200 font-semibold">
              Transparent 0-100 Scores
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-2xl border border-earth-200 shadow-sm relative space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-extrabold text-lg">
              4
            </div>
            <h3 className="text-lg font-bold text-earth-900">Output & Handoff</h3>
            <p className="text-xs text-earth-600 leading-relaxed">
              Clear recommendation, indicative INR price ranges, step-by-step DIY guidance, and 1-click booking with local verified partners on a map.
            </p>
            <div className="text-[11px] font-mono text-earth-500 bg-earth-50 p-2 rounded-lg border border-earth-100">
              Map Route • Price • Pickup
            </div>
          </div>
        </div>
      </section>

      {/* WHY RELOOP IS DIFFERENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-earth-900 to-earth-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="max-w-3xl space-y-4 mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Competitive Edge</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Why We Beat Simple &ldquo;Waste Identification&rdquo; Apps
            </h2>
            <p className="text-sm sm:text-base text-earth-300">
              Most sustainability apps only tell you &ldquo;This is plastic.&rdquo; RELOOP solves the real logistics puzzle:
              is it worth repairing? Who will buy it today in your neighborhood? How much cash will you get?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-earth-800/80 p-5 rounded-2xl border border-earth-700/60 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Transparent Route Comparisons</h3>
              <p className="text-xs text-earth-400 leading-relaxed">
                See exactly why Repair scored 85 while Recycle scored 77. No mysterious black boxes—every factor is visible and auditable.
              </p>
            </div>

            <div className="bg-earth-800/80 p-5 rounded-2xl border border-earth-700/60 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Real Local Ecosystem</h3>
              <p className="text-xs text-earth-400 leading-relaxed">
                Integrated with 31+ verified Indian partners: doorstep kabadiwalas, CPCB e-waste recyclers, Goonj textile centers, and repair hubs.
              </p>
            </div>

            <div className="bg-earth-800/80 p-5 rounded-2xl border border-earth-700/60 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Full Lifecycle Tracking</h3>
              <p className="text-xs text-earth-400 leading-relaxed">
                Track status from Requested → Scheduled → Collected → Recovered, measuring kilograms diverted and CO2 emissions saved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL BOTTOM CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl font-extrabold text-earth-900">Ready to Give Your Items a Better Next Life?</h2>
        <p className="text-earth-600 text-sm sm:text-base max-w-xl mx-auto">
          Start in 10 seconds. Select an item or upload a quick photo to get your customized circular route recommendation.
        </p>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-md transition-all hover:scale-105"
        >
          <span>Launch AI Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
