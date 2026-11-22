"use client";

import React from "react";
import { X, CheckCircle, HelpCircle, Leaf, DollarSign, Wrench, MapPin } from "lucide-react";
import { RouteRecommendation } from "@/lib/api";

interface ScoreBreakdownModalProps {
  recommendation: RouteRecommendation | null;
  onClose: () => void;
}

export default function ScoreBreakdownModal({ recommendation, onClose }: ScoreBreakdownModalProps) {
  if (!recommendation) return null;

  const b = recommendation.score_breakdown;

  const metrics = [
    {
      title: "Resale Value Potential",
      score: b.resale_value_score,
      max: 25,
      icon: DollarSign,
      color: "bg-emerald-500",
      description: "Direct cash payout, salvaged parts value, or avoided replacement purchase.",
    },
    {
      title: "Physical Feasibility & Condition",
      score: b.repair_feasibility_score,
      max: 25,
      icon: Wrench,
      color: "bg-blue-500",
      description: "Match between current item physical state and required restoration effort.",
    },
    {
      title: "Local Partner Availability",
      score: b.local_availability_score,
      max: 25,
      icon: MapPin,
      color: "bg-amber-500",
      description: "Proximity of verified scrap collectors, recyclers, or workshops with doorstep pickup.",
    },
    {
      title: "Carbon & Circular Hierarchy",
      score: b.environmental_benefit_score,
      max: 25,
      icon: Leaf,
      color: "bg-teal-500",
      description: "Avoided manufacturing emissions, landfill methane diversion, and circular purity.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-earth-200 overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-earth-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">
                Rank #{recommendation.rank} Route
              </span>
              <span className="text-xs text-earth-500">Transparent Scoring Audit</span>
            </div>
            <h3 className="text-2xl font-extrabold text-earth-900 mt-1">{recommendation.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-earth-400 hover:text-earth-700 hover:bg-earth-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto py-4 space-y-6 flex-1 pr-1">
          {/* Total Score Banner */}
          <div className="bg-gradient-to-r from-brand-50 to-brand-100 border border-brand-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-brand-800 uppercase tracking-wider">Overall Circular Score</p>
              <p className="text-3xl font-black text-brand-900">{recommendation.score} <span className="text-lg font-normal text-brand-700">/ 100</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-brand-700">CO2 Saved: <strong className="text-brand-900 font-bold">{recommendation.co2_saved_kg} kg</strong></p>
              <p className="text-xs text-brand-700 mt-0.5">Indicative: <strong className="text-brand-900 font-bold">{recommendation.price_range_inr}</strong></p>
            </div>
          </div>

          {/* Why Explanation */}
          <div className="bg-earth-50 p-3.5 rounded-xl border border-earth-200">
            <h4 className="text-xs font-bold text-earth-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
              Why this score was awarded:
            </h4>
            <p className="text-sm text-earth-800 leading-relaxed">{recommendation.why}</p>
          </div>

          {/* 4 Factor Bars */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-earth-600 uppercase tracking-wider">Scoring Breakdown (25 pts each)</h4>
            {metrics.map((m) => (
              <div key={m.title} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-earth-800 flex items-center gap-1.5">
                    <m.icon className="w-3.5 h-3.5 text-earth-500" />
                    {m.title}
                  </span>
                  <span className="font-mono font-bold text-earth-900">
                    {m.score} / {m.max}
                  </span>
                </div>
                <div className="w-full bg-earth-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`${m.color} h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${(m.score / m.max) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-earth-500">{m.description}</p>
              </div>
            ))}
          </div>

          {/* Instructions */}
          {recommendation.instructions && recommendation.instructions.length > 0 && (
            <div className="border-t border-earth-100 pt-4">
              <h4 className="text-xs font-bold text-earth-700 uppercase tracking-wider mb-2">Step-by-Step Instructions</h4>
              <ul className="space-y-2">
                {recommendation.instructions.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-earth-700 leading-normal">
                    <span className="w-4 h-4 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-earth-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-earth-800 hover:bg-earth-900 text-white font-semibold text-xs transition-colors"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
}
