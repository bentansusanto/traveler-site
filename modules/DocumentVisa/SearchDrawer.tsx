"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Input } from "@/components/ui/input";
import { DocumentVisaItem, getLocalizedText } from "@/store/services/document-visa.service";
import { ChevronRight, History, MapPin, Search, Sparkles, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SearchDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visas: DocumentVisaItem[];
  onSelectCountry: (countryName: string) => void;
}

export const SearchDrawer = ({
  open,
  onOpenChange,
  visas,
  onSelectCountry
}: SearchDrawerProps) => {
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

  const popularCountries = [
    "Japan",
    "Schengen / Europe",
    "United States",
    "Saudi Arabia",
    "Australia",
    "South Korea",
    "Turkey"
  ];

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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh] max-h-[90vh] flex flex-col focus:outline-none rounded-t-3xl">
        <DrawerHeader className="border-b border-slate-100 p-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <DrawerClose className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
              <X className="h-4 w-4" />
            </DrawerClose>
            <div className="relative flex flex-1 items-center rounded-2xl border border-slate-200 bg-slate-50 px-3.5 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/10 transition-all">
              <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
              <Input
                type="text"
                placeholder={t("searchPlaceholderMobile")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="h-10 w-full border-none bg-transparent text-xs sm:text-sm font-medium shadow-none focus-visible:ring-0 p-0 text-slate-900"
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
          </div>
          <DrawerTitle className="sr-only">Cari Visa</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-left">
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
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer">
                        <div className="relative h-12 w-16 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                          <ImageWithFallback
                            src={item.thumbnail}
                            alt={title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
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
                        <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
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
                      className="text-[11px] font-semibold text-rose-600">
                      Hapus
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {searchHistory.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSearchQuery(item)}
                        className="rounded-lg bg-slate-50 border border-slate-200/80 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  {t("popularDestinations")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {popularCountries.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        saveHistory(c);
                        onSelectCountry(c);
                        onOpenChange(false);
                      }}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-left transition-all">
                      <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      <span className="text-xs font-semibold text-slate-800 truncate">{c}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
