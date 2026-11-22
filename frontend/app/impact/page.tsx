"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3, Leaf, TrendingUp, Package, Recycle,
  CheckCircle2, Globe, ArrowRight, ShieldCheck, Zap
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from "recharts";
import { getImpactMetrics, ImpactSummary } from "@/lib/api";

const ROUTE_COLORS: { [key: string]: string } = {
  repair: "#d97706", // amber
  reuse: "#16a34a", // emerald
  resell: "#0891b2", // cyan
  donate: "#9333ea", // purple
  compost: "#65a30d", // lime
  recycle: "#2563eb", // blue
};

export default function ImpactDashboardPage() {
  const [impact, setImpact] = useState<ImpactSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getImpactMetrics();
        setImpact(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !impact) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-xs text-earth-500">
        Loading circular economy impact telemetry...
      </div>
    );
  }

  // Format data for Recharts Pie Chart
  const pieData = impact.route_breakdown.map((r) => ({
    name: r.route.charAt(0).toUpperCase() + r.route.slice(1),
    value: r.count,
    co2: r.co2_kg,
    weight: r.weight_kg,
    color: ROUTE_COLORS[r.route.toLowerCase()] || "#64748b",
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-earth-200 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
            ESG & Sustainability Telemetry
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-earth-900 mt-1">
            Circular Economy Impact Dashboard
          </h1>
          <p className="text-sm text-earth-600 mt-0.5">
            Real-time aggregate diversion analytics across Bengaluru, Delhi NCR, and Mumbai.
          </p>
        </div>

        <Link
          href="/analyze"
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow transition-all self-start sm:self-auto flex items-center gap-1.5"
        >
          <span>Divert Another Item</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 4 CORE KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Diverted */}
        <div className="bg-white rounded-3xl p-6 border border-earth-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
            <Recycle className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-earth-500">Items Diverted</p>
          <p className="text-3xl font-black text-earth-900">{impact.total_items_diverted.toLocaleString()}</p>
          <p className="text-[11px] text-brand-700 font-semibold">Rescued from landfills</p>
        </div>

        {/* Total Weight Recovered */}
        <div className="bg-white rounded-3xl p-6 border border-earth-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-earth-500">Material Recovered</p>
          <p className="text-3xl font-black text-blue-900">{impact.total_weight_kg.toLocaleString()} kg</p>
          <p className="text-[11px] text-blue-700 font-semibold">Dry scrap, pulp & bio-mass</p>
        </div>

        {/* Net CO2 Avoided */}
        <div className="bg-white rounded-3xl p-6 border border-earth-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Leaf className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-earth-500">Emissions Avoided</p>
          <p className="text-3xl font-black text-teal-900">{impact.total_co2_saved_kg.toLocaleString()} kg CO2e</p>
          <p className="text-[11px] text-teal-700 font-semibold">Verified embodied carbon saved</p>
        </div>

        {/* Active Pipeline */}
        <div className="bg-white rounded-3xl p-6 border border-earth-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-earth-500">Active Pipeline</p>
          <p className="text-3xl font-black text-amber-900">{impact.active_requests_count} Orders</p>
          <p className="text-[11px] text-amber-700 font-semibold">Pending pickup or inspection</p>
        </div>
      </div>

      {/* CHARTS SECTION (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Chart: Route Breakdown (Pie & Bars) (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-earth-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-earth-900">Recovery Route Breakdown</h3>
              <p className="text-xs text-earth-500">Distribution of items by circular destination</p>
            </div>
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
              Circular Split
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-earth-900 text-white p-2.5 rounded-xl text-xs shadow-lg space-y-1">
                          <p className="font-bold">{data.name}</p>
                          <p className="text-earth-300">Share: {data.value} items</p>
                          <p className="text-teal-300">CO2 Saved: {data.co2} kg</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Route Legend */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-earth-100 text-[11px]">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 font-medium text-earth-700">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: d.color }} />
                <span>{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Chart: Monthly Carbon Avoidance Trend (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-earth-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-earth-900">Monthly Carbon Diversion</h3>
              <p className="text-xs text-earth-500">Cumulative kilogram CO2 emissions prevented</p>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              Trend
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={impact.monthly_trend}>
                <defs>
                  <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-earth-900 text-white p-2.5 rounded-xl text-xs shadow-lg space-y-1">
                          <p className="font-bold">{data.month} 2026</p>
                          <p className="text-teal-300">Avoided: {data.co2_kg} kg CO2</p>
                          <p className="text-earth-300">Diverted: {data.weight_kg} kg scrap</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="co2_kg"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCo2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-earth-100 flex items-center justify-between text-[11px] text-earth-500">
            <span>Historical 6-month growth rate: <strong className="text-brand-700">+380%</strong></span>
            <span>Methodology: IPCC GHG Protocol Scope 3</span>
          </div>
        </div>
      </div>

      {/* RECENT VERIFIED ACTIVITIES TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-earth-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-earth-900">Recent Circular Milestones</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-earth-700">
            <thead className="bg-earth-50 text-[11px] uppercase font-bold text-earth-500 border-b border-earth-200">
              <tr>
                <th className="p-3">Ticket ID</th>
                <th className="p-3">User</th>
                <th className="p-3">Item Diverted</th>
                <th className="p-3">Route</th>
                <th className="p-3">Weight</th>
                <th className="p-3">CO2 Impact</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-100 font-medium">
              {impact.recent_activities.map((act) => (
                <tr key={act.id} className="hover:bg-earth-50/50">
                  <td className="p-3 font-mono font-bold text-earth-400">{act.id}</td>
                  <td className="p-3 font-semibold text-earth-900">{act.user_name}</td>
                  <td className="p-3">{act.item_type}</td>
                  <td className="p-3">
                    <span className="capitalize px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-bold text-[10px]">
                      {act.route}
                    </span>
                  </td>
                  <td className="p-3">{act.weight_kg} kg</td>
                  <td className="p-3 text-teal-700 font-bold">+{act.co2_saved_kg} kg</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        act.status === "Recovered"
                          ? "bg-emerald-100 text-emerald-800"
                          : act.status === "Collected"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {act.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
