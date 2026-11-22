"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Recycle, MapPin, ShoppingBag, Activity, BarChart3, Building2, Sparkles, Menu, X } from "lucide-react";
import DemoBadge from "./DemoBadge";
import { fetchHealth } from "@/lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    fetchHealth().then((h) => {
      setIsDemo(h.mode === "demo" || !h.gemini_api_configured);
    });
  }, []);

  const navLinks = [
    { href: "/analyze", label: "Analyze Item", icon: Sparkles },
    { href: "/partners", label: "Find Partners", icon: MapPin },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { href: "/tracking", label: "Tracking", icon: Activity },
    { href: "/impact", label: "Impact", icon: BarChart3 },
    { href: "/partner-dashboard", label: "Partner Portal", icon: Building2 },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-earth-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Recycle className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-earth-900 group-hover:text-brand-700 transition-colors">
                RE<span className="text-brand-600">LOOP</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-wider font-semibold text-earth-500 -mt-1">
                Circular Decision Engine
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-earth-600 hover:text-earth-900 hover:bg-earth-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-brand-600" : "text-earth-400"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Status badge & CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <DemoBadge isDemo={isDemo} />
            <Link
              href="/analyze"
              className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow transition-all"
            >
              Try RELOOP
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-earth-600 hover:text-earth-900 hover:bg-earth-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-earth-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <div className="py-2 mb-2 border-b border-earth-100 flex items-center justify-between">
            <DemoBadge isDemo={isDemo} />
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive ? "bg-brand-50 text-brand-700 font-semibold" : "text-earth-700 hover:bg-earth-50"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-brand-600" : "text-earth-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              href="/analyze"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg font-semibold"
            >
              Try RELOOP Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
