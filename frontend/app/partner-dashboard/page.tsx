"use client";

import React, { useState, useEffect } from "react";
import {
  Building2, CheckCircle2, Clock, Truck, ShieldCheck,
  Phone, MapPin, RefreshCw, AlertCircle, Filter
} from "lucide-react";
import { getBookings, updateRequestStatus, RecoveryRequest } from "@/lib/api";

export default function PartnerDashboardPage() {
  const [requests, setRequests] = useState<RecoveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await getBookings();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatusChange = async (
    id: string,
    newStatus: "Requested" | "Scheduled" | "Collected" | "Recovered"
  ) => {
    setUpdatingId(id);
    try {
      const updated = await updateRequestStatus(id, newStatus);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      alert("Failed to update ticket status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = requests.filter((r) => {
    if (statusFilter === "all") return true;
    return r.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-earth-200 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
            Partner Operations Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-earth-900 mt-1">
            Incoming Recovery Leads & Manifests
          </h1>
          <p className="text-sm text-earth-600 mt-0.5">
            Operational queue for verified kabadiwalas, e-waste centers, and repair clinics to manage doorstep pickups.
          </p>
        </div>

        <button
          onClick={loadRequests}
          className="p-2.5 rounded-xl border border-earth-300 hover:bg-earth-50 text-earth-700 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Leads</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["all", "Requested", "Scheduled", "Collected", "Recovered"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all capitalize shrink-0 ${
              statusFilter === status
                ? "bg-earth-900 text-white"
                : "bg-white text-earth-600 border border-earth-200 hover:bg-earth-50"
            }`}
          >
            {status === "all" ? "All Leads" : status}
          </button>
        ))}
      </div>

      {/* Leads Table / Cards */}
      {loading ? (
        <div className="py-20 text-center text-xs text-earth-500">Loading incoming manifests...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-earth-500 border border-earth-200">
          No dispatches found under this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl p-5 border border-earth-200 shadow-sm space-y-4 hover:border-brand-400 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-earth-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-earth-400 uppercase">{req.id}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                        {req.route}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-earth-900 mt-1">{req.item_type}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
                </div>

                {/* Customer & Address Details */}
                <div className="space-y-1.5 text-xs text-earth-700">
                  <p className="flex items-center justify-between">
                    <span className="text-earth-500">Customer:</span>
                    <strong className="text-earth-900">{req.user_name}</strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-earth-500">Phone:</span>
                    <a href={`tel:${req.user_phone}`} className="font-bold text-brand-700 hover:underline">
                      {req.user_phone}
                    </a>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-earth-500">Address:</span>
                    <span className="text-right max-w-[240px] truncate" title={req.user_address}>
                      {req.user_address}
                    </span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-earth-500">Estimated Weight:</span>
                    <span className="font-mono font-bold">{req.weight_kg} kg</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-earth-500">Scheduled Date:</span>
                    <span className="font-bold text-earth-800">{req.scheduled_date || "Today"}</span>
                  </p>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-3 border-t border-earth-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-earth-400 block mb-2">
                  Update Manifest Status:
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <button
                    onClick={() => handleStatusChange(req.id, "Scheduled")}
                    disabled={updatingId === req.id || req.status === "Scheduled"}
                    className={`py-1.5 px-2 rounded-lg font-bold border transition-colors ${
                      req.status === "Scheduled"
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-earth-50 border-earth-200 text-earth-700 hover:bg-earth-100"
                    }`}
                  >
                    Scheduled
                  </button>
                  <button
                    onClick={() => handleStatusChange(req.id, "Collected")}
                    disabled={updatingId === req.id || req.status === "Collected"}
                    className={`py-1.5 px-2 rounded-lg font-bold border transition-colors ${
                      req.status === "Collected"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-earth-50 border-earth-200 text-earth-700 hover:bg-earth-100"
                    }`}
                  >
                    Collected
                  </button>
                  <button
                    onClick={() => handleStatusChange(req.id, "Recovered")}
                    disabled={updatingId === req.id || req.status === "Recovered"}
                    className={`py-1.5 px-2 rounded-lg font-bold border transition-colors ${
                      req.status === "Recovered"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-earth-50 border-earth-200 text-earth-700 hover:bg-earth-100"
                    }`}
                  >
                    Recovered
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
