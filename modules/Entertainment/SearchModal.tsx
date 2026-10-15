"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Input } from "@/components/ui/input";
import { useFindAllAttractionsQuery } from "@/store/services/entertainment-attraction.service";
import { ChevronRight, History, MapPin, Search, Sparkles, Ticket, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSearch?: (term: string) => void;
  onLocationSelect?: (locationName: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  open,
  onOpenChange,
  onSelectSearch,
  onLocationSelect
}) => {
  const locale = useLocale();
  const t = useTranslations("Entertainment");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const { data: response, isLoading } = useFindAllAttractionsQuery({
    limit: 100
  });
  const attractions = response?.data || response?.datas || [];

  useEffect(() => {
    const saved = localStorage.getItem("entertainment_search_history");
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const saveSearchHistory = (query: string) => {
    if (!query.trim()) return;
    const newHistory = [query, ...searchHistory.filter((item) => item !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem("entertainment_search_history", JSON.stringify(newHistory));
  };

  const handleSelectTerm = (term: string) => {
    saveSearchHistory(term);
    onSelectSearch?.(term);
    onOpenChange(false);
  };

  const handleSelectLocation = (loc: string) => {
    saveSearchHistory(loc);
    onLocationSelect?.(loc);
    onOpenChange(false);
  };

  const getFilteredResults = () => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    return attractions
      .filter((item: any) => {
        const tr =
          item.translations?.find((t: any) => t.language_code === locale) ||
          item.translations?.[0];
        const name = (tr?.name || "").toLowerCase();
        const state = (item.state?.name || item.state_name || "").toLowerCase();
        const country = (item.country?.name || item.country_name || "").toLowerCase();
        const cat = (
          item.category_entertainment?.name ||
          item.category_entertainment_name ||
          ""
        ).toLowerCase();

        return name.includes(q) || state.includes(q) || country.includes(q) || cat.includes(q);
      })
      .slice(0, 8);
  };

  const filteredResults = getFilteredResults();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 pb-2 border-b border-slate-100">
          <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            <span>{t("searchPlaceholder")}</span>
          </DialogTitle>
          <div className="relative mt-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  handleSelectTerm(searchQuery.trim());
                }
              }}
              placeholder={t("searchPlaceholder")}
              className="pl-10 pr-10 py-5 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white text-sm"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {/* History */}
          {!searchQuery && searchHistory.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5" />
                  <span>{t("recentSearches")}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchHistory([]);
                    localStorage.removeItem("entertainment_search_history");
                  }}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700"
                >
                  {t("clear")}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectTerm(item)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600 transition-colors"
                  >
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {searchQuery && (
            <div className="space-y-2">
              {filteredResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  {t("noResultsTitle")}
                </div>
              ) : (
                filteredResults.map((item: any) => {
                  const tr =
                    item.translations?.find((t: any) => t.language_code === locale) ||
                    item.translations?.[0];
                  const name = tr?.name || "Attraction";
                  const locationName = [
                    item.state?.name || item.state_name,
                    item.country?.name || item.country_name
                  ]
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectTerm(name)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/60 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          <ImageWithFallback
                            src={item.thumbnail || "/images/hero_things_todo_mobile.png"}
                            alt={name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {name}
                          </p>
                          {locationName && (
                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                              <MapPin className="h-2.5 w-2.5 text-red-500 shrink-0" />
                              <span>{locationName}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
