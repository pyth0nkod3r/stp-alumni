"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Clock, ArrowRight } from "lucide-react";
import { useRecentSearches } from "./useSearch";

export default function FloatingSearch({ isOpen, onClose, initialQuery = "" }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  
  const { recent, addSearch, removeSearch } = useRecentSearches(5);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        setQuery("");
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
        setQuery("");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    addSearch(query);
    
    // Navigate to /dashboard/search?q=...
    const searchPath = pathname.includes("/dashboard") 
      ? "/dashboard/search" 
      : "/search";
    
    router.push(`${searchPath}?q=${encodeURIComponent(query.trim())}`);
    onClose();
    setQuery("");
  };

  const handleRecentClick = (searchTerm) => {
    setQuery(searchTerm);
    addSearch(searchTerm);
    const searchPath = pathname.includes("/dashboard") 
      ? "/dashboard/search" 
      : "/search";
    router.push(`${searchPath}?q=${encodeURIComponent(searchTerm)}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/20 backdrop-blur-sm">
      <div 
        ref={containerRef}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Search Input */}
        <form onSubmit={handleSearch} className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
              isFocused ? "text-[#155DFC]" : "text-slate-400"
            }`} />
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search people, posts, events, groups..."
              className="w-full pl-12 pr-24 h-12 text-base bg-slate-50 border-slate-200 focus:bg-white focus:border-[#155DFC] focus:ring-[#155DFC]/20 rounded-xl"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 rounded border border-slate-200">
                ⌘K
              </kbd>
            </div>
          </div>
        </form>

        {/* Recent Searches */}
        {recent.length > 0 && !query && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Searches
              </h3>
              <button
                onClick={() => {
                  localStorage.removeItem("recentSearches");
                  // Force re-render by triggering state update
                  removeSearch(""); 
                }}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-1">
              {recent.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRecentClick(search)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-700">{search}</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSearch(search);
                      }}
                      className="p-1 hover:bg-slate-100 rounded transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Tips */}
        {!query && recent.length === 0 && (
          <div className="p-4 text-center text-sm text-slate-500">
            <p>Try searching for:</p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {["Class of 2020", "Networking", "Software Engineer", "New York"].map((tip) => (
                <button
                  key={tip}
                  onClick={() => handleRecentClick(tip)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-xs transition-colors"
                >
                  {tip}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}