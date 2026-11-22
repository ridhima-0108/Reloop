"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity, CheckCircle2, Clock, Truck, ShieldCheck,
  Leaf, Package, ArrowRight, RefreshCw, AlertCircle
} from "lucide-react";
import { getBookings, RecoveryRequest } from "@/lib/api";

const STATUS_STEPS = ["Requested", "Scheduled", "Collected", "Recovered"];

export default function TrackingPage() {
  const [requests, setRequests] = useState<RecoveryRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await getBookings();
        setRequests(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Compute live user stats
  const totalDivertedKg = requests
    .filter((r) => r.status === "Collected" || r.status === "Recovered")
    .reduce((acc, curr) => acc + curr.weight_kg, 0);

  const totalCo2Saved = requests
    .filter((r) => r.status === "Collected" || r.status === "Recovered")
    .reduce((acc, curr) => acc + curr.co2_saved_kg, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-earth-200 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
            Chain of Custody Tracking
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-earth-900 mt-1">
            Recovery Lifecycle Status
          </h1>
          <p className="text-sm text-earth-600 mt-0.5">
            Transparent milestone tracking from initial request to verified recycling, reuse, or refurbishment.
          </p>
        </div>

        <Link
          href="/analyze"
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <span>Schedule Another Item</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Aggregate Impact Header Card */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-200">Active Pipeline</p>
          <p className="text-3xl font-black">{requests.length} Items</p>
          <p className="text-xs text-brand-300">Managed through RELOOP verified network</p>
        </div>

        <div className="space-y-1 sm:border-l sm:border-brand-600/60 sm:pl-6">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-200">Total Material Diverted</p>
          <p className="text-3xl font-black">{totalDivertedKg.toFixed(1)} kg</p>
          <p className="text-xs text-brand-300">Rescued from municipal landfills</p>
        </div>

        <div className="space-y-1 sm:border-l sm:border-brand-600/60 sm:pl-6">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-200">Net CO2 Emissions Avoided</p>
          <p className="text-3xl font-black">{totalCo2Saved.toFixed(1)} kg</p>
          <p className="text-xs text-brand-300">Verified carbon offset equivalent</p>
        </div>
      </div>

      {/* Requests Timeline Cards */}
      <div className="space-y-6">
        <h3 className="font-extrabold text-base text-earth-900">Your Recovery Dispatches</h3>

        {loading ? (
          <div className="py-20 text-center text-xs text-earth-500">Loading recovery timeline...</div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-earth-500 border border-earth-200 space-y-3">
            <Package className="w-10 h-10 mx-auto text-earth-300" />
            <p className="text-sm font-semibold text-earth-700">No active dispatches yet.</p>
            <Link href="/analyze" className="text-xs font-bold text-brand-700 underline">
              Analyze and book your first item
            </Link>
          </div>
        ) : (
          requests.map((req) => {
            const currentStepIdx = STATUS_STEPS.indexOf(req.status);

            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl p-6 border border-earth-200 shadow-sm space-y-6 hover:shadow-md transition-shadow"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-earth-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-earth-400 uppercase">
                        {req.id}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                        Route: {req.route}
                      </span>
                      <span className="text-[11px] text-earth-400">
                        {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-earth-900 mt-1">{req.item_type}</h4>
                    <p className="text-xs text-earth-500 mt-0.5">
                      Partner: <strong className="text-earth-800">{req.partner_name || "Assigned Local Collector"}</strong> • Qty: {req.quantity} ({req.weight_kg} kg)
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                        req.status === "Recovered"
                          ? "bg-emerald-100 text-emerald-800"
                          : req.status === "Collected"
                          ? "bg-blue-100 text-blue-800"
                          : req.status === "Scheduled"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-earth-100 text-earth-700"
                      }`}
                    >
                      ● {req.status}
                    </span>
                    <p className="text-xs font-bold text-teal-700 mt-1">
                      🌱 {req.co2_saved_kg} kg CO2 Saved
                    </p>
                  </div>
                </div>

                {/* 4-Step Progress Tracker */}
                <div className="py-2">
                  <div className="grid grid-cols-4 relative">
                    {/* Connecting Bar */}
                    <div className="absolute top-1/2 left-[12.5%] right-[12.5%] -translate-y-1/2 h-1 bg-earth-200 -z-0">
                      <div
                        className="h-full bg-brand-600 transition-all duration-500"
                        style={{
                          width: `${(Math.max(0, currentStepIdx) / (STATUS_STEPS.length - 1)) * 100}%`,
                        }}
                      />
                    </div>

                    {STATUS_STEPS.map((step, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;

                      return (
                        <div key={step} className="flex flex-col items-center text-center relative z-10 space-y-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                              isCompleted
                                ? "bg-brand-600 text-white shadow-md shadow-brand-500/30 scale-105"
                                : "bg-earth-200 text-earth-500"
                            } ${isCurrent ? "ring-4 ring-brand-100" : ""}`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <div>
                            <p
                              className={`text-xs font-bold ${
                                isCurrent
                                  ? "text-brand-800"
                                  : isCompleted
                                  ? "text-earth-900"
                                  : "text-earth-400"
                              }`}
                            >
                              {step}
                            </p>
                            <p className="text-[10px] text-earth-400 hidden sm:block">
                              {step === "Requested" && "Ticket Created"}
                              {step === "Scheduled" && "Slot Assigned"}
                              {step === "Collected" && "Weighed at Doorstep"}
                              {step === "Recovered" && "Certified Diversion"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Logistics Notes Box */}
                <div className="bg-earth-50 rounded-2xl p-4 border border-earth-100 text-xs text-earth-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-earth-800">Logistics Notes: </span>
                    <span>{req.notes || "Standard circular handoff scheduled."}</span>
                  </div>
                  <div className="text-right shrink-0 text-earth-500">
                    Pickup Slot: <strong className="text-earth-700">{req.scheduled_date || "Today"}</strong>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
