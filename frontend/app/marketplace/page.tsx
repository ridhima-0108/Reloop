"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag, Tag, MapPin, Plus, User, Phone,
  CheckCircle, ArrowRight, X, Sparkles
} from "lucide-react";
import { getMarketplaceListings, createMarketplaceListing, MarketplaceListing } from "@/lib/api";

export default function MarketplacePage() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Listing Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [condition, setCondition] = useState("good");
  const [priceInr, setPriceInr] = useState(500);
  const [location, setLocation] = useState("Bengaluru");
  const [imageUrl, setImageUrl] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerContact, setSellerContact] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Contact Seller Dialog State
  const [contactModalListing, setContactModalListing] = useState<MarketplaceListing | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getMarketplaceListings(categoryFilter);
        setListings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categoryFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await createMarketplaceListing({
        title,
        description,
        category,
        condition,
        price_inr: priceInr,
        location,
        image_url:
          imageUrl ||
          "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
        seller_name: sellerName || "Eco Champion",
        seller_contact: sellerContact || "+91 98450 12345",
      });
      setListings([created, ...listings]);
      setIsCreateModalOpen(false);
      // Reset form
      setTitle("");
      setDescription("");
      setPriceInr(500);
    } catch (err) {
      alert("Failed to create listing.");
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ["all", "Electronics", "Textiles", "Furniture", "Books"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-earth-200 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
            Circular Secondary Market
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-earth-900 mt-1">
            Pre-Loved & Upcycled Marketplace
          </h1>
          <p className="text-sm text-earth-600 mt-0.5">
            Buy and sell functional items directly between conscious neighbors. Extending lifespan avoids 100% of manufacturing carbon.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post an Item</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 capitalize ${
              categoryFilter.toLowerCase() === cat.toLowerCase()
                ? "bg-earth-900 text-white shadow-sm"
                : "bg-white text-earth-600 border border-earth-200 hover:bg-earth-50"
            }`}
          >
            {cat === "all" ? "All Categories" : cat}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-earth-500">Loading listings...</div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-earth-500 border border-earth-200 space-y-3">
          <ShoppingBag className="w-10 h-10 mx-auto text-earth-300" />
          <p className="text-sm font-semibold text-earth-700">No items in this category yet.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="text-xs font-bold text-brand-700 underline"
          >
            Be the first to list an item!
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-earth-200 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-full h-48 bg-earth-100 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url || "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    {item.condition}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
                    {item.category}
                  </span>
                  <h3 className="font-extrabold text-sm text-earth-900 group-hover:text-brand-700 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-earth-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="flex items-center justify-between text-xs text-earth-500 mb-3 border-t border-earth-100 pt-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-earth-400" /> {item.location}
                  </span>
                  <span className="font-black text-base text-earth-900">₹{item.price_inr}</span>
                </div>

                <button
                  onClick={() => setContactModalListing(item)}
                  className="w-full py-2.5 rounded-xl bg-earth-900 hover:bg-black text-white font-bold text-xs shadow transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3 h-3" />
                  <span>Contact Seller</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE LISTING MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-earth-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-earth-100 pb-3">
              <h3 className="text-lg font-black text-earth-900">Post Item on Marketplace</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-earth-400 hover:text-earth-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-earth-700 block mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dell 24-inch IPS Monitor or Denim Jacket"
                  className="w-full rounded-xl border border-earth-300 p-2.5 text-earth-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-earth-700 block mb-1">Description & Flaws (Honest Disclosure)</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe wear, accessories included, reason for sale..."
                  className="w-full rounded-xl border border-earth-300 p-2.5 text-earth-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-earth-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-earth-300 p-2.5 text-earth-900 bg-white"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Textiles">Textiles</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Books">Books</option>
                    <option value="Appliances">Appliances</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-earth-700 block mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full rounded-xl border border-earth-300 p-2.5 text-earth-900 bg-white"
                  >
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-earth-700 block mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={priceInr}
                    onChange={(e) => setPriceInr(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-earth-300 p-2.5 text-earth-900 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-earth-700 block mb-1">City / Neighborhood</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Koramangala, Bengaluru"
                    className="w-full rounded-xl border border-earth-300 p-2.5 text-earth-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-earth-700 block mb-1">Photo Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... (or leave blank for placeholder)"
                  className="w-full rounded-xl border border-earth-300 p-2.5 text-earth-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-earth-700 block mb-1">Seller Name</label>
                  <input
                    type="text"
                    required
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full rounded-xl border border-earth-300 p-2.5 text-earth-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-earth-700 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={sellerContact}
                    onChange={(e) => setSellerContact(e.target.value)}
                    placeholder="+91 98450 00000"
                    className="w-full rounded-xl border border-earth-300 p-2.5 text-earth-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-earth-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-earth-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow"
                >
                  {submitting ? "Publishing..." : "Publish Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONTACT SELLER MODAL */}
      {contactModalListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-earth-200 space-y-4">
            <div className="flex items-center justify-between border-b border-earth-100 pb-3">
              <h3 className="font-extrabold text-base text-earth-900">Seller Contact Information</h3>
              <button
                onClick={() => setContactModalListing(null)}
                className="p-1 rounded-lg text-earth-400 hover:text-earth-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-earth-50 rounded-xl border border-earth-200">
                <p className="font-bold text-earth-900 text-sm">{contactModalListing.title}</p>
                <p className="text-brand-700 font-extrabold mt-0.5">₹{contactModalListing.price_inr}</p>
              </div>

              <div className="space-y-1.5">
                <p className="text-earth-500">Seller: <strong className="text-earth-800">{contactModalListing.seller_name}</strong></p>
                <p className="text-earth-500">Location: <strong className="text-earth-800">{contactModalListing.location}</strong></p>
                <p className="text-earth-500">Phone / WhatsApp:</p>
                <a
                  href={`tel:${contactModalListing.seller_contact}`}
                  className="block text-center py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow"
                >
                  📞 Call {contactModalListing.seller_contact}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
