"use client";

import React from "react";
import { Sparkles, ShieldCheck, Info } from "lucide-react";

interface DemoBadgeProps {
  isDemo?: boolean;
  className?: string;
}

export default function DemoBadge({ isDemo = true, className = "" }: DemoBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
        isDemo
          ? "bg-amber-50 text-amber-800 border-amber-200"
          : "bg-emerald-50 text-emerald-800 border-emerald-200"
      } ${className}`}
      title={
        isDemo
          ? "Running in Demo Mode: Using high-fidelity heuristic decision models and pre-seeded realistic partner network."
          : "Running in Live Mode: Connected to Gemini Vision API."
      }
    >
      {isDemo ? (
        <>
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-semibold">Demo Mode</span>
          <span className="hidden sm:inline text-amber-600">| Heuristic AI & Seed Network</span>
        </>
      ) : (
        <>
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-semibold">Live Vision Active</span>
          <span className="hidden sm:inline text-emerald-600">| Gemini AI</span>
        </>
      )}
    </div>
  );
}
