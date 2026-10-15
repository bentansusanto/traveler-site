"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Input } from "@/components/ui/input";
import { DocumentVisaItem, getLocalizedText } from "@/store/services/document-visa.service";
import { ChevronRight, Clock, History, MapPin, Search, Sparkles, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visas: DocumentVisaItem[];
  onSelectCountry: (countryName: string) => void;
}

export const SearchModal = ({
  open,
  onOpenChange,
  visas,
  onSelectCountry
}: SearchModalProps) => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("DocumentVisa");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("visa_search_history");
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const saveHistory = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...searchHistory.filter((item) => item !== term)].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem("visa_search_history", JSON.stringify(updated));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("visa_search_history");
  };

  // Popular quick countries
  const popularCountries = [
    "Japan",
    "Schengen / Europe",
    "United States",
    "Saudi Arabia",
    "Australia",
    "South Korea",
    "Turkey"
  ];

  // Search Results
  const filteredResults = searchQuery.trim()
    ? visas.filter((item) => {
        const q = searchQuery.toLowerCase();
        const title = getLocalizedText(item.title, locale).toLowerCase();
        const country = getLocalizedText(item.country_name, locale).toLowerCase();
        const code = (item.country_code || "").toLowerCase();
        const desc = getLocalizedText(item.description, locale).toLowerCase();
        return title.includes(q) || country.includes(q) || code.includes(q) || desc.includes(q);
      })
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl border-slate-200">
        <DialogHeader className="p-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex flex-1 items-center rounded-xl bg-slate-50 border border-slate-200 px-3.5 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/10 transition-all">
              <Search className="h-4 w-4 text-slate-400 mr-2.5 shrink-0" />
              <Input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="h-10 w-full border-none bg-transparent text-sm font-medium shadow-none focus-visible:ring-0 p-0 text-slate-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <DialogTitle className="sr-only">Pencarian Visa</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5 text-left">
          {/* Active Search Results */}
          {searchQuery.trim() ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Hasil Pencarian ({filteredResults.length})
              </p>
              {filteredResults.length > 0 ? (
                <div className="space-y-1.5">
                  {filteredResults.map((item) => {
                    const title = getLocalizedText(item.title, locale);
                    const countryName = getLocalizedText(item.country_name, locale);
                    const processingTime = getLocalizedText(item.processing_time, locale);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          saveHistory(title);
                          onOpenChange(false);
                          router.push(`/${locale}/documents-visa/${item.slug || item.id}`);
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="relative h-12 w-16 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                          <ImageWithFallback
                            src={item.thumbnail}
                            alt={title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {title}
                          </h4>
                          <p className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span>{countryName}</span>
                            {processingTime && (
                              <>
                                <span>•</span>
                                <span>{processingTime}</span>
                              </>
                            )}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  {t("emptyTitle")}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Recent History */}
              {searchHistory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <History className="h-3.5 w-3.5" />
                      Pencarian Terakhir
                    </p>
                    <button
                      type="button"
                      onClick={clearHistory}
                      className="text-[11px] font-semibold text-rose-600 hover:underline">
                      Hapus Riwayat
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {searchHistory.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSearchQuery(item)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200/80 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100">
                        <span>{item}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Countries Recommendation */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  {t("popularDestinations")}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {popularCountries.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        saveHistory(c);
                        onSelectCountry(c);
                        onOpenChange(false);
                      }}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-blue-50/70 hover:border-blue-200 text-left transition-all">
                      <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      <span className="text-xs font-semibold text-slate-800 truncate">{c}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
