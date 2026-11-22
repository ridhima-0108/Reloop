import React from "react";
import Link from "next/link";
import { Recycle, Heart, Globe, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-earth-900 text-earth-300 border-t border-earth-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold">
                <Recycle className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                RE<span className="text-brand-400">LOOP</span>
              </span>
            </div>
            <p className="text-sm text-earth-400 leading-relaxed">
              Every item has a better next life than the landfill. The AI-driven decision engine
              connecting urban waste to circular reuse, repair, resale, and recycling.
            </p>
          </div>

          {/* Quick Flow */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-earth-100 mb-3">Core Engine</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/analyze" className="hover:text-white transition-colors">
                  AI Item Inspection
                </Link>
              </li>
              <li>
                <Link href="/partners" className="hover:text-white transition-colors">
                  Verified Local Partners
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-white transition-colors">
                  Circular Marketplace
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="hover:text-white transition-colors">
                  Lifecycle Status Tracker
                </Link>
              </li>
            </ul>
          </div>

          {/* Impact & Cities */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-earth-100 mb-3">Live Hubs</h4>
            <ul className="space-y-2 text-sm text-earth-400">
              <li className="flex items-center justify-between">
                <span>Bengaluru</span>
                <span className="text-xs text-brand-400">11 Partners</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Delhi NCR</span>
                <span className="text-xs text-brand-400">10 Partners</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Mumbai</span>
                <span className="text-xs text-brand-400">10 Partners</span>
              </li>
              <li className="pt-1">
                <Link href="/impact" className="text-brand-400 hover:text-brand-300 flex items-center gap-1">
                  View Carbon Dashboard <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-earth-100 mb-3">Hackathon Architecture</h4>
            <div className="space-y-1.5 text-xs text-earth-400">
              <p>• Next.js App Router + TypeScript + Tailwind</p>
              <p>• Python FastAPI + Multi-Criteria Decision Engine</p>
              <p>• Gemini Vision AI (with Zero-Failure Demo Fallback)</p>
              <p>• Leaflet + OpenStreetMap Integration</p>
              <p>• SQLite Local Storage</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-earth-800 flex flex-col sm:flex-row items-center justify-between text-xs text-earth-500 gap-4">
          <p>© 2026 RELOOP Platform. Built for circular sustainability.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for clean Indian cities
          </p>
        </div>
      </div>
    </footer>
  );
}
